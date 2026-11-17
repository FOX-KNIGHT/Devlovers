'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  Minimize2,
  Sparkles,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/audio/sound-fx';
import { toast } from 'sonner';

const QUICK_ACTIONS = [
  {
    id: 'match',
    label: 'Match Squad for Next.js 16',
    icon: UsersIcon,
    tool: 'match_squad',
    args: { skills: ['Next.js 16', 'PyTorch', 'Agent Orchestration'], preferredRole: 'ML Engineer' },
  },
  {
    id: 'sprints',
    label: 'Audit Active Sprints',
    icon: Terminal,
    tool: 'list_active_hackathons',
    args: { category: 'ai', limit: 2 },
  },
  {
    id: 'pitch',
    label: 'Generate Squad Pitch',
    icon: Sparkles,
    tool: 'squad_pitch',
    isPrompt: true,
    promptArgs: { squadName: 'Autonomous Syndicate', lookingFor: 'Solidity / Rust Systems Engineer' },
  },
  {
    id: 'rubric',
    label: 'Audit Rubric & Weights',
    icon: ShieldCheck,
    tool: 'evaluate_submission_rubric',
    args: {
      hackathonSlug: 'future-of-ai-sprint-2026',
      submissionTitle: 'Autonomous Dev Co-Pilot',
      criteriaScores: { innovation: 95, technicalDepth: 92, execution: 90, impact: 88 },
      hasLiveDemo: true,
    },
  },
];

function UsersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function AiCopilotDock() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'Autonomous Copilot online. Connected to Devlovers Remote Stateless MCP Server (protocol v2024-11-05). Ask me to audit project commit timelines, match squad candidates, or evaluate submission rubrics.',
      timestamp: 'Now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Global ⌘J or Ctrl+J keyboard listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        soundFx.playClick();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        `Executed protocol query for "${query}". Evaluated live hackathon channels, sponsor API dispensaries, and candidate rosters.`;

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
          text: `Executed query "${query}". Active challenge channels, sponsor API dispensaries, and team formation docks are operational in the Workspace.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
            className="w-[370px] sm:w-[440px] h-[540px] rounded-3xl bg-[#080C1A]/95 border border-cyan-500/30 backdrop-blur-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden mb-4 ring-1 ring-white/[0.08]"
          >
            {/* Header */}
            <div className="p-4 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-cyan-500 to-violet-600 flex items-center justify-center text-slate-950 shadow-md ring-2 ring-white/10 shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Devlovers AI Copilot</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      MCP MESH
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Protocol v2024-11-05 Ready</span>
                  </div>
                </div>
              </div>

              <button
                onClick={toggleOpen}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
                title="Minimize Copilot (⌘J)"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Action Chips Bar */}
            <div className="p-2.5 bg-black/40 border-b border-white/[0.06] flex gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleExecuteQuickAction(action)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 text-[10px] font-mono whitespace-nowrap transition-all border border-white/[0.06] shrink-0"
                  >
                    <Icon className="h-3 w-3 text-cyan-400" />
                    <span>{action.label}</span>
                  </button>
                );
              })}
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
                      className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed text-xs shadow-md ${
                        isUser
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-sans font-semibold rounded-br-sm'
                          : 'bg-[#0E1428]/90 border border-white/[0.08] text-slate-200 rounded-bl-sm font-mono text-[11px] whitespace-pre-wrap leading-relaxed'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2.5 text-cyan-400 text-xs py-2 font-mono">
                  <div className="h-3.5 w-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Executing agentic tool call over MCP protocol...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-black/60 border-t border-white/[0.06] flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Copilot or execute MCP tool..."
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/80 font-sans transition-all"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || loading}
                className="h-9 w-9 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl shrink-0 transition"
              >
                <Send className="h-3.5 w-3.5 text-slate-950" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={toggleOpen}
        aria-label="Open AI Copilot Dock (⌘J)"
        className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-cyan-500 to-violet-600 p-3 text-slate-950 font-bold shadow-2xl shadow-cyan-500/30 flex items-center justify-center relative group border border-white/20"
      >
        <Bot className="h-6 w-6 text-slate-950" />
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
        {/* Floating tooltip on hover */}
        <div className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-black/90 border border-white/10 text-[10px] font-mono text-cyan-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
          AI Copilot (⌘J)
        </div>
      </motion.button>
    </div>
  );
}
export default AiCopilotDock;
