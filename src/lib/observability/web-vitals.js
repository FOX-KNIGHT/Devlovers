/**
 * Core Web Vitals RUM (Real User Monitoring) Tracker for Devlovers
 * Tracks LCP, INP, CLS, FCP, and TTFB against industry performance benchmarks.
 */

import { telemetry } from './telemetry.js';

export const WEB_VITALS_BENCHMARKS = {
  LCP: { good: 1200, poor: 2500, unit: 'ms' },
  INP: { good: 50, poor: 200, unit: 'ms' },
  CLS: { good: 0.1, poor: 0.25, unit: 'score' },
  FCP: { good: 800, poor: 1800, unit: 'ms' },
  TTFB: { good: 200, poor: 600, unit: 'ms' },
};

export function evaluateWebVital(name, value) {
  const benchmark = WEB_VITALS_BENCHMARKS[name];
  if (!benchmark) return 'unknown';

  if (value <= benchmark.good) return 'good';
  if (value <= benchmark.poor) return 'needs-improvement';
  return 'poor';
}

export function reportMetric(name, value, id = '') {
  const rating = evaluateWebVital(name, value);
  const benchmark = WEB_VITALS_BENCHMARKS[name] || { unit: 'ms' };

  telemetry.recordMetric(`web_vitals.${name.toLowerCase()}`, value, benchmark.unit, {
    rating,
    metricId: id,
  });

  telemetry.trackEvent('web_vitals_report', {
    metric: name,
    value,
    rating,
    id,
  });

  return { name, value, rating };
}

export function initWebVitals(onReport) {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
    return () => {};
  }

  const observers = [];

  // Helper to observe performance entry types safely
  const createObserver = (type, handler) => {
    try {
      if (PerformanceObserver.supportedEntryTypes?.includes(type)) {
        const po = new PerformanceObserver((list) => {
          list.getEntries().forEach(handler);
        });
        po.observe({ type, buffered: true });
        observers.push(po);
      }
    } catch {
      // Graceful fallback for restricted browser contexts
    }
  };

  // 1. Largest Contentful Paint (LCP)
  createObserver('largest-contentful-paint', (entry) => {
    const value = Math.round(entry.startTime);
    const metric = reportMetric('LCP', value, entry.id);
    onReport?.(metric);
  });

  // 2. Cumulative Layout Shift (CLS)
  let clsScore = 0;
  createObserver('layout-shift', (entry) => {
    if (!entry.hadRecentInput) {
      clsScore += entry.value;
      const metric = reportMetric('CLS', Number(clsScore.toFixed(3)));
      onReport?.(metric);
    }
  });

  // 3. First Contentful Paint (FCP)
  createObserver('paint', (entry) => {
    if (entry.name === 'first-contentful-paint') {
      const value = Math.round(entry.startTime);
      const metric = reportMetric('FCP', value);
      onReport?.(metric);
    }
  });

  // 4. Navigation Timing (TTFB)
  try {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      const nav = navEntries[0];
      const ttfb = Math.round(nav.responseStart - nav.requestStart);
      if (ttfb >= 0) {
        const metric = reportMetric('TTFB', ttfb);
        onReport?.(metric);
      }
    }
  } catch {
    // Navigation timing fallback
  }

  return () => {
    observers.forEach((obs) => obs.disconnect());
  };
}
