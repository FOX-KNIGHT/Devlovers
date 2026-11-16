import { MCP_TOOLS, executeMcpTool } from './tools.js';
import { MCP_RESOURCES, readMcpResource } from './resources.js';
import { MCP_PROMPTS, getMcpPrompt } from './prompts.js';

export const MCP_SERVER_INFO = {
  name: 'devlovers-mcp-server',
  version: '1.0.0',
  protocolVersion: '2024-11-05',
};

/**
 * Standard JSON-RPC 2.0 error response helper
 */
export function createJsonRpcError(id, code, message, data = null) {
  return {
    jsonrpc: '2.0',
    id: id !== undefined ? id : null,
    error: {
      code,
      message,
      ...(data ? { data } : {}),
    },
  };
}

/**
 * Standard JSON-RPC 2.0 success response helper
 */
export function createJsonRpcSuccess(id, result) {
  return {
    jsonrpc: '2.0',
    id,
    result,
  };
}

/**
 * Dispatch a single JSON-RPC 2.0 request
 */
export async function handleMcpRequest(payload) {
  if (!payload || typeof payload !== 'object' || payload.jsonrpc !== '2.0' || typeof payload.method !== 'string') {
    return createJsonRpcError(payload?.id, -32600, 'Invalid Request: payload must be a JSON-RPC 2.0 object with method string');
  }

  const { id, method, params = {} } = payload;

  try {
    switch (method) {
      // 1. Handshake & Initialization
      case 'initialize': {
        return createJsonRpcSuccess(id, {
          protocolVersion: MCP_SERVER_INFO.protocolVersion,
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false },
          },
          serverInfo: {
            name: MCP_SERVER_INFO.name,
            version: MCP_SERVER_INFO.version,
          },
        });
      }

      case 'notifications/initialized': {
        return createJsonRpcSuccess(id, {});
      }

      case 'ping': {
        return createJsonRpcSuccess(id, {});
      }

      // 2. Tools
      case 'tools/list': {
        return createJsonRpcSuccess(id, {
          tools: MCP_TOOLS,
        });
      }

      case 'tools/call': {
        const { name, arguments: args } = params;
        if (!name) {
          return createJsonRpcError(id, -32602, 'Invalid params: "name" is required for tools/call');
        }

        try {
          const result = await executeMcpTool(name, args || {});
          return createJsonRpcSuccess(id, {
            content: [
              {
                type: 'text',
                text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          });
        } catch (toolErr) {
          return createJsonRpcSuccess(id, {
            content: [
              {
                type: 'text',
                text: `Tool Execution Error [${name}]: ${toolErr.message}`,
              },
            ],
            isError: true,
          });
        }
      }

      // 3. Resources
      case 'resources/list': {
        return createJsonRpcSuccess(id, {
          resources: MCP_RESOURCES,
        });
      }

      case 'resources/read': {
        const { uri } = params;
        if (!uri) {
          return createJsonRpcError(id, -32602, 'Invalid params: "uri" is required for resources/read');
        }

        const resourceData = await readMcpResource(uri);
        return createJsonRpcSuccess(id, resourceData);
      }

      // 4. Prompts
      case 'prompts/list': {
        return createJsonRpcSuccess(id, {
          prompts: MCP_PROMPTS,
        });
      }

      case 'prompts/get': {
        const { name, arguments: args } = params;
        if (!name) {
          return createJsonRpcError(id, -32602, 'Invalid params: "name" is required for prompts/get');
        }

        const promptData = await getMcpPrompt(name, args || {});
        return createJsonRpcSuccess(id, promptData);
      }

      default:
        return createJsonRpcError(id, -32601, `Method not found: '${method}' is not supported by Devlovers MCP Server`);
    }
  } catch (err) {
    return createJsonRpcError(id, -32603, `Internal error: ${err.message}`);
  }
}
