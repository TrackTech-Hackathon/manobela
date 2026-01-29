import { MetricId, MetricsOutput } from '@/types/metrics';
import { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

/** Human-readable for metric labels */
const LABEL_MAPPINGS: Record<string, string> = {} as const;

/** Metric data keys that are percentages */
const PERCENTAGE_KEYS = new Set([
  'eye_closed_sustained',
  'yawn_sustained',
  'gaze_sustained',
  'phone_usage_sustained',
]);

/** Formats a metric label with a human-readable name */
const formatLabel = (key: string): string => {
  return LABEL_MAPPINGS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

/** Formats a metric value */
const formatValue = (key: string, value: unknown): string => {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    if (PERCENTAGE_KEYS.has(key)) {
      return `${Math.round(value * 100)}%`;
    }
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  }

  return String(value);
};

interface MetricDetailsProps {
  metricId: MetricId | null;
  metricsOutput: MetricsOutput | null;
}

/**
 * Displays the details for a single metric.
 */
export const MetricDetails = ({ metricId, metricsOutput }: MetricDetailsProps) => {
  const detailRows = useMemo(() => {
    if (!metricId || !metricsOutput?.[metricId]) {
      return [];
    }

    const metricData = metricsOutput[metricId];

    return Object.entries(metricData).map(([key, value]) => ({
      key,
      label: formatLabel(key),
      value: formatValue(key, value),
    }));
  }, [metricId, metricsOutput]);

  if (detailRows.length === 0) {
    return null;
  }

  return (
    <View className="px-3 py-2" accessibilityRole="summary">
      <View className="mt-1">
        {detailRows.map((row) => (
          <View
            key={row.key}
            className="flex-row justify-between py-1"
            accessibilityLabel={`${row.label}: ${row.value}`}>
            <Text className="text-xs text-muted-foreground">{row.label}</Text>
            <Text className="text-xs font-medium text-muted-foreground">{row.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
