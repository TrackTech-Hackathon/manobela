import { useCallback, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { useCamera } from '@/hooks/useCamera';
import { useMonitoringSession } from '@/hooks/useMonitoringSession';
import { MediaStreamView } from '@/components/media-stream-view';
import { ConnectionStatus } from '@/components/connection-status';
import { MonitoringControls } from '@/components/monitoring-controls';
import { InferenceDisplay } from '@/components/inference-display';
import { Stack } from 'expo-router';


import {useSettings} from '@/hooks/useSettings';

export default function MonitorScreen() {
  const { localStream } = useCamera();
  const {settings} = useSettings();
  const wsUrl = useMemo(() =>{
    const baseUrl = settings.wsBaseUrl || process.env.EXPO_PUBLIC_WS_BASE || ''; // If we cant find just return blank or ''
    return baseUrl ? `${baseUrl}/driver-monitoring` : '';
  },[settings.wsBaseUrl]);


  const {
    sessionState,
    inferenceData,
    clientId,
    transportStatus,
    connectionStatus,
    error,
    hasCamera,
    start,
    stop,
  } = useMonitoringSession({
    url: wsUrl,
    stream: localStream,
  });

  // Start/stop toggle
  const handleToggle = useCallback(() => {
    if (sessionState === 'idle') {
      start();
    } else if (sessionState === 'active') {
      stop();
    }
  }, [sessionState, start, stop]);

  return (
    <ScrollView className="flex-1 px-4 py-4">
      <Stack.Screen options={{ title: 'Monitor' }} />

      <ConnectionStatus
        sessionState={sessionState}
        clientId={clientId}
        connectionStatus={connectionStatus}
        transportStatus={transportStatus}
        error={error}
      />

      <View className="mb-4 h-96 w-full">
        <MediaStreamView
          stream={localStream}
          sessionState={sessionState}
          inferenceData={inferenceData}
        />
      </View>

      <MonitoringControls
        sessionState={sessionState}
        hasCamera={hasCamera}
        onToggle={handleToggle}
      />

      <InferenceDisplay sessionState={sessionState} data={inferenceData} />
    </ScrollView>
  );
}
