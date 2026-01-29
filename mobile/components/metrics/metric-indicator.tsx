import colors from 'tailwindcss/colors';
import { Text } from '@/components/ui/text';
import { Pressable, View } from 'react-native';
import { ReactNode } from 'react';

const CIRCLE_SIZE = 56; // ~ h-14 w-14

const getIconColor = (isDisabled: boolean, isWarning: boolean): string => {
  if (isDisabled) return colors.gray[500];
  if (isWarning) return colors.red[500];
  return colors.gray[500];
};

const getContainerClasses = (isDisabled: boolean, isWarning: boolean): string => {
  if (isDisabled) return 'border-border bg-muted';
  if (isWarning) return 'border-red-400 bg-red-200 dark:border-red-600 dark:bg-red-900';
  return 'border-border bg-accent';
};

interface MetricIndicatorProps {
  icon: (props: { size: number; color: string }) => ReactNode;
  label: string;
  isWarning: boolean;
  fillRatio?: number;
  isDisabled: boolean;
  isSelected: boolean;
  onPress: () => void;
}

/**
 * Indicator for a single metric.
 *
 * Indicates whether the metric is warning or not,
 * and optionally fills the circle with a percentage.
 */
export const MetricIndicator = ({
  icon,
  label,
  isWarning,
  fillRatio,
  isDisabled,
  isSelected,
  onPress,
}: MetricIndicatorProps) => {
  const effectiveWarning = !isDisabled && isWarning;
  const effectiveFill = !isDisabled && typeof fillRatio === 'number' ? fillRatio * CIRCLE_SIZE : 0;

  const iconColor = getIconColor(isDisabled, effectiveWarning);
  const containerClasses = getContainerClasses(isDisabled, effectiveWarning);
  const selectionClasses = isSelected ? 'border-4' : '';

  return (
    <View className="items-center">
      <Pressable
        role="button"
        disabled={isDisabled}
        className={`relative h-14 w-14 overflow-hidden rounded-full border ${selectionClasses} ${containerClasses}`}
        onPress={onPress}
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{
          selected: isSelected,
          disabled: isDisabled,
        }}>
        {effectiveFill > 0 && (
          <View
            className="absolute bottom-0 left-0 right-0 bg-red-500/20"
            style={{ height: effectiveFill }}
            accessible={false}
          />
        )}

        <View className="absolute inset-0 items-center justify-center">
          {icon({ size: 24, color: iconColor })}
        </View>
      </Pressable>

      <Text
        className={`mt-1 text-xs ${isDisabled ? 'text-muted-foreground' : 'text-accent-foreground'}`}
        accessibilityLabel={`${label} metric`}>
        {label}
      </Text>
    </View>
  );
};
