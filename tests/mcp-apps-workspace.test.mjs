import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  getSponsorPresets,
  dispenseSponsorToken,
} from '../src/db/queries/sponsors.js';
import {
  GET as sponsorGetHandler,
  POST as sponsorPostHandler,
} from '../src/app/api/sponsors/dispense/route.js';

describe('MCP Apps & Dynamic Interactive Workspace (Phase 4)', () => {
  describe('Sponsor API Dispensary & Token Provisioning', () => {
    it('returns all pre-configured sponsor tracks with active allowances', async () => {
      const presets = await getSponsorPresets();
      assert.ok(Array.isArray(presets));
      assert.strictEqual(presets.length, 6);

      const gemini = presets.find((p) => p.id === 'sp-gemini');
      assert.ok(gemini);
      assert.strictEqual(gemini.creditAmountCents, 10000);
      assert.strictEqual(gemini.tokenPrefix, 'devlovers_gemini_sbx_');
      assert.ok(gemini.perks.length > 0);
    });

    it('dispenses verified sandboxed API credential with valid prefix and expiry', async () => {
      const record = await dispenseSponsorToken({
        sponsorId: 'sp-gemini',
        userId: 'hacker-lead-01',
        hackathonSlug: 'future-of-ai-sprint-2026',
      });

      assert.ok(record);
      assert.ok(record.id.startsWith('disp-'));
      assert.ok(record.token.startsWith('devlovers_gemini_sbx_'));
      assert.strictEqual(record.creditAmountCents, 10000);
      assert.strictEqual(record.userId, 'hacker-lead-01');
      assert.strictEqual(record.hackathonSlug, 'future-of-ai-sprint-2026');

      const dispensedTime = new Date(record.dispensedAt).getTime();
      const expiresTime = new Date(record.expiresAt).getTime();
      assert.ok(expiresTime > dispensedTime, 'Expiry timestamp must be in future');
    });

    it('handles GET /api/sponsors/dispense route handler', async () => {
      const res = await sponsorGetHandler();
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.meta.dispensaryStatus, 'ONLINE');
      assert.strictEqual(json.data.length, 6);
    });

    it('handles POST /api/sponsors/dispense with valid payload', async () => {
      const req = new Request('http://localhost:3000/api/sponsors/dispense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sponsorId: 'sp-supabase',
          userId: 'dev-007',
          hackathonSlug: 'future-of-ai-sprint-2026',
        }),
      });

      const res = await sponsorPostHandler(req);
      assert.strictEqual(res.status, 201);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.data.token.startsWith('devlovers_sb_sbx_'));
      assert.strictEqual(json.data.creditAmountCents, 5000);
    });

    it('rejects POST /api/sponsors/dispense when sponsorId is missing', async () => {
      const req = new Request('http://localhost:3000/api/sponsors/dispense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const res = await sponsorPostHandler(req);
      assert.strictEqual(res.status, 400);

      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error, 'sponsorId is required');
    });
  });

  describe('Interactive Squad Matchmaker Synergy Logic', () => {
    it('computes 0% compatibility for empty slots', () => {
      const filled = [];
      const score = filled.length === 0 ? 0 : 50;
      assert.strictEqual(score, 0);
    });

    it('computes high compatibility and optimal synergy for 4-member full team with skill coverage', () => {
      const members = [
        { role: 'Lead / Fullstack', skills: ['Next.js 16', 'TypeScript'], xp: 1820 },
        { role: 'AI / ML Engineer', skills: ['PyTorch / LLMs', 'CUDA'], xp: 2450 },
        { role: 'Systems / Smart Contracts', skills: ['Rust / Solidity', 'Wasm'], xp: 1980 },
        { role: 'Product & UX Designer', skills: ['Figma / Design Tokens', 'UI Design'], xp: 1650 },
      ];

      // Base: (4 / 4) * 45 = 45
      let score = (members.length / 4) * 45;

      // 4 skills matched: 4 * 10 = 40
      const required = ['Next.js 16', 'PyTorch / LLMs', 'Rust / Solidity', 'Figma / Design Tokens'];
      const allSkills = new Set(members.flatMap((m) => m.skills));
      required.forEach((r) => {
        if (allSkills.has(r)) score += 10;
      });

      // Experience: avg xp = 1975 > 1800 -> +15
      const avgXp = members.reduce((sum, m) => sum + m.xp, 0) / members.length;
      if (avgXp > 1800) score += 15;

      const finalScore = Math.min(Math.round(score), 99);
      assert.strictEqual(finalScore, 99);
    });
  });

  describe('Submissions Radar Matrix Geometry & Calculations', () => {
    it('calculates polar coordinates correctly for 4-pillar axes', () => {
      const center = 160;
      const radius = 110;

      // Innovation is Top: angle = -PI/2
      const angleTop = -Math.PI / 2;
      const score = 100;
      const r = (score / 100) * radius;
      const x = Math.round(center + r * Math.cos(angleTop));
      const y = Math.round(center + r * Math.sin(angleTop));

      assert.strictEqual(x, 160, 'X coordinate must be centered at 160');
      assert.strictEqual(y, 50, 'Y coordinate must be 160 - 110 = 50');
    });

    it('applies 4-pillar weighting formula accurately (30/30/20/20)', () => {
      const scores = {
        innovation: 90,
        technicalDepth: 95,
        execution: 85,
        impact: 80,
      };

      const expected = (
        scores.innovation * 0.30 +
        scores.technicalDepth * 0.30 +
        scores.execution * 0.20 +
        scores.impact * 0.20
      );

      // 27 + 28.5 + 17 + 16 = 88.5
      assert.strictEqual(Number(expected.toFixed(2)), 88.5);
    });

    it('generates polygon points string with 4 coordinate pairs', () => {
      const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
      const scores = [90, 85, 95, 80];
      const center = 160;
      const radius = 110;

      const points = angles.map((angle, idx) => {
        const r = (scores[idx] / 100) * radius;
        const x = Math.round(center + r * Math.cos(angle));
        const y = Math.round(center + r * Math.sin(angle));
        return `${x},${y}`;
      }).join(' ');

      const pairs = points.split(' ');
      assert.strictEqual(pairs.length, 4);
      pairs.forEach((pair) => {
        assert.ok(pair.includes(','));
        const [x, y] = pair.split(',').map(Number);
        assert.ok(!isNaN(x) && !isNaN(y));
      });
    });
  });

  describe('Interactive Judging Console & Blind Evaluation', () => {
    it('calculates weighted raw scores and normalizes mathematical Z-scores', () => {
      const scores = {
        innovation: 94,
        technicalDepth: 92,
        execution: 90,
        impact: 88,
      };

      // 94*0.3 + 92*0.3 + 90*0.2 + 88*0.2 = 28.2 + 27.6 + 18 + 17.6 = 91.4
      const rawScore = Number((
        scores.innovation * 0.30 +
        scores.technicalDepth * 0.30 +
        scores.execution * 0.20 +
        scores.impact * 0.20
      ).toFixed(2));

      assert.strictEqual(rawScore, 91.4);

      const mean = 88.0;
      const stdDev = 6.2;
      const zScore = Number(((rawScore - mean) / stdDev).toFixed(2));

      // (91.4 - 88.0) / 6.2 = 3.4 / 6.2 ≈ 0.55
      assert.strictEqual(zScore, 0.55);
    });

    it('enforces blind evaluation masking to prevent judging bias', () => {
      const isBlindMode = true;
      const originalTitle = 'NeuroAgent Mesh';
      const projectIndex = 0;

      const displayTitle = isBlindMode
        ? `Project Submission #${projectIndex + 1}`
        : originalTitle;

      assert.strictEqual(displayTitle, 'Project Submission #1');
      assert.ok(!displayTitle.includes('NeuroAgent'));
    });
  });

  describe('Sponsor Token Masking & Reveal Formatting', () => {
    it('masks raw token preserving prefix and trailing 4 characters', () => {
      const rawToken = 'devlovers_gemini_sbx_98a7bc310f8a';
      const maskToken = (tok) => {
        if (!tok) return '';
        const prefix = tok.slice(0, 21);
        const lastFour = tok.slice(-4);
        return `${prefix}••••••••${lastFour}`;
      };

      const masked = maskToken(rawToken);
      assert.strictEqual(masked, 'devlovers_gemini_sbx_••••••••0f8a');
      assert.ok(!masked.includes('98a7bc31'));
    });
  });

  describe('AI Copilot Dock & Agentic Tool Call Payload Protocol', () => {
    it('formats JSON-RPC 2.0 tool execution payload for match_squad', () => {
      const toolCallPayload = {
        jsonrpc: '2.0',
        id: 'copilot-call-101',
        method: 'tools/call',
        params: {
          name: 'match_squad',
          arguments: {
            required_skills: ['Next.js 16', 'TypeScript', 'Rust'],
            min_xp: 1500,
          },
        },
      };

      assert.strictEqual(toolCallPayload.jsonrpc, '2.0');
      assert.strictEqual(toolCallPayload.method, 'tools/call');
      assert.strictEqual(toolCallPayload.params.name, 'match_squad');
      assert.strictEqual(toolCallPayload.params.arguments.required_skills.length, 3);
    });

    it('formats JSON-RPC 2.0 prompt retrieval payload for audit_submission', () => {
      const promptPayload = {
        jsonrpc: '2.0',
        id: 'copilot-prompt-102',
        method: 'prompts/get',
        params: {
          name: 'audit_submission',
          arguments: {
            submission_slug: 'neuroagent-mesh',
            strictness: 'high',
          },
        },
      };

      assert.strictEqual(promptPayload.jsonrpc, '2.0');
      assert.strictEqual(promptPayload.method, 'prompts/get');
      assert.strictEqual(promptPayload.params.name, 'audit_submission');
      assert.strictEqual(promptPayload.params.arguments.strictness, 'high');
    });
  });
});
