'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/observability/web-vitals.js';

export function WebVitalsTelemetry() {
  useEffect(() => {
    const cleanup = initWebVitals((metric) => {
      if (process.env.NODE_ENV === 'development') {
        const color = metric.rating === 'good' ? '#00FF9D' : metric.rating === 'needs-improvement' ? '#FF9E00' : '#FF0055';
        console.debug(
          `%c[Web Vitals] ${metric.name}: ${metric.value} (${metric.rating})`,
          `color: ${color}; font-weight: bold;`
        );
      }
    });

    return () => {
      cleanup?.();
    };
  }, []);

  return null;
}

export default WebVitalsTelemetry;
