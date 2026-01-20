import logging
from collections import deque
from typing import Optional

from app.core.config import settings
from app.services.metrics.base_metric import BaseMetric, MetricOutputBase
from app.services.metrics.frame_context import FrameContext
from app.services.metrics.utils.mar import compute_mar

logger = logging.getLogger(__name__)


class YawnMetricOutput(MetricOutputBase):
    mar: Optional[float]
    yawning: bool
    yawn_progress: float
    yawn_rate: float
    yawn_rate_alert: bool


class YawnMetric(BaseMetric):
    """
    Yawn detection metric using Mouth Aspect Ratio (MAR).
    Tracks sustained mouth opening to infer yawns.

    Thresholds:
      - open_threshold (mar_threshold): when MAR >= this, we count "mouth open" frames.
      - close_threshold (mar_close_threshold): when MAR <= this, we reset and mark closed.

    Hysteresis band: (close_threshold, open_threshold)
      - If MAR is inside the band, we HOLD state (no counter increment / no reset).
        This prevents rapid toggling when MAR hovers around the threshold.

    Yawn Rate:
      - Calculated as the percentage of time spent yawning over a rolling window.
    """

    DEFAULT_MAR_THRESHOLD = 0.6
    DEFAULT_HYSTERESIS_RATIO = 0.9
    DEFAULT_MIN_YAWN_DURATION_SEC = 0.5
    DEFAULT_YAWN_RATE_THRESHOLD = 0.1
    DEFAULT_WINDOW_SEC = 30

    def __init__(
        self,
        mar_threshold: float = DEFAULT_MAR_THRESHOLD,
        mar_close_threshold: Optional[float] = None,
        hysteresis_ratio: float = DEFAULT_HYSTERESIS_RATIO,
        min_yawn_duration_sec: float = DEFAULT_MIN_YAWN_DURATION_SEC,
        yawn_rate_threshold: float = DEFAULT_YAWN_RATE_THRESHOLD,
        window_sec: int = DEFAULT_WINDOW_SEC,
    ):
        """
        Args:
            mar_threshold: MAR value above which mouth is considered open.
            mar_close_threshold: MAR value below which the mouth is considered closed.
                If None, hysteresis_ratio is used to compute this value.
            hysteresis_ratio: Ratio of close_threshold to open_threshold (0.0-1.0).
                Default 0.9 means close_threshold = 0.9 * open_threshold.
            min_yawn_duration_sec: Minimum duration in seconds to count as yawn.
            yawn_rate_threshold: Threshold for yawn rate alert.
            window_sec: Rolling window duration in seconds for yawn rate calculation.
        """

        if mar_threshold <= 0:
            raise ValueError("mar_threshold must be positive.")

        if mar_close_threshold is None:
            if not (0.0 < hysteresis_ratio < 1.0):
                raise ValueError(
                    f"hysteresis_ratio must be between (0, 1) when mar_close_threshold is None, got {hysteresis_ratio}"
                )
            effective_close_threshold = mar_threshold * hysteresis_ratio
        else:
            effective_close_threshold = mar_close_threshold

        if effective_close_threshold <= 0:
            raise ValueError(
                f"mar_close_threshold must be positive, got {mar_close_threshold}"
            )

        if effective_close_threshold >= mar_threshold:
            raise ValueError("mar_close_threshold must be less than mar_threshold")

        if min_yawn_duration_sec <= 0:
            raise ValueError("min_yawn_duration_sec must be positive.")

        if yawn_rate_threshold <= 0:
            raise ValueError("yawn_rate_threshold must be positive.")

        if window_sec <= 0:
            raise ValueError("window_sec must be positive.")

        self._mar_threshold = mar_threshold
        self._mar_close_threshold = effective_close_threshold

        # Convert duration from seconds to frames based on target FPS
        self._min_yawn_duration_frames = max(
            1, int(min_yawn_duration_sec * settings.target_fps)
        )

        self._yawn_rate_threshold = yawn_rate_threshold

        # Convert seconds to frames based on backend target FPS
        self._window_size = max(1, int(window_sec * settings.target_fps))

        # State tracking
        self._open_counter = 0
        self._yawn_active = False

        # Rolling window to track yawning state per frame
        self._yawn_history: deque[bool] = deque(maxlen=self._window_size)

    def update(self, context: FrameContext) -> YawnMetricOutput:
        landmarks = context.face_landmarks

        # If no landmarks, preserve current yawning state but don't update history
        if not landmarks:
            yawn_rate = self._calculate_yawn_rate()
            return {
                "mar": None,
                "yawning": self._yawn_active,
                "yawn_progress": min(
                    self._open_counter / self._min_yawn_duration_frames,
                    1.0,
                ),
                "yawn_rate": yawn_rate,
                "yawn_rate_alert": yawn_rate >= self._yawn_rate_threshold,
            }

        # Compute MAR
        try:
            mar = compute_mar(landmarks)
        except (IndexError, ZeroDivisionError) as e:
            logger.debug(f"MAR computation failed: {e}")
            yawn_rate = self._calculate_yawn_rate()
            return {
                "mar": None,
                "yawning": self._yawn_active,
                "yawn_progress": min(
                    self._open_counter / self._min_yawn_duration_frames,
                    1.0,
                ),
                "yawn_rate": yawn_rate,
                "yawn_rate_alert": yawn_rate >= self._yawn_rate_threshold,
            }

        if mar is None:
            yawn_rate = self._calculate_yawn_rate()
            return {
                "mar": None,
                "yawning": self._yawn_active,
                "yawn_progress": min(
                    self._open_counter / self._min_yawn_duration_frames,
                    1.0,
                ),
                "yawn_rate": yawn_rate,
                "yawn_rate_alert": yawn_rate >= self._yawn_rate_threshold,
            }

        # State machine with hysteresis
        if mar >= self._mar_threshold:
            # Mouth opening - increment counter
            self._open_counter += 1
        elif mar <= self._mar_close_threshold:
            # Mouth closed - reset state
            self._open_counter = 0
            self._yawn_active = False
        # else: hysteresis band - hold current state

        # Check if sustained opening qualifies as yawn
        if self._open_counter >= self._min_yawn_duration_frames:
            self._yawn_active = True

        # Update rolling window with current yawning state
        self._yawn_history.append(self._yawn_active)

        # Calculate yawn rate (percentage of frames yawning in window)
        yawn_rate = self._calculate_yawn_rate()

        return {
            "mar": mar,
            "yawning": self._yawn_active,
            "yawn_progress": min(
                self._open_counter / self._min_yawn_duration_frames,
                1.0,
            ),
            "yawn_rate": yawn_rate,
            "yawn_rate_alert": yawn_rate >= self._yawn_rate_threshold,
        }

    def reset(self):
        self._open_counter = 0
        self._yawn_active = False
        self._yawn_history.clear()

    def _calculate_yawn_rate(self) -> float:
        return (
            sum(self._yawn_history) / len(self._yawn_history)
            if self._yawn_history
            else 0.0
        )
