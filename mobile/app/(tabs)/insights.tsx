import React, { useCallback, useMemo, useState } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { sessions, metrics } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { sessionLogger } from '@/services/logging/session-logger';
import { useDatabase } from '@/components/database-provider';

export default function InsightsScreen() {
  const db = useDatabase();

  /**
   * Explicit revalidation trigger
   */
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Sessions (latest first)
   */
  const { data: sessionList = [] } = useLiveQuery(
    db.select().from(sessions).orderBy(desc(sessions.startedAt)),
    [refreshKey]
  );

  /**
   * Metrics (latest first)
   */
  const { data: metricsList = [] } = useLiveQuery(
    db.select().from(metrics).orderBy(desc(metrics.timestamp)),
    [refreshKey]
  );

  /**
   * Group metrics by sessionId
   */
  const metricsBySession = useMemo(() => {
    const map = new Map<string, typeof metricsList>();

    for (const m of metricsList) {
      if (!map.has(m.sessionId)) {
        map.set(m.sessionId, []);
      }
      map.get(m.sessionId)!.push(m);
    }

    return map;
  }, [metricsList]);

  /**
   * Clear handler
   */
  const clearAllData = useCallback(() => {
    Alert.alert('Clear all data?', 'This will delete all sessions and metrics permanently.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await db.delete(metrics);
            await db.delete(sessions);

            await sessionLogger.endSession();
            await sessionLogger.reset();

            setRefreshKey((k) => k + 1);
          } catch (error) {
            console.error('Failed to clear data:', error);
            Alert.alert('Error', 'Failed to clear data. Please try again.');
          }
        },
      },
    ]);
  }, []);

  return (
    <FlatList
      data={sessionList}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 24 }}
      ListHeaderComponent={
        <View className="px-3 py-2">
          <Text className="mb-4 text-lg font-bold">Insights</Text>

          <Button onPress={clearAllData} className="mb-4">
            <Text>Clear all sessions</Text>
          </Button>

          {sessionList.length === 0 && (
            <Text className="py-2 text-center text-sm text-gray-500">No sessions found.</Text>
          )}
        </View>
      }
      renderItem={({ item: session }) => {
        const sessionMetrics = metricsBySession.get(session.id) ?? [];

        return (
          <View className="mx-3 mb-4 rounded border p-3">
            {/* Session */}
            <Text className="font-semibold">Session</Text>
            <Text>ID: {session.id}</Text>
            <Text>Client: {session.clientId}</Text>
            <Text>Start: {new Date(session.startedAt).toLocaleString()}</Text>
            <Text>
              End: {session.endedAt ? new Date(session.endedAt).toLocaleString() : 'Still running'}
            </Text>
            <Text>Duration: {session.durationMs ?? '-'} ms</Text>

            {/* Metrics */}
            <Text className="mt-3 font-semibold">Metrics</Text>

            {sessionMetrics.length === 0 && (
              <Text className="py-2 text-sm text-gray-500">No metrics recorded.</Text>
            )}

            {sessionMetrics.map((m) => (
              <View key={m.id} className="mt-2 rounded border p-2">
                <Text>Time: {new Date(m.timestamp).toLocaleTimeString()}</Text>

                {/* Face */}
                <Text>Face Missing: {m.faceMissing ? 'true' : 'false'}</Text>

                {/* Eye */}
                <Text>EAR: {m.ear}</Text>
                <Text>Eye Closed: {m.eyeClosed ? 'true' : 'false'}</Text>
                <Text>Eye Closed Sustained: {m.eyeClosedSustained}</Text>
                <Text>Perclos: {m.perclos}</Text>
                <Text>Perclos Alert: {m.perclosAlert ? 'true' : 'false'}</Text>

                {/* Mouth */}
                <Text>MAR: {m.mar}</Text>
                <Text>Yawning: {m.yawning ? 'true' : 'false'}</Text>
                <Text>Yawn Sustained: {m.yawnSustained}</Text>
                <Text>Yawn Count: {m.yawnCount}</Text>

                {/* Head pose */}
                <Text>Yaw: {m.yaw}</Text>
                <Text>Pitch: {m.pitch}</Text>
                <Text>Roll: {m.roll}</Text>
                <Text>Yaw Alert: {m.yawAlert ? 'true' : 'false'}</Text>
                <Text>Pitch Alert: {m.pitchAlert ? 'true' : 'false'}</Text>
                <Text>Roll Alert: {m.rollAlert ? 'true' : 'false'}</Text>
                <Text>Head Pose Sustained: {m.headPoseSustained}</Text>

                {/* Gaze */}
                <Text>Gaze Alert: {m.gazeAlert ? 'true' : 'false'}</Text>
                <Text>Gaze Sustained: {m.gazeSustained}</Text>

                {/* Phone */}
                <Text>Phone Usage: {m.phoneUsage ? 'true' : 'false'}</Text>
                <Text>Phone Usage Sustained: {m.phoneUsageSustained}</Text>
              </View>
            ))}
          </View>
        );
      }}
    />
  );
}
