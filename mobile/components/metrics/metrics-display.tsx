import { View } from 'react-native';
import { SessionState } from '@/hooks/useMonitoringSession';
import { MetricId, MetricsOutput } from '@/types/metrics';
import { useMemo, useState, useCallback } from 'react';
import { MetricIndicator } from './metric-indicator';
import { MetricDetails } from './metric-details';
import { METRIC_DISPLAY_CONFIGS } from './metric-display-configs';

interface MetricsDisplayProps {
  sessionState: SessionState;
  metricsOutput: MetricsOutput | null;
}

/**
 * Displays the metrics.
 */
export const MetricsDisplay = ({ sessionState, metricsOutput }: MetricsDisplayProps) => {
  // Stores the currently selected metric to display
  const [selectedMetric, setSelectedMetric] = useState<MetricId | null>(null);

  // Stores whether the metrics display is disabled
  const isDisabled = sessionState !== 'active';
  const eyeClosedSustained = metricsOutput?.eye_closure?.eye_closed_sustained ?? 0;

  /** Utility function to toggle the selected metric */
  const toggleMetric = useCallback((metricId: MetricId) => {
    setSelectedMetric((prev) => (prev === metricId ? null : metricId));
  }, []);

  // List of metric IDs to display
  const metricIds = useMemo(() => Object.keys(METRIC_DISPLAY_CONFIGS) as MetricId[], []);

  return (
    <View className="mb-4 px-2">
      {/* Metric indicators */}
      <View className="flex-row justify-between" accessibilityRole="toolbar">
        {metricIds.map((metricId) => {
          // Get the configuration for the metric
          const config = METRIC_DISPLAY_CONFIGS[metricId];
          // Get the metric data
          const metricData = metricsOutput?.[metricId];
          const suppressGazeWarning = metricId === 'gaze' && eyeClosedSustained > 0;

          return (
            <MetricIndicator
              key={metricId}
              icon={config.icon}
              label={config.label}
              isWarning={suppressGazeWarning ? false : config.getWarningState(metricData)}
              fillRatio={config.getFillRatio?.(metricData)}
              isDisabled={isDisabled}
              isSelected={selectedMetric === metricId}
              onPress={() => toggleMetric(metricId)}
            />
          );
        })}
      </View>

      {/* Details for the selected metric */}
      {!isDisabled && <MetricDetails metricId={selectedMetric} metricsOutput={metricsOutput} />}
    </View>
  );
};
