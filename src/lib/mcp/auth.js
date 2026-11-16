/**
 * MCP Server Authentication Middleware
 * Supports:
 * - Authorization: Bearer <API_KEY>
 * - x-api-key: <API_KEY>
 * If DEVLOVERS_MCP_API_KEY is not defined in process.env, allows open access (development mode).
 */

export function validateMcpAuth(request) {
  const configuredKey = process.env.DEVLOVERS_MCP_API_KEY;

  // Development mode: If no master key is configured, allow requests with anonymous dev tag
  if (!configuredKey) {
    return {
      authenticated: true,
      clientId: 'anonymous-dev',
      isDevelopment: true,
    };
  }

  // Check Authorization: Bearer <token>
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token === configuredKey) {
      return {
        authenticated: true,
        clientId: `token-${token.slice(0, 8)}`,
        isDevelopment: false,
      };
    }
  }

  // Check x-api-key header
  const apiKeyHeader = request.headers.get('x-api-key') || '';
  if (apiKeyHeader && apiKeyHeader === configuredKey) {
    return {
      authenticated: true,
      clientId: `key-${apiKeyHeader.slice(0, 8)}`,
      isDevelopment: false,
    };
  }

  return {
    authenticated: false,
    clientId: 'unauthorized',
    error: 'Invalid or missing MCP Bearer Token / API Key',
  };
}
