'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bot, Terminal, Play, Database, BookOpen } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-fx';
import { toast } from 'sonner';

const SAMPLE_INPUTS = {
  list_active_hackathons: JSON.stringify({ category: 'ai', limit: 3 }, null, 2),
  match_squad: JSON.stringify({ skills: ['Next.js 16', 'PyTorch', 'Agent Orchestration'], preferredRole: 'ML Engineer' }, null, 2),
  verify_github_commits: JSON.stringify({ repoUrl: 'https://github.com/devlovers/agentic-hackathon', hackathonSlug: 'future-of-ai-sprint-2026' }, null, 2),
  evaluate_submission_rubric: JSON.stringify({ hackathonSlug: 'future-of-ai-sprint-2026', submissionTitle: 'Autonomous Dev Co-Pilot', criteriaScores: { innovation: 95, technicalDepth: 92, execution: 90, impact: 88 }, hasLiveDemo: true }, null, 2),
  get_sprint_details: JSON.stringify({ slug: 'future-of-ai-sprint-2026' }, null, 2),
  get_developer_leaderboard: JSON.stringify({ limit: 5 }, null, 2),
};

export function McpInspectorModal({ open, onOpenChange }) {
  const [activeTab, setActiveTab] = useState('tools'); // 'tools' | 'resources' | 'prompts'
  const [selectedTool, setSelectedTool] = useState('list_active_hackathons');
  const [inputJson, setInputJson] = useState(SAMPLE_INPUTS.list_active_hackathons);
  const [outputJson, setOutputJson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);

  const handleToolChange = (toolName) => {
    soundFx.playClick();
    setSelectedTool(toolName);
    setInputJson(SAMPLE_INPUTS[toolName] || '{}');
    setOutputJson(null);
  };

  const executeTool = async () => {
    soundFx.playClick();
    setLoading(true);

    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(inputJson);
    } catch (_err) {
      toast.error('Invalid JSON in tool arguments');
      setLoading(false);
      return;
    }

    try {
      const startTime = performance.now();
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: `mcp-client-${Date.now()}`,
          method: 'tools/call',
          params: {
            name: selectedTool,
            arguments: parsedArgs,
          },
        }),
      });

      const latencyMs = Math.round(performance.now() - startTime);
      const remaining = res.headers.get('X-RateLimit-Remaining');
      if (remaining) {
        setRateLimitInfo({ remaining, latencyMs });
      }

      const json = await res.json();
      setOutputJson(json);
      soundFx.playSuccess();
      toast.success(`MCP Tool '${selectedTool}' executed in ${latencyMs}ms`);
    } catch (err) {
      toast.error(`Execution failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inspectResource = async (uri) => {
    soundFx.playClick();
    setLoading(true);
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: `res-${Date.now()}`,
          method: 'resources/read',
          params: { uri },
        }),
      });
      const json = await res.json();
      setOutputJson(json);
      soundFx.playSuccess();
      toast.success(`Resource '${uri}' resolved`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inspectPrompt = async (promptName, defaultArgs = {}) => {
    soundFx.playClick();
    setLoading(true);
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: `prompt-${Date.now()}`,
          method: 'prompts/get',
          params: { name: promptName, arguments: defaultArgs },
        }),
      });
      const json = await res.json();
      setOutputJson(json);
      soundFx.playSuccess();
      toast.success(`Prompt template '${promptName}' loaded`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl border-cyan-500/30 bg-[#0C0F1D]/98 backdrop-blur-2xl p-6 sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Devlovers Remote MCP Server</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    JSON-RPC 2.0 (2024-11-05)
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Model Context Protocol endpoint for autonomous AI agents, automated judging, and squad formation.
                </DialogDescription>
              </div>
            </div>

            {rateLimitInfo && (
              <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-[#141A2E] px-3 py-1.5 rounded-lg border border-white/10">
                <span>Latency: <strong className="text-cyan-400">{rateLimitInfo.latencyMs}ms</strong></span>
                <span className="text-slate-600">|</span>
                <span>Quota: <strong className="text-emerald-400">{rateLimitInfo.remaining}/60 reqs</strong></span>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pt-4">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('tools');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'tools'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Tools (6)</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('resources');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'resources'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>Resources (3)</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('prompts');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'prompts'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Prompts (3)</span>
            </button>
          </div>
        </DialogHeader>

        {/* Tab 1: Tools Console */}
        {activeTab === 'tools' && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 block">
                  Select MCP Tool:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'list_active_hackathons', label: 'List Sprints' },
                    { id: 'match_squad', label: 'Match Squad' },
                    { id: 'verify_github_commits', label: 'Verify Commits' },
                    { id: 'evaluate_submission_rubric', label: 'Evaluate Rubric' },
                    { id: 'get_sprint_details', label: 'Sprint Details' },
                    { id: 'get_developer_leaderboard', label: 'Leaderboard' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleToolChange(t.id)}
                      className={`text-left text-xs p-2.5 rounded-lg border transition ${
                        selectedTool === t.id
                          ? 'border-cyan-400 bg-cyan-500/15 text-white font-semibold'
                          : 'border-white/10 bg-[#141A2E]/50 text-slate-400 hover:border-white/20 hover:text-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Tool Arguments (JSON):
                  </label>
                  <textarea
                    value={inputJson}
                    onChange={(e) => setInputJson(e.target.value)}
                    rows={8}
                    className="w-full font-mono text-xs rounded-lg bg-[#06080F] border border-white/10 p-3 text-cyan-300 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <Button
                  variant="cyber"
                  onClick={executeTool}
                  disabled={loading}
                  className="w-full gap-2 font-semibold text-xs h-10"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>{loading ? 'Executing on MCP...' : `Dispatch ${selectedTool}`}</span>
                </Button>
              </div>

              {/* JSON-RPC Output Console */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>JSON-RPC 2.0 Response:</span>
                  <span className="text-[10px] text-slate-500 font-mono">POST /api/mcp</span>
                </label>
                <div className="h-[340px] overflow-auto rounded-lg bg-[#06080F] border border-white/10 p-3 font-mono text-xs text-slate-300">
                  {outputJson ? (
                    <pre className="text-[11px] leading-relaxed whitespace-pre-wrap text-emerald-300">
                      {JSON.stringify(outputJson, null, 2)}
                    </pre>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                      <Terminal className="h-8 w-8 text-slate-700" />
                      <span>Ready for agent request...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Resources Explorer */}
        {activeTab === 'resources' && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  uri: 'hackathons://active',
                  title: 'Active Sprints',
                  desc: 'Real-time JSON feed of active ongoing hackathon challenges.',
                },
                {
                  uri: 'rubrics://standard',
                  title: 'Official Rubric',
                  desc: '4-pillar criteria weights (Innovation, Depth, Execution, Impact).',
                },
                {
                  uri: 'squads://open',
                  title: 'Open Squads',
                  desc: 'Directory of squads actively recruiting specialized roles.',
                },
              ].map((r) => (
                <div
                  key={r.uri}
                  className="p-3.5 rounded-xl border border-white/10 bg-[#141A2E]/50 flex flex-col justify-between gap-3"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white">{r.title}</h4>
                    <p className="font-mono text-[10px] text-cyan-400 pt-0.5">{r.uri}</p>
                    <p className="text-xs text-slate-400 pt-1.5 leading-relaxed">{r.desc}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => inspectResource(r.uri)}
                    className="w-full text-xs h-8 border-white/10 hover:border-cyan-400/50 text-slate-200"
                  >
                    Read Resource
                  </Button>
                </div>
              ))}
            </div>

            {outputJson && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Resource Contents:
                </label>
                <div className="max-h-[260px] overflow-auto rounded-lg bg-[#06080F] border border-white/10 p-3 font-mono text-xs text-emerald-300">
                  <pre className="text-[11px] whitespace-pre-wrap">{JSON.stringify(outputJson, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Prompts Explorer */}
        {activeTab === 'prompts' && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  name: 'audit_submission',
                  title: 'Judging Audit Prompt',
                  desc: 'Instructs AI evaluator to analyze codebase, verified commits, and score pillars.',
                  sampleArgs: { hackathonTitle: 'AI Agents Challenge', repoUrl: 'https://github.com/example/repo' },
                },
                {
                  name: 'squad_pitch',
                  title: 'Squad Formation Pitch',
                  desc: 'Generates an engaging recruitment pitch for developer channels and matchmaker.',
                  sampleArgs: { hackathonTitle: 'AI Agents Challenge', projectVision: 'AI Agent Playground', neededRoles: 'Next.js, Python' },
                },
                {
                  name: 'summarize_hackathon',
                  title: 'Sprint Executive Briefing',
                  desc: 'Produces a developer summary of rules, bounties, and deadlines.',
                  sampleArgs: { hackathonSlug: 'future-of-ai-sprint-2026' },
                },
              ].map((p) => (
                <div
                  key={p.name}
                  className="p-3.5 rounded-xl border border-white/10 bg-[#141A2E]/50 flex flex-col justify-between gap-3"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white">{p.title}</h4>
                    <p className="font-mono text-[10px] text-violet-400 pt-0.5">{p.name}</p>
                    <p className="text-xs text-slate-400 pt-1.5 leading-relaxed">{p.desc}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => inspectPrompt(p.name, p.sampleArgs)}
                    className="w-full text-xs h-8 border-white/10 hover:border-violet-400/50 text-slate-200"
                  >
                    Generate Prompt
                  </Button>
                </div>
              ))}
            </div>

            {outputJson && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Generated Prompt Payload:
                </label>
                <div className="max-h-[260px] overflow-auto rounded-lg bg-[#06080F] border border-white/10 p-3 font-mono text-xs text-violet-300">
                  <pre className="text-[11px] whitespace-pre-wrap">{JSON.stringify(outputJson, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(McpInspectorModal);
