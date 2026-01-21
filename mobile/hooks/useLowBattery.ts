import { useCallback, useEffect, useRef, useState } from 'react';
import * as Battery from 'expo-battery';

type LowBatteryCallback = (level: number) => void;

/**
 * useLowBattery
 *
 * Watches the device battery level and triggers a warning callback when the level drops
 * below the specified threshold.
 *
 * The warning is emitted only once per low-battery session. If the battery rises above
 * the threshold again, the warning state resets, allowing the callback to fire again
 * on the next low-battery event.
 *
 * @param threshold - Battery level threshold (0..1). Default is 0.25 (25%).
 * @param onWarn - Callback executed when battery level goes below threshold.
 *                 Receives the battery level (0..1).
 * @param enabled - If false, disables monitoring and warnings. Default is true.
 *
 * @returns warned - boolean indicating whether the low battery warning has been issued
 *                   and is still active.
 */
export function useLowBattery(threshold = 0.7, onWarn: LowBatteryCallback, enabled = true) {
  const [warned, setWarned] = useState(false);
  const onWarnRef = useRef(onWarn);

  // Keep callback stable
  useEffect(() => {
    onWarnRef.current = onWarn;
  }, [onWarn]);

  const handleLevel = useCallback(
    (level: number) => {
      if (!enabled) return;

      const isLow = level <= threshold;

      // Warn only once while low
      if (isLow && !warned) {
        onWarnRef.current(level);
        setWarned(true);
        return;
      }

      // Reset when battery rises above threshold
      if (!isLow && warned) {
        setWarned(false);
      }
    },
    [enabled, threshold, warned]
  );

  useEffect(() => {
    let isMounted = true;

    const check = async () => {
      try {
        const level = await Battery.getBatteryLevelAsync();
        if (isMounted) handleLevel(level);
      } catch {
        // ignore errors (or handle logging)
      }
    };

    check();

    const subscription = Battery.addBatteryLevelListener((event) => {
      handleLevel(event.batteryLevel);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [handleLevel]);

  return warned;
}
