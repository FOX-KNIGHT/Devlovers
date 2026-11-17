/**
 * OpenTelemetry & Sentry-compatible Telemetry Engine for Devlovers Platform
 */

import { logger, sanitizeMetadata } from './logger.js';

class TelemetryRegistry {
  constructor() {
    this.metrics = new Map();
    this.events = [];
    this.exceptions = [];
    this.maxHistory = 100;
  }

  captureException(error, context = {}) {
    const errorRecord = {
      id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      name: error?.name || 'Error',
      message: error?.message || String(error),
      stack: error?.stack || null,
      context: sanitizeMetadata(context),
    };

    this.exceptions.unshift(errorRecord);
    if (this.exceptions.length > this.maxHistory) {
      this.exceptions.pop();
    }

    logger.error(`Exception captured: ${errorRecord.message}`, {
      errorId: errorRecord.id,
      name: errorRecord.name,
      context: errorRecord.context,
    });

    return errorRecord;
  }

  recordMetric(name, value, unit = 'ms', tags = {}) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        name,
        unit,
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
        latest: value,
        tags: sanitizeMetadata(tags),
      });
    }

    const metric = this.metrics.get(name);
    metric.count += 1;
    metric.sum += Number(value);
    metric.min = Math.min(metric.min, Number(value));
    metric.max = Math.max(metric.max, Number(value));
    metric.latest = Number(value);
    metric.avg = Number((metric.sum / metric.count).toFixed(2));

    return metric;
  }

  trackEvent(eventName, properties = {}) {
    const eventRecord = {
      name: eventName,
      timestamp: new Date().toISOString(),
      properties: sanitizeMetadata(properties),
    };

    this.events.unshift(eventRecord);
    if (this.events.length > this.maxHistory) {
      this.events.pop();
    }

    logger.telemetry(eventName, properties);
    return eventRecord;
  }

  getMetricsSnapshot() {
    const snapshot = {};
    for (const [key, metric] of this.metrics.entries()) {
      snapshot[key] = { ...metric };
    }
    return snapshot;
  }

  getRecentErrors(limit = 10) {
    return this.exceptions.slice(0, limit);
  }

  getRecentEvents(limit = 10) {
    return this.events.slice(0, limit);
  }

  clear() {
    this.metrics.clear();
    this.events = [];
    this.exceptions = [];
  }
}

export const telemetry = new TelemetryRegistry();
export { TelemetryRegistry };
