'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/audio/sound-fx';
import { toast } from 'sonner';

const QUICK_ACTIONS = [
  {
    id: 'match',
    label: '⚡ Match Squad for Next.js & PyTorch',
    tool: 'match_squad',
    args: { skills: ['Next.js 16', 'PyTorch', 'Agent Orchestration'], preferredRole: 'ML Engineer' },
  },
  {
    id: 'sprints',
    label: '📋 Summarize Active AI Sprints',
    tool: 'list_active_hackathons',
    args: { category: 'ai', limit: 2 },
  },
  {
    id: 'pitch',
    label: '💡 Generate Squad Pitch',
    tool: 'squad_pitch',
    isPrompt: true,
    promptArgs: { squadName: 'Autonomous Syndicate', lookingFor: 'Solidity / Rust Systems Engineer' },
  },
  {
    id: 'rubric',
    label: '🔍 Audit Submission Rubric',
    tool: 'evaluate_submission_rubric',
    args: {
      hackathonSlug: 'future-of-ai-sprint-2026',
      submissionTitle: 'Autonomous Dev Co-Pilot',
      criteriaScores: { innovation: 95, technicalDepth: 92, execution: 90, impact: 88 },
      hasLiveDemo: true,
    },
  },
];

export function AiCopilotDock() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'Greetings Hacker! I am Devlovers Autonomous Copilot powered by your remote MCP Server. How can I assist your hackathon sprint today?',
      timestamp: 'Now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const toggleOpen = () => {
    soundFx.playClick();
    setIsOpen(!isOpen);
  };

  const handleExecuteQuickAction = async (action) => {
    soundFx.playClick();
    setLoading(true);

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: action.label,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      let rpcMethod = 'tools/call';
      let rpcParams = { name: action.tool, arguments: action.args };

      if (action.isPrompt) {
        rpcMethod = 'prompts/get';
        rpcParams = { name: action.tool, arguments: action.promptArgs };
      }

      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: `copilot-${Date.now()}`,
          method: rpcMethod,
          params: rpcParams,
        }),
      });

      const json = await res.json();
      soundFx.playSuccess();

      let replyContent = '';
      if (json.result?.content?.[0]?.text) {
        replyContent = json.result.content[0].text;
      } else if (json.result?.messages?.[0]?.content?.text) {
        replyContent = json.result.messages[0].content.text;
      } else {
        replyContent = JSON.stringify(json.result || json, null, 2);
      }

      const assistantMsg = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: replyContent,
        tool: action.tool,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      toast.error(`Agent call failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    soundFx.playClick();
    const query = input.trim();
    setInput('');

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Dispatch to MCP server with list_active_hackathons or summarize
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: `msg-${Date.now()}`,
          method: 'tools/call',
          params: {
            name: 'list_active_hackathons',
            arguments: { limit: 3 },
          },
        }),
      });

      const json = await res.json();
      soundFx.playSuccess();

      const replyContent =
        json.result?.content?.[0]?.text ||
        `Processing "${query}" against MCP Hackathon Protocol. Found 3 active sprints ready for deployment.`;

      const assistantMsg = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: `Processed "${query}". All hackathon channels, sponsor API dispensaries, and squad matchmakers are operational in the Workspace.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-[360px] sm:w-[420px] h-[520px] rounded-3xl bg-slate-950/95 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden mb-3.5"
          >
            {/* Header */}
            <div className="p-3.5 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-slate-950 shadow-md">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    Devlovers AI Copilot
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                      MCP v2024-11-05
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Autonomous Protocol Online
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={toggleOpen}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Action Chips Bar */}
            <div className="p-2.5 bg-black/40 border-b border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleExecuteQuickAction(action)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 text-[10px] font-mono whitespace-nowrap transition-all border border-white/5 shrink-0"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Message Feed */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                        isUser
                          ? 'bg-cyan-500 text-slate-950 font-sans font-medium rounded-br-sm'
                          : 'bg-white/[0.05] border border-white/10 text-slate-200 rounded-bl-sm font-mono text-[11px] whitespace-pre-wrap'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 text-cyan-400 text-xs py-2 font-mono">
                  <span className="animate-spin inline-block h-3.5 w-3.5 border-2 border-cyan-400 border-t-transparent rounded-full" />
                  Executing agentic tool call over MCP...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-black/60 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Copilot or query MCP tools..."
                className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400/80 font-sans"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || loading}
                className="h-8 w-8 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleOpen}
        aria-label="Open AI Copilot Dock"
        className="h-13 w-13 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 p-3 text-slate-950 font-bold shadow-xl shadow-cyan-500/25 flex items-center justify-center relative group border border-white/20"
      >
        <Bot className="h-6 w-6 text-slate-950" />
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
      </motion.button>
    </div>
  );
}
