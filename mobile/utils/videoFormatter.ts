export const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(1)} ${units[index]}`;
};

export const formatDuration = (durationMs?: number) => {
  if (!durationMs) return 'Unknown';
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const formatJsonPreview = (value: unknown, maxLength = 240) => {
  if (value === null || value === undefined) return 'null';
  const json = JSON.stringify(value);
  if (!json) return 'null';
  if (json.length <= maxLength) return json;
  return `${json.slice(0, maxLength)}...`;
};

export const formatJsonFull = (value: unknown) => {
  if (value === null || value === undefined) return 'null';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return 'null';
  }
};

export const parseTimestampSeconds = (timestamp: string) => {
  const match = timestamp.match(/^(\d+):(\d+):(\d+)\.(\d{1,3})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const millis = Number(match[4].padEnd(3, '0'));
  if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) return null;
  return hours * 3600 + minutes * 60 + seconds + millis / 1000;
};
