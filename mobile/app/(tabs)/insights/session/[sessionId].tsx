import React, { useMemo, useCallback } from 'react';
import { View, FlatList } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { metrics, sessions } from '@/db/schema';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useDatabase } from '@/components/database-provider';
import { useLocalSearchParams, Stack } from 'expo-router';
import { desc, eq } from 'drizzle-orm';

import { SessionTimeRange } from '@/components/insights/session-time-range';
import { EarTrendChart } from '@/components/charts/ear-trend';
import { MarTrendChart } from '@/components/charts/mar-trend';
import { KpiCard } from '@/components/insights/kpi-card';
import { Badge } from '@/components/ui/badge';

export default function SessionDetailsScreen() {
  const { db } = useDatabase();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  const { data: sessionList } = useLiveQuery(
    db.select().from(sessions).where(eq(sessions.id, sessionId)),
    [sessionId]
  );
  const session = sessionList?.[0];

  const isActive = !!session && !session.endedAt;

  const { data: sessionMetrics = [] } = useLiveQuery(
    db
      .select()
      .from(metrics)
      .where(eq(metrics.sessionId, sessionId))
      .orderBy(desc(metrics.timestamp)),
    [sessionId]
  );

  const {
    eyeClosedPercent,
    gazeAlertPercent,
    headPoseAlertPercent,
    phoneUsagePercent,
    faceMissingPercent,
    totalYawnCount,
    earValues,
    marValues,
  } = useMemo(() => {
    const total = sessionMetrics.length;
    if (!total) {
      return {
        eyeClosedPercent: 0,
        gazeAlertPercent: 0,
        headPoseAlertPercent: 0,
        phoneUsagePercent: 0,
        faceMissingPercent: 0,
        totalYawnCount: 0,
        earValues: [] as number[],
        marValues: [] as number[],
      };
    }

    let eyeClosed = 0;
    let gazeAlerts = 0;
    let headPoseAlerts = 0;
    let phoneUsage = 0;
    let faceMissing = 0;

    const ear: number[] = [];
    const mar: number[] = [];

    // Iterate oldest → newest for chart ordering
    for (let i = sessionMetrics.length - 1; i >= 0; i--) {
      const m = sessionMetrics[i];

      if (m.eyeClosed) eyeClosed++;
      if (m.gazeAlert) gazeAlerts++;
      if (m.phoneUsage) phoneUsage++;
      if (m.faceMissing) faceMissing++;
      if (m.yawAlert || m.pitchAlert || m.rollAlert) headPoseAlerts++;

      if (typeof m.ear === 'number' && !Number.isNaN(m.ear)) {
        ear.push(m.ear);
      }
      if (typeof m.mar === 'number' && !Number.isNaN(m.mar)) {
        mar.push(m.mar);
      }
    }

    return {
      eyeClosedPercent: eyeClosed / total,
      gazeAlertPercent: gazeAlerts / total,
      headPoseAlertPercent: headPoseAlerts / total,
      phoneUsagePercent: phoneUsage / total,
      faceMissingPercent: faceMissing / total,
      // latest value due to DESC(timestamp) query
      totalYawnCount: sessionMetrics[0]?.yawnCount ?? 0,
      earValues: ear,
      marValues: mar,
    };
  }, [sessionMetrics]);

  const HeaderComponent = useCallback(() => {
    return (
      <>
        <Stack.Screen options={{ title: 'Session Details' }} />

        {session ? (
          <View className="mb-4">
            <View className="flex flex-row items-start justify-between">
              <SessionTimeRange session={session} />
              {isActive && (
                <Badge variant="destructive">
                  <Text>Active</Text>
                </Badge>
              )}
            </View>
            <Text className="text-sm text-muted-foreground">Client ID: {session.clientId}</Text>
          </View>
        ) : (
          <Text className="text-sm text-muted-foreground">Session not found.</Text>
        )}

        <KpiCard
          eyeClosedPercent={eyeClosedPercent}
          totalYawnCount={totalYawnCount}
          phoneUsagePercent={phoneUsagePercent}
          gazeAlertPercent={gazeAlertPercent}
          headPoseAlertPercent={headPoseAlertPercent}
          faceMissingPercent={faceMissingPercent}
        />

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Eye Openness Trend</CardTitle>
            <CardDescription>Lower values may indicate fatigue.</CardDescription>
            <Text className="text-xs text-muted-foreground">Based on Eye Aspect Ratio (EAR).</Text>
          </CardHeader>
          <CardContent>
            <View style={{ height: 250 }}>
              <EarTrendChart data={earValues} />
            </View>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Yawning Trend</CardTitle>
            <CardDescription>Spikes in values may indicate yawning.</CardDescription>
            <Text className="text-xs text-muted-foreground">
              Based on Mouth Aspect Ratio (MAR).
            </Text>
          </CardHeader>
          <CardContent>
            <View style={{ height: 250 }}>
              <MarTrendChart data={marValues} />
            </View>
          </CardContent>
        </Card>
      </>
    );
  }, [
    session,
    eyeClosedPercent,
    totalYawnCount,
    phoneUsagePercent,
    gazeAlertPercent,
    headPoseAlertPercent,
    faceMissingPercent,
    earValues,
    marValues,
  ]);

  return (
    <View className="flex-1 px-3 py-4">
      <FlatList
        data={[]}
        keyExtractor={() => 'empty'}
        renderItem={() => null}
        ListHeaderComponent={HeaderComponent}
      />
    </View>
  );
}
