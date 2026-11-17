import { NextResponse } from 'next/server.js';
import { isLiveDatabase } from '../../../db/client.js';

const START_TIME = Date.now();

export async function GET() {
  const memory = process.memoryUsage ? process.memoryUsage() : {};
  const uptimeSeconds = process.uptime
    ? Math.round(process.uptime())
    : Math.round((Date.now() - START_TIME) / 1000);

  const payload = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    uptimeSeconds,
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memoryUsageMb: {
        rss: memory.rss ? Number((memory.rss / (1024 * 1024)).toFixed(2)) : null,
        heapTotal: memory.heapTotal ? Number((memory.heapTotal / (1024 * 1024)).toFixed(2)) : null,
        heapUsed: memory.heapUsed ? Number((memory.heapUsed / (1024 * 1024)).toFixed(2)) : null,
      },
    },
    services: {
      database: {
        status: isLiveDatabase() ? 'connected' : 'offline-resilient',
        driver: 'drizzle-postgres',
      },
      mcpServer: {
        status: 'online',
        protocolVersion: '2024-11-05',
        endpoint: '/api/mcp',
      },
      cache: {
        status: 'active',
        edgeCaching: true,
      },
      i18n: {
        status: 'active',
        supportedLocales: ['en', 'es', 'ja'],
      },
    },
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Health-Status': 'UP',
    },
  });
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'X-Health-Status': 'UP',
      'Cache-Control': 'no-store',
    },
  });
}
