import { View, StyleSheet } from 'react-native';
import { VideoView } from 'expo-video';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { FacialLandmarkOverlay } from '@/components/facial-landmark-overlay';
import { ObjectDetectionOverlay } from '@/components/object-detection-overlay';

interface UploadPlaybackProps {
  result: {
    video_metadata: {
      fps: number;
    };
  };
  selectedVideoUri?: string;
  player: any;
  playbackAspectRatio: number;
  playbackView: { width: number; height: number };
  handlePlaybackLayout: (event: any) => void;
  overlayLandmarks?: unknown;
  overlayDetections?: unknown;
  overlayResolution?: { width: number; height: number } | null;
  canRenderOverlay: boolean;
  hasOverlayData: boolean;
  showOverlays: boolean;
  onToggleOverlays: (show: boolean) => void;
}

export function UploadPlayback({
  result,
  selectedVideoUri,
  player,
  playbackAspectRatio,
  playbackView,
  handlePlaybackLayout,
  overlayLandmarks,
  overlayDetections,
  overlayResolution,
  canRenderOverlay,
  hasOverlayData,
  showOverlays,
  onToggleOverlays,
}: UploadPlaybackProps) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-muted-foreground">
          {result.video_metadata.fps
            ? `Overlays sampled at ${result.video_metadata.fps} fps.`
            : 'Overlays sampled per frame.'}
        </Text>
        <Button
          variant="ghost"
          size="sm"
          className="p-1"
          onPress={() => onToggleOverlays(!showOverlays)}>
          <Text>{showOverlays ? 'Hide overlays' : 'Show overlays'}</Text>
        </Button>
      </View>
      <View
        className="relative overflow-hidden rounded-md border border-border bg-black"
        style={{ width: '100%', aspectRatio: playbackAspectRatio }}
        onLayout={handlePlaybackLayout}>
        {selectedVideoUri ? (
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            nativeControls
          />
        ) : null}
        {canRenderOverlay ? (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            {overlayLandmarks && Array.isArray(overlayLandmarks) ? (
              <FacialLandmarkOverlay
                landmarks={overlayLandmarks}
                videoWidth={overlayResolution?.width ?? 0}
                videoHeight={overlayResolution?.height ?? 0}
                viewWidth={playbackView.width}
                viewHeight={playbackView.height}
                mirror={false}
              />
            ) : null}
            {overlayDetections && Array.isArray(overlayDetections) ? (
              <ObjectDetectionOverlay
                detections={overlayDetections}
                videoWidth={overlayResolution?.width ?? 0}
                videoHeight={overlayResolution?.height ?? 0}
                viewWidth={playbackView.width}
                viewHeight={playbackView.height}
                mirror={false}
              />
            ) : null}
          </View>
        ) : null}
      </View>
      {!hasOverlayData ? (
        <Text className="text-xs text-muted-foreground">
          No overlay data available for this frame.
        </Text>
      ) : null}
    </View>
  );
}
