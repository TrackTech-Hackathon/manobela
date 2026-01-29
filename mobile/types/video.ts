import type { ObjectDetection } from './inference';

export type SelectedVideo = {
  uri: string;
  name: string;
  sizeBytes: number;
  durationMs?: number;
  mimeType: string;
};

export type VideoFrameAggregate = {
  resolution: { width: number; height: number } | null;
  face_landmarks: number[] | null;
  object_detections: ObjectDetection[] | null;
  metrics: Record<string, unknown> | null;
  thumbnail_base64: string | null;
};

export type VideoFrameGroup = {
  bucket_index: number;
  start_sec: number;
  end_sec: number;
  frame_count: number;
  aggregate: VideoFrameAggregate;
};

export type VideoProcessingResponse = {
  video_metadata: {
    duration_sec: number;
    total_frames_processed: number;
    fps: number;
    resolution: { width: number; height: number };
  };
  groups: VideoFrameGroup[];
  frames?: VideoFrameResult[];
};

export type VideoFrameResult = {
  timestamp: string;
  frame_number: number;
  resolution: { width: number; height: number };
  face_landmarks: number[] | null;
  object_detections: ObjectDetection[] | null;
  metrics: Record<string, unknown> | null;
  thumbnail_base64: string | null;
};
