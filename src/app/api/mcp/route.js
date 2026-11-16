import { NextResponse } from 'next/server.js';
import { handleMcpRequest, MCP_SERVER_INFO, createJsonRpcError } from '../../../lib/mcp/server.js';
import { validateMcpAuth } from '../../../lib/mcp/auth.js';
import { mcpRateLimiter } from '../../../lib/mcp/rate-limiter.js';
import { MCP_TOOLS } from '../../../lib/mcp/tools.js';
import { MCP_RESOURCES } from '../../../lib/mcp/resources.js';
import { MCP_PROMPTS } from '../../../lib/mcp/prompts.js';

export async function POST(request) {
  // 1. Authentication
  const auth = validateMcpAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json(
      createJsonRpcError(null, -32000, `Unauthorized: ${auth.error}`),
      { status: 401 }
    );
  }

  // 2. Rate Limiting
  const rateLimit = mcpRateLimiter.check(auth.clientId);
  const rateLimitHeaders = {
    'X-RateLimit-Limit': String(rateLimit.limit),
    'X-RateLimit-Remaining': String(rateLimit.remaining),
    'X-RateLimit-Reset': String(rateLimit.resetTime),
  };

  if (!rateLimit.success) {
    return NextResponse.json(
      createJsonRpcError(null, -32001, 'Rate limit exceeded. Maximum 60 requests per minute allowed.'),
      {
        status: 429,
        headers: rateLimitHeaders,
      }
    );
  }

  // 3. Parse JSON-RPC 2.0 Payload
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      createJsonRpcError(null, -32700, 'Parse error: Invalid JSON was received by the server'),
      {
        status: 400,
        headers: rateLimitHeaders,
      }
    );
  }

  // Support batch JSON-RPC requests
  if (Array.isArray(payload)) {
    if (payload.length === 0) {
      return NextResponse.json(
        createJsonRpcError(null, -32600, 'Invalid Request: batch array cannot be empty'),
        { status: 400, headers: rateLimitHeaders }
      );
    }
    const responses = await Promise.all(payload.map((req) => handleMcpRequest(req)));
    return NextResponse.json(responses, { headers: rateLimitHeaders });
  }

  // Single request
  const response = await handleMcpRequest(payload);
  return NextResponse.json(response, { headers: rateLimitHeaders });
}

export async function GET() {
  return NextResponse.json({
    name: MCP_SERVER_INFO.name,
    version: MCP_SERVER_INFO.version,
    protocolVersion: MCP_SERVER_INFO.protocolVersion,
    description: 'Devlovers Remote Stateless Model Context Protocol (MCP) Server for Autonomous AI Agents',
    status: 'OPERATIONAL',
    endpoints: {
      post: '/api/mcp (JSON-RPC 2.0)',
      documentation: 'https://modelcontextprotocol.io',
    },
    capabilities: {
      toolsCount: MCP_TOOLS.length,
      tools: MCP_TOOLS.map((t) => ({ name: t.name, description: t.description })),
      resourcesCount: MCP_RESOURCES.length,
      resources: MCP_RESOURCES.map((r) => ({ uri: r.uri, name: r.name })),
      promptsCount: MCP_PROMPTS.length,
      prompts: MCP_PROMPTS.map((p) => ({ name: p.name, description: p.description })),
    },
    rateLimits: '60 requests / minute per Bearer token or IP',
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    },
  });
}
