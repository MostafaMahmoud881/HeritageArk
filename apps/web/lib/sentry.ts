export function captureError(error: Error, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') {
    const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (sentryDsn) {
      fetch(sentryDsn, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          ...context,
        }),
      }).catch(() => {});
    }
  }
  console.error('[Error]', error.message, context || '');
}

export function captureMessage(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  if (process.env.NODE_ENV === 'production') {
    const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (sentryDsn) {
      fetch(sentryDsn, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, level, timestamp: new Date().toISOString() }),
      }).catch(() => {});
    }
  }
  console[level](`[${level.toUpperCase()}]`, message);
}
