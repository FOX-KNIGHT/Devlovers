import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { handleMcpRequest, MCP_SERVER_INFO } from '../src/lib/mcp/server.js';
import { mcpRateLimiter } from '../src/lib/mcp/rate-limiter.js';
import { validateMcpAuth } from '../src/lib/mcp/auth.js';
import { GET as mcpGetHandler, POST as mcpPostHandler } from '../src/app/api/mcp/route.js';

describe('Model Context Protocol (MCP) Server (Phase 3)', () => {
  beforeEach(() => {
    mcpRateLimiter.reset();
  });

  describe('JSON-RPC 2.0 Protocol Compliance', () => {
    it('handles initialize handshake with protocolVersion 2024-11-05', async () => {
      assert.strictEqual(MCP_SERVER_INFO.name, 'devlovers-mcp-server');
      const res = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 'init-1',
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test-agent', version: '1.0' },
        },
      });

      assert.strictEqual(res.jsonrpc, '2.0');
      assert.strictEqual(res.id, 'init-1');
      assert.ok(res.result);
      assert.strictEqual(res.result.protocolVersion, '2024-11-05');
      assert.strictEqual(res.result.serverInfo.name, 'devlovers-mcp-server');
      assert.ok(res.result.capabilities.tools);
      assert.ok(res.result.capabilities.resources);
      assert.ok(res.result.capabilities.prompts);
    });

    it('handles ping request', async () => {
      const res = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 42,
        method: 'ping',
      });
      assert.strictEqual(res.jsonrpc, '2.0');
      assert.strictEqual(res.id, 42);
      assert.deepStrictEqual(res.result, {});
    });

    it('returns -32600 for invalid JSON-RPC payload', async () => {
      const invalid = await handleMcpRequest({ method: 'ping' }); // missing jsonrpc: '2.0'
      assert.strictEqual(invalid.error.code, -32600);

      const notObject = await handleMcpRequest('invalid string');
      assert.strictEqual(notObject.error.code, -32600);
    });

    it('returns -32601 for unsupported methods', async () => {
      const res = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 99,
        method: 'nonexistent/method',
      });
      assert.strictEqual(res.error.code, -32601);
      assert.ok(res.error.message.includes('Method not found'));
    });
  });

  describe('MCP Tools Discovery & Execution', () => {
    it('tools/list returns registered tools with valid input schemas', async () => {
      const res = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 'tools-list-1',
        method: 'tools/list',
      });

      assert.ok(res.result);
      assert.ok(Array.isArray(res.result.tools));
      assert.ok(res.result.tools.length >= 6);

      const toolNames = res.result.tools.map((t) => t.name);
      assert.ok(toolNames.includes('list_active_hackathons'));
      assert.ok(toolNames.includes('match_squad'));
      assert.ok(toolNames.includes('verify_github_commits'));
      assert.ok(toolNames.includes('evaluate_submission_rubric'));
      assert.ok(toolNames.includes('get_sprint_details'));
      assert.ok(toolNames.includes('get_developer_leaderboard'));

      // Verify each tool has proper schema definitions
      res.result.tools.forEach((t) => {
        assert.ok(t.name, 'Tool must have name');
        assert.ok(t.description, 'Tool must have description');
        assert.strictEqual(t.inputSchema.type, 'object');
      });
    });

    it('executes list_active_hackathons tool', async () => {
      const res = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 'tool-exec-1',
        method: 'tools/call',
        params: {
          name: 'list_active_hackathons',
          arguments: {
            limit: 5,
          },
        },
      });

      assert.strictEqual(res.result.isError, false);
      assert.ok(res.result.content[0].text);
      const parsed = JSON.parse(res.result.content[0].text);
      assert.ok(parsed.total >= 1);
      assert.ok(Array.isArray(parsed.hackathons));
      assert.ok(parsed.hackathons[0].title);
    });

    it('executes match_squad tool with skill overlap scoring', async () => {
      const res = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 'tool-exec-2',
        method: 'tools/call',
        params: {
          name: 'match_squad',
          arguments: {
            skills: ['PyTorch', 'Next.js 16', 'Agent Orchestration'],
            preferredRole: 'ML Engineer',
          },
        },
      });

      assert.strictEqual(res.result.isError, false);
      const parsed = JSON.parse(res.result.content[0].text);
      assert.ok(parsed.matchedCount > 0);
      assert.ok(Array.isArray(parsed.topSquads));
      assert.ok(parsed.topSquads[0].compatibilityScore);
      assert.ok(parsed.topSquads[0].rolesNeeded);
    });

    it('executes verify_github_commits tool', async () => {
      const res = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 'tool-exec-3',
        method: 'tools/call',
        params: {
          name: 'verify_github_commits',
          arguments: {
            repoUrl: 'https://github.com/devlovers/agentic-hackathon-entry',
            hackathonSlug: 'hackathon-alpha',
          },
        },
      });

      assert.strictEqual(res.result.isError, false);
      const parsed = JSON.parse(res.result.content[0].text);
      assert.strictEqual(parsed.repoUrl, 'https://github.com/devlovers/agentic-hackathon-entry');
      assert.ok(parsed.sprintWindow.startsAt);
      assert.ok(parsed.sprintWindow.endsAt);
      assert.strictEqual(typeof parsed.isVerified, 'boolean');
      assert.ok(parsed.integrityStatus);
    });

    it('flags out-of-bounds pre-hackathon commits', async () => {
      const res = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 'tool-exec-4',
        method: 'tools/call',
        params: {
          name: 'verify_github_commits',
          arguments: {
            repoUrl: 'https://github.com/devlovers/suspicious-repo',
            hackathonSlug: 'hackathon-alpha',
            commits: [
              {
                sha: '0000001',
                message: 'Pre-existing codebase written 2 years ago',
                timestamp: '2024-01-01T00:00:00.000Z',
              },
            ],
          },
        },
      });

      assert.strictEqual(res.result.isError, false);
      const parsed = JSON.parse(res.result.content[0].text);
      assert.strictEqual(parsed.isVerified, false);
      assert.strictEqual(parsed.integrityStatus, 'TIMELINE_VIOLATIONS_DETECTED');
      assert.strictEqual(parsed.flaggedCount, 1);
    });

    it('executes evaluate_submission_rubric tool', async () => {
      const res = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 'tool-exec-5',
        method: 'tools/call',
        params: {
          name: 'evaluate_submission_rubric',
          arguments: {
            hackathonSlug: 'hackathon-alpha',
            submissionTitle: 'Autonomous Dev Assistant',
            criteriaScores: {
              innovation: 95,
              technicalDepth: 90,
              execution: 88,
              impact: 92,
            },
            hasReadme: true,
            hasLiveDemo: true,
            verifiedCommits: true,
          },
        },
      });

      assert.strictEqual(res.result.isError, false);
      const parsed = JSON.parse(res.result.content[0].text);
      assert.ok(parsed.compositeScore >= 80);
      assert.ok(parsed.rubricBreakdown.innovation);
      assert.ok(parsed.normalizedGrade);
    });

    it('executes get_sprint_details and get_developer_leaderboard tools', async () => {
      const sprintRes = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 'tool-exec-6',
        method: 'tools/call',
        params: {
          name: 'get_sprint_details',
          arguments: { slug: 'future-of-ai-sprint-2026' },
        },
      });
      assert.strictEqual(sprintRes.result.isError, false);
      const sprint = JSON.parse(sprintRes.result.content[0].text);
      assert.strictEqual(sprint.slug, 'future-of-ai-sprint-2026');
      assert.ok(sprint.prizePoolCents);

      const leaderRes = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 'tool-exec-7',
        method: 'tools/call',
        params: {
          name: 'get_developer_leaderboard',
          arguments: { limit: 5 },
        },
      });
      assert.strictEqual(leaderRes.result.isError, false);
      const leaderboard = JSON.parse(leaderRes.result.content[0].text);
      assert.ok(leaderboard.totalRanked > 0);
      assert.ok(Array.isArray(leaderboard.podium));
    });
  });

  describe('MCP Resources', () => {
    it('resources/list returns available standard resources', async () => {
      const res = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 'res-list-1',
        method: 'resources/list',
      });

      assert.ok(res.result);
      assert.ok(Array.isArray(res.result.resources));
      const uris = res.result.resources.map((r) => r.uri);
      assert.ok(uris.includes('hackathons://active'));
      assert.ok(uris.includes('rubrics://standard'));
      assert.ok(uris.includes('squads://open'));
    });

    it('resources/read resolves hackathons://active resource', async () => {
      const res = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 'res-read-1',
        method: 'resources/read',
        params: { uri: 'hackathons://active' },
      });

      assert.ok(res.result);
      assert.ok(res.result.contents[0].text);
      const parsed = JSON.parse(res.result.contents[0].text);
      assert.ok(Array.isArray(parsed.sprints));
    });

    it('resources/read resolves rubrics://standard resource', async () => {
      const res = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 'res-read-2',
        method: 'resources/read',
        params: { uri: 'rubrics://standard' },
      });

      assert.ok(res.result);
      const parsed = JSON.parse(res.result.contents[0].text);
      assert.ok(parsed.standardWeights.innovation);
      assert.ok(parsed.antiBiasRules);
    });

    it('resources/read resolves squads://open resource', async () => {
      const res = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 'res-read-3',
        method: 'resources/read',
        params: { uri: 'squads://open' },
      });

      assert.ok(res.result);
      const parsed = JSON.parse(res.result.contents[0].text);
      assert.strictEqual(typeof parsed.totalOpenSquads, 'number');
    });

    it('resources/read returns error for invalid URI', async () => {
      const res = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 'res-read-4',
        method: 'resources/read',
        params: { uri: 'unknown://uri' },
      });

      assert.ok(res.error);
      assert.strictEqual(res.error.code, -32603);
    });
  });

  describe('MCP Prompts', () => {
    it('prompts/list returns registered prompts with arguments', async () => {
      const res = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 'prompt-list-1',
        method: 'prompts/list',
      });

      assert.ok(res.result);
      assert.ok(Array.isArray(res.result.prompts));
      const promptNames = res.result.prompts.map((p) => p.name);
      assert.ok(promptNames.includes('audit_submission'));
      assert.ok(promptNames.includes('squad_pitch'));
      assert.ok(promptNames.includes('summarize_hackathon'));
    });

    it('prompts/get generates audit_submission prompt', async () => {
      const res = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 'prompt-get-1',
        method: 'prompts/get',
        params: {
          name: 'audit_submission',
          arguments: {
            hackathonTitle: 'AI Agents Challenge',
            repoUrl: 'https://github.com/devlovers/agent-challenge',
          },
        },
      });

      assert.ok(res.result);
      assert.ok(res.result.messages.length >= 2);
      assert.ok(res.result.messages[1].content.text.includes('AI Agents Challenge'));
    });

    it('prompts/get generates squad_pitch prompt', async () => {
      const res = await handleMcpRequest({
        jsonrpc: '2.0',
        id: 'prompt-get-2',
        method: 'prompts/get',
        params: {
          name: 'squad_pitch',
          arguments: {
            hackathonTitle: 'Blockchain Summit',
            projectVision: 'Zero-knowledge private identity oracle',
            neededRoles: 'Solidity, Rust',
          },
        },
      });

      assert.ok(res.result);
      assert.ok(res.result.messages[0].content.text.includes('Blockchain Summit'));
    });
  });

  describe('Rate Limiter & Authentication', () => {
    it('sliding window rate limiter tracks remaining requests and enforces limits', () => {
      const testLimiter = mcpRateLimiter;
      testLimiter.reset('test-client');

      // Make 3 requests
      const r1 = testLimiter.check('test-client');
      assert.strictEqual(r1.success, true);
      assert.strictEqual(r1.remaining, 59);

      const r2 = testLimiter.check('test-client');
      assert.strictEqual(r2.remaining, 58);

      // Artificially saturate client
      for (let i = 0; i < 58; i++) {
        testLimiter.check('test-client');
      }

      // 61st request should be blocked
      const blocked = testLimiter.check('test-client');
      assert.strictEqual(blocked.success, false);
      assert.strictEqual(blocked.remaining, 0);
      assert.ok(blocked.resetTime > Date.now());

      testLimiter.reset('test-client');
    });

    it('validateMcpAuth permits open development mode when env key is unset', () => {
      const prev = process.env.DEVLOVERS_MCP_API_KEY;
      delete process.env.DEVLOVERS_MCP_API_KEY;

      const mockReq = {
        headers: new Headers(),
      };

      const auth = validateMcpAuth(mockReq);
      assert.strictEqual(auth.authenticated, true);
      assert.strictEqual(auth.isDevelopment, true);

      if (prev) process.env.DEVLOVERS_MCP_API_KEY = prev;
    });

    it('validateMcpAuth verifies Bearer tokens and rejects invalid credentials', () => {
      process.env.DEVLOVERS_MCP_API_KEY = 'secret-mcp-agent-key-2026';

      const validReq = {
        headers: new Headers({
          authorization: 'Bearer secret-mcp-agent-key-2026',
        }),
      };
      const validAuth = validateMcpAuth(validReq);
      assert.strictEqual(validAuth.authenticated, true);

      const invalidReq = {
        headers: new Headers({
          authorization: 'Bearer wrong-key',
        }),
      };
      const invalidAuth = validateMcpAuth(invalidReq);
      assert.strictEqual(invalidAuth.authenticated, false);
      assert.ok(invalidAuth.error);

      delete process.env.DEVLOVERS_MCP_API_KEY;
    });
  });

  describe('HTTP Route Handler Integration (/api/mcp)', () => {
    it('GET /api/mcp returns server metadata and capabilities', async () => {
      const response = await mcpGetHandler();
      assert.strictEqual(response.status, 200);

      const json = await response.json();
      assert.strictEqual(json.name, 'devlovers-mcp-server');
      assert.strictEqual(json.status, 'OPERATIONAL');
      assert.ok(json.capabilities.toolsCount >= 6);
      assert.ok(json.capabilities.resourcesCount >= 3);
      assert.ok(json.capabilities.promptsCount >= 3);
    });

    it('POST /api/mcp executes JSON-RPC request and sets rate limit headers', async () => {
      const mockReq = {
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => ({
          jsonrpc: '2.0',
          id: 'route-test-1',
          method: 'ping',
        }),
      };

      const response = await mcpPostHandler(mockReq);
      assert.strictEqual(response.status, 200);
      assert.ok(response.headers.get('X-RateLimit-Limit'));
      assert.ok(response.headers.get('X-RateLimit-Remaining'));

      const json = await response.json();
      assert.strictEqual(json.id, 'route-test-1');
      assert.deepStrictEqual(json.result, {});
    });

    it('POST /api/mcp supports batch requests', async () => {
      const mockReq = {
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => [
          { jsonrpc: '2.0', id: 1, method: 'ping' },
          { jsonrpc: '2.0', id: 2, method: 'ping' },
        ],
      };

      const response = await mcpPostHandler(mockReq);
      assert.strictEqual(response.status, 200);
      const json = await response.json();
      assert.ok(Array.isArray(json));
      assert.strictEqual(json.length, 2);
      assert.strictEqual(json[0].id, 1);
      assert.strictEqual(json[1].id, 2);
    });
  });
});
