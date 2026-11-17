/**
 * Next.js Instrumentation Hook for Devlovers Platform
 * Executes once at server initiation to register telemetry, logging, and crash reporters.
 */

import { logger } from './lib/observability/logger.js';
import { telemetry } from './lib/observability/telemetry.js';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    logger.info('Node.js server runtime instrumentation active', {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    logger.info('Edge runtime instrumentation active');
  }

  telemetry.trackEvent('server_startup', {
    runtime: process.env.NEXT_RUNTIME || 'nodejs',
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'production',
  });
}

export async function onRequestError(err, request, context) {
  const message = err instanceof Error ? err.message : String(err);
  const digest = typeof err === 'object' && err !== null && 'digest' in err ? String(err.digest) : undefined;

  telemetry.captureException(err, {
    digest,
    path: request?.path,
    method: request?.method,
    routerKind: context?.routerKind,
    routePath: context?.routePath,
    routeType: context?.routeType,
  });

  logger.error(`[Server onRequestError] ${message}`, {
    digest,
    path: request?.path,
    method: request?.method,
    context,
  });
}
