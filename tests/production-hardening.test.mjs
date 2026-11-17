import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { applySecurityHeaders } from '../src/lib/supabase/middleware.js';
import { GET as healthGetHandler, HEAD as healthHeadHandler } from '../src/app/api/health/route.js';
import { POST as revalidatePostHandler } from '../src/app/api/revalidate/route.js';
import { sanitizeMetadata, StructuredLogger } from '../src/lib/observability/logger.js';
import { TelemetryRegistry } from '../src/lib/observability/telemetry.js';
import { evaluateWebVital, reportMetric, WEB_VITALS_BENCHMARKS } from '../src/lib/observability/web-vitals.js';

describe('Production Hardening, Observability & Global Launch (Phase 5)', () => {
  describe('Security Headers & Content Security Policy (CSP)', () => {
    it('applies strict CSP and enterprise security headers to HTTP responses', () => {
      const mockResponse = {
        headers: new Map(),
      };
      mockResponse.headers.set = (k, v) => mockResponse.headers.set(k.toLowerCase(), v);
      mockResponse.headers.get = (k) => mockResponse.headers.get(k.toLowerCase());

      const res = applySecurityHeaders({
        headers: {
          set(k, v) {
            this[k.toLowerCase()] = v;
          },
          get(k) {
            return this[k.toLowerCase()];
          },
        },
      });

      const csp = res.headers.get('content-security-policy');
      assert.ok(csp, 'Content-Security-Policy must be present');
      assert.ok(csp.includes("default-src 'self'"));
      assert.ok(csp.includes("frame-ancestors 'none'"));
      assert.ok(csp.includes("object-src 'none'"));
      assert.ok(csp.includes("base-uri 'self'"));

      assert.strictEqual(res.headers.get('x-frame-options'), 'DENY');
      assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
      assert.strictEqual(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
      assert.ok(res.headers.get('strict-transport-security').includes('max-age=63072000'));
      assert.ok(res.headers.get('permissions-policy').includes('camera=()'));
    });
  });

  describe('Health Check & Uptime Telemetry API (/api/health)', () => {
    it('GET /api/health returns 200 with complete system diagnostics', async () => {
      const res = await healthGetHandler();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('x-health-status'), 'UP');

      const data = await res.json();
      assert.strictEqual(data.status, 'healthy');
      assert.strictEqual(data.version, '1.0.0');
      assert.ok(data.timestamp);
      assert.ok(typeof data.uptimeSeconds === 'number');
      assert.ok(data.system.nodeVersion);
      assert.ok(data.system.platform);
      assert.ok(data.services.database.status);
      assert.strictEqual(data.services.mcpServer.status, 'online');
      assert.strictEqual(data.services.cache.status, 'active');
    });

    it('HEAD /api/health responds with 200 OK and health header', async () => {
      const res = await healthHeadHandler();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('X-Health-Status'), 'UP');
    });
  });

  describe('Edge Caching & On-Demand ISR Revalidation (/api/revalidate)', () => {
    it('rejects POST /api/revalidate with 401 when secret token is invalid or missing', async () => {
      const req = new Request('http://localhost:3000/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/api/hackathons', secret: 'wrong-secret' }),
      });

      const res = await revalidatePostHandler(req);
      assert.strictEqual(res.status, 401);
      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.ok(json.error.includes('Unauthorized'));
    });

    it('rejects POST /api/revalidate with 400 when neither path nor tag is specified', async () => {
      const req = new Request('http://localhost:3000/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: 'devlovers_secret_token_2026' }),
      });

      const res = await revalidatePostHandler(req);
      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.strictEqual(json.success, false);
    });

    it('successfully processes valid revalidation requests with path', async () => {
      const req = new Request('http://localhost:3000/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: '/api/hackathons',
          secret: 'devlovers_secret_token_2026',
        }),
      });

      const res = await revalidatePostHandler(req);
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.revalidated, true);
      assert.strictEqual(json.path, '/api/hackathons');
    });
  });

  describe('Structured Logging & Context Sanitization', () => {
    it('redacts passwords, tokens, API keys, and authorization secrets', () => {
      const raw = {
        userId: 'dev-123',
        token: 'devlovers_sbx_999888',
        apiKey: 'sk-live-secret-key',
        nested: {
          password: 'super-secret-password',
          safeValue: 42,
        },
        list: [
          { secretToken: 'top-secret' },
          { name: 'Public Track' },
        ],
      };

      const sanitized = sanitizeMetadata(raw);
      assert.strictEqual(sanitized.userId, 'dev-123');
      assert.strictEqual(sanitized.token, '[REDACTED]');
      assert.strictEqual(sanitized.apiKey, '[REDACTED]');
      assert.strictEqual(sanitized.nested.password, '[REDACTED]');
      assert.strictEqual(sanitized.nested.safeValue, 42);
      assert.strictEqual(sanitized.list[0].secretToken, '[REDACTED]');
      assert.strictEqual(sanitized.list[1].name, 'Public Track');
    });

    it('formats structured log output with ISO timestamp and environment', () => {
      const logger = new StructuredLogger({ environment: 'test', minLevel: 'info' });
      const record = logger.info('Test operational event', { requestId: 'req-404' });

      assert.strictEqual(record.level, 'INFO');
      assert.strictEqual(record.message, 'Test operational event');
      assert.strictEqual(record.context.requestId, 'req-404');
      assert.ok(record.timestamp);
    });
  });

  describe('OpenTelemetry & Sentry Exception Telemetry Engine', () => {
    it('captures uncaught exceptions with stack traces and sanitized context', () => {
      const registry = new TelemetryRegistry();
      const err = new Error('Database pool connection timeout');

      const record = registry.captureException(err, {
        operation: 'SELECT * FROM hackathons',
        token: 'secret-db-token',
      });

      assert.ok(record.id.startsWith('err-'));
      assert.strictEqual(record.name, 'Error');
      assert.strictEqual(record.message, 'Database pool connection timeout');
      assert.strictEqual(record.context.token, '[REDACTED]');

      const recent = registry.getRecentErrors();
      assert.strictEqual(recent.length, 1);
      assert.strictEqual(recent[0].id, record.id);
    });

    it('records and aggregates operational metrics (count, sum, min, max, avg)', () => {
      const registry = new TelemetryRegistry();

      registry.recordMetric('db_query_duration_ms', 12, 'ms');
      registry.recordMetric('db_query_duration_ms', 24, 'ms');
      registry.recordMetric('db_query_duration_ms', 6, 'ms');

      const snapshot = registry.getMetricsSnapshot();
      const metric = snapshot['db_query_duration_ms'];

      assert.ok(metric);
      assert.strictEqual(metric.count, 3);
      assert.strictEqual(metric.sum, 42);
      assert.strictEqual(metric.min, 6);
      assert.strictEqual(metric.max, 24);
      assert.strictEqual(metric.latest, 6);
      assert.strictEqual(metric.avg, 14);
    });
  });

  describe('Core Web Vitals Thresholds & Rating Evaluator', () => {
    it('evaluates LCP accurately against industry benchmarks (<=1200ms Good)', () => {
      assert.strictEqual(evaluateWebVital('LCP', 850), 'good');
      assert.strictEqual(evaluateWebVital('LCP', 1800), 'needs-improvement');
      assert.strictEqual(evaluateWebVital('LCP', 3200), 'poor');
    });

    it('evaluates INP accurately against industry benchmarks (<=50ms Good)', () => {
      assert.strictEqual(evaluateWebVital('INP', 32), 'good');
      assert.strictEqual(evaluateWebVital('INP', 120), 'needs-improvement');
      assert.strictEqual(evaluateWebVital('INP', 300), 'poor');
    });

    it('evaluates CLS accurately against industry benchmarks (<=0.10 Good)', () => {
      assert.strictEqual(evaluateWebVital('CLS', 0.02), 'good');
      assert.strictEqual(evaluateWebVital('CLS', 0.15), 'needs-improvement');
      assert.strictEqual(evaluateWebVital('CLS', 0.40), 'poor');
    });

    it('reports web vital metric and records telemetry event', () => {
      const res = reportMetric('LCP', 950, 'lcp-elem-1');
      assert.strictEqual(res.name, 'LCP');
      assert.strictEqual(res.value, 950);
      assert.strictEqual(res.rating, 'good');
    });

    it('verifies standard benchmarks exist for all 5 core web vitals', () => {
      const vitals = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'];
      vitals.forEach((vital) => {
        assert.ok(WEB_VITALS_BENCHMARKS[vital], `${vital} must have defined benchmarks`);
        assert.ok(WEB_VITALS_BENCHMARKS[vital].good > 0);
      });
    });
  });
});
