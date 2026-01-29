import { useEffect, useRef } from 'react';
import { AlertManager } from '@/services/alerts/alert-manager';
import { MetricsOutput } from '@/types/metrics';

interface UseAlertsProps {
  metrics: MetricsOutput | null;
  enabled: boolean;
  enableSpeechAlerts: boolean;
  enableHapticAlerts: boolean;
}

/**
 * Hook to manage audio alerts based on monitoring metrics.
 *
 * @param metrics - Current metrics output from inference
 * @param enabled - Whether alerts are enabled (typically tied to session state)
 * @param enableSpeechAlerts - Whether speech alerts are enabled
 * @param enableHapticAlerts - Whether haptic alerts are enabled
 */
export function useAlerts({
  metrics,
  enabled,
  enableSpeechAlerts,
  enableHapticAlerts,
}: UseAlertsProps) {
  const alertManagerRef = useRef<AlertManager | null>(null);

  // Initialize alert manager
  useEffect(() => {
    alertManagerRef.current = new AlertManager(enableSpeechAlerts, enableHapticAlerts);

    return () => {
      alertManagerRef.current?.stop();
      alertManagerRef.current = null;
    };
  }, []);

  // Update preferences when they change
  useEffect(() => {
    alertManagerRef.current?.setPreferences(enableSpeechAlerts, enableHapticAlerts);
  }, [enableSpeechAlerts, enableHapticAlerts]);

  // Process metrics when they update
  useEffect(() => {
    if (!enabled || !alertManagerRef.current || !metrics) {
      return;
    }

    alertManagerRef.current.processMetrics(metrics);
  }, [metrics, enabled]);

  // Start/stop alerts when enabled changes
  useEffect(() => {
    if (!alertManagerRef.current) return;

    if (enabled) {
      alertManagerRef.current.start();
    } else {
      alertManagerRef.current.stop();
    }
  }, [enabled]);
}
