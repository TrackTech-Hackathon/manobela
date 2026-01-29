import { MetricId } from '@/types/metrics';
import { ReactNode } from 'react';
import { Fontisto, MaterialCommunityIcons } from '@expo/vector-icons';

export interface MetricConfig {
  icon: (props: { size: number; color: string }) => ReactNode;
  label: string;
  getWarningState: (data: any) => boolean;
  getFillRatio?: (data: any) => number | undefined;
}

/** Display configuration for each metric */
export const METRIC_DISPLAY_CONFIGS: Record<MetricId, MetricConfig> = {
  eye_closure: {
    icon: ({ size, color }) => <MaterialCommunityIcons name="eye" size={size} color={color} />,
    label: 'Eyes',
    getWarningState: (data) => data?.eye_closed === true,
    getFillRatio: (data) => data?.eye_closed_sustained,
  },
  yawn: {
    icon: ({ size, color }) => <Fontisto name="open-mouth" size={size} color={color} />,
    label: 'Yawn',
    getWarningState: (data) => data?.yawning === true,
    getFillRatio: (data) => data?.yawn_sustained,
  },
  head_pose: {
    icon: ({ size, color }) => <MaterialCommunityIcons name="head" size={size} color={color} />,
    label: 'Head',
    getWarningState: (data) => Boolean(data?.yaw_alert || data?.pitch_alert || data?.roll_alert),
    getFillRatio: (data) => data?.head_pose_sustained,
  },
  gaze: {
    icon: ({ size, color }) => <MaterialCommunityIcons name="bullseye" size={size} color={color} />,
    label: 'Gaze',
    getWarningState: (data) => data?.gaze_alert,
    getFillRatio: (data) => data?.gaze_sustained,
  },
  phone_usage: {
    icon: ({ size, color }) => (
      <MaterialCommunityIcons name="cellphone" size={size} color={color} />
    ),
    label: 'Phone',
    getWarningState: (data) => data?.phone_usage,
    getFillRatio: (data) => data?.phone_usage_sustained,
  },
} as const;
