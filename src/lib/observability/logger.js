/**
 * High-performance structured logger for Devlovers platform
 * Supports JSON formatting, context sanitization, and level-based filtering.
 */

const LOG_LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  telemetry: 50,
};

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  'key',
  'apikey',
  'accesstoken',
  'refreshtoken',
]);

export function sanitizeMetadata(data, depth = 0) {
  if (depth > 4 || !data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeMetadata(item, depth + 1));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('token') || lowerKey.includes('secret')) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeMetadata(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

class StructuredLogger {
  constructor(options = {}) {
    this.service = options.service || 'devlovers-platform';
    this.environment = options.environment || process.env.NODE_ENV || 'production';
    this.minLevel = options.minLevel || (this.environment === 'test' ? 'error' : 'info');
  }

  _format(level, message, meta = {}) {
    return {
      timestamp: new Date().toISOString(),
      service: this.service,
      environment: this.environment,
      level: level.toUpperCase(),
      message,
      context: sanitizeMetadata(meta),
    };
  }

  _write(level, message, meta) {
    if (LOG_LEVELS[level] < LOG_LEVELS[this.minLevel]) return;

    const payload = this._format(level, message, meta);
    const jsonString = JSON.stringify(payload);

    if (level === 'error') {
      console.error(jsonString);
    } else if (level === 'warn') {
      console.warn(jsonString);
    } else {
      console.log(jsonString);
    }

    return payload;
  }

  debug(message, meta) {
    return this._write('debug', message, meta);
  }

  info(message, meta) {
    return this._write('info', message, meta);
  }

  warn(message, meta) {
    return this._write('warn', message, meta);
  }

  error(message, meta) {
    return this._write('error', message, meta);
  }

  telemetry(eventName, properties = {}) {
    return this._write('telemetry', `[TELEMETRY] ${eventName}`, properties);
  }
}

export const logger = new StructuredLogger();
export { StructuredLogger };
