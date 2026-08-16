export function reportWebVitals(metric: {
  name: string;
  value: number;
  rating?: string;
  id?: string;
  delta?: number;
  entries?: PerformanceEntry[];
}) {
  if (process.env.NODE_ENV === 'production') {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (gaId && typeof navigator !== 'undefined') {
      navigator.sendBeacon?.(
        '/api/analytics',
        JSON.stringify({
          event: 'web_vital',
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          id: metric.id,
        }),
      );
    }
  }
}
