export function getErrorText(err: unknown): string {
  if (!err) return '';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;

  const anyErr = err as any;
  if (typeof anyErr?.message === 'string') return anyErr.message;
  if (typeof anyErr?.reason === 'string') return anyErr.reason;
  if (typeof anyErr?.type === 'string') return anyErr.type;

  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}
