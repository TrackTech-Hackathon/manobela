import { useEffect, useMemo, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useSettings } from '../../../hooks/useSettings';
import { validateApiBaseUrl, validateWsBaseUrl } from '@/lib/settings';

export default function ApiUrlsScreen() {
  const { settings, isLoading, saveSettings } = useSettings();

  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [wsBaseUrl, setWsBaseUrl] = useState('');
  const [errors, setErrors] = useState<{
    apiBaseUrl?: string;
    wsBaseUrl?: string;
  }>({});
  const [statusMessage, setStatusMessage] = useState('');

  // Sync local state when settings load or change
  useEffect(() => {
    setApiBaseUrl(settings.apiBaseUrl);
    setWsBaseUrl(settings.wsBaseUrl);
  }, [settings.apiBaseUrl, settings.wsBaseUrl]);

  // Clear status/errors when user edits
  useEffect(() => {
    setStatusMessage('');
    setErrors({});
  }, [apiBaseUrl, wsBaseUrl]);

  const hasChange = useMemo(() => {
    return apiBaseUrl.trim() !== settings.apiBaseUrl || wsBaseUrl.trim() !== settings.wsBaseUrl;
  }, [apiBaseUrl, wsBaseUrl, settings.apiBaseUrl, settings.wsBaseUrl]);

  const handleSave = async () => {
    const trimmedApiBaseUrl = apiBaseUrl.trim();
    const trimmedWsBaseUrl = wsBaseUrl.trim();

    const nextErrors: {
      apiBaseUrl?: string;
      wsBaseUrl?: string;
    } = {};

    if (!validateApiBaseUrl(trimmedApiBaseUrl)) {
      nextErrors.apiBaseUrl = 'Enter a valid http(s) URL.';
    }

    if (!validateWsBaseUrl(trimmedWsBaseUrl)) {
      nextErrors.wsBaseUrl = 'Enter a valid ws(s) URL.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatusMessage('');
      return;
    }

    await saveSettings({
      ...settings,
      apiBaseUrl: trimmedApiBaseUrl,
      wsBaseUrl: trimmedWsBaseUrl,
    });

    setStatusMessage('API URLs saved. Please restart the app.');
  };

  return (
    <ScrollView className="flex-1 px-4 py-4" keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: 'API' }} />

      <View className="mb-6">
        <Text className="mb-2 text-base font-semibold">API Base URL</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
          className="rounded-md border border-border bg-background px-3 py-2 text-base text-foreground"
          placeholder="https://api.example.com"
          value={apiBaseUrl}
          onChangeText={setApiBaseUrl}
        />
        {errors.apiBaseUrl ? (
          <Text className="mt-1 text-sm text-destructive">{errors.apiBaseUrl}</Text>
        ) : null}
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-base font-semibold">WebSocket Base URL</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
          className="rounded-md border border-border bg-background px-3 py-2 text-base text-foreground"
          placeholder="wss://ws.example.com"
          value={wsBaseUrl}
          onChangeText={setWsBaseUrl}
        />
        {errors.wsBaseUrl ? (
          <Text className="mt-1 text-sm text-destructive">{errors.wsBaseUrl}</Text>
        ) : null}
      </View>

      <Button className="mb-3" disabled={isLoading || !hasChange} onPress={handleSave}>
        <Text>{isLoading ? 'Loading...' : 'Save API'}</Text>
      </Button>

      {statusMessage ? <Text className="text-sm text-foreground">{statusMessage}</Text> : null}
    </ScrollView>
  );
}
