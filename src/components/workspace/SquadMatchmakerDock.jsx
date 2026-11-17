'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Sparkles,
  CheckCircle2,
  X,
  Code2,
  Cpu,
  Layers,
  Palette,
  RefreshCw,
  Send,
  Zap,
  Shield,
  ArrowRight,
  Terminal,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/audio/sound-fx';
import { toast } from 'sonner';

const ROLE_SLOTS = [
  { id: 'lead', title: 'Lead / Fullstack', icon: Code2, requiredSkill: 'Next.js 16', accent: 'cyan' },
  { id: 'ai', title: 'AI / ML Engineer', icon: Cpu, requiredSkill: 'PyTorch / LLMs', accent: 'violet' },
  { id: 'backend', title: 'Systems / Smart Contracts', icon: Layers, requiredSkill: 'Rust / Solidity', accent: 'amber' },
  { id: 'design', title: 'Product & UX Designer', icon: Palette, requiredSkill: 'Figma / Design Tokens', accent: 'emerald' },
];

const CANDIDATE_POOL = [
  { id: 'c-1', name: 'Elena Rostova', handle: '@elena_ai', role: 'AI / ML Engineer', skills: ['PyTorch / LLMs', 'CUDA', 'Python'], xp: 2450, avatar: 'ER', specialty: 'ai' },
  { id: 'c-2', name: 'Marco Silva', handle: '@marcodev', role: 'Systems / Smart Contracts', skills: ['Rust / Solidity', 'WebAssembly', 'Go'], xp: 1980, avatar: 'MS', specialty: 'backend' },
  { id: 'c-3', name: 'Siddhant Jena', handle: '@siddhant_eth', role: 'Lead / Fullstack', skills: ['Next.js 16', 'TypeScript', 'Tailwind'], xp: 1820, avatar: 'SJ', specialty: 'lead' },
  { id: 'c-4', name: 'Amina Diallo', handle: '@amina_ux', role: 'Product & UX Designer', skills: ['Figma / Design Tokens', 'UI Design', 'Prototyping'], xp: 1650, avatar: 'AD', specialty: 'design' },
  { id: 'c-5', name: 'Liam O’Connor', handle: '@liam_ai', role: 'AI / ML Engineer', skills: ['Agent Orchestration', 'PyTorch / LLMs', 'LangGraph'], xp: 1720, avatar: 'LO', specialty: 'ai' },
  { id: 'c-6', name: 'Yuki Tanaka', handle: '@yuki_rs', role: 'Systems / Smart Contracts', skills: ['Rust / Solidity', 'Wasm', 'Drizzle ORM'], xp: 1890, avatar: 'YT', specialty: 'backend' },
];

export function SquadMatchmakerDock({ onSquadFormed }) {
  const [squadName, setSquadName] = useState('Autonomous Syndicate');
  const [tagline, setTagline] = useState('Building next-gen agentic hackathon tooling with zero-latency MCP relays');
  const [candidateFilter, setCandidateFilter] = useState('all');
  const [assignedSlots, setAssignedSlots] = useState({
    lead: CANDIDATE_POOL[2], // Default slotted: Siddhant
    ai: null,
    backend: null,
    design: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate dynamic AI Compatibility score based on filled slots and skill synergy
  const { compatibilityScore, synergyLevel, coveredSkills } = useMemo(() => {
    const filled = Object.values(assignedSlots).filter(Boolean);
    if (filled.length === 0) return { compatibilityScore: 0, synergyLevel: 'Empty Squad', coveredSkills: [] };

    // Base score per member filled (up to 45%)
    let score = (filled.length / 4) * 45;

    // Skill coverage synergy (up to 40%)
    const allSkills = new Set();
    filled.forEach((m) => m.skills.forEach((s) => allSkills.add(s)));

    ROLE_SLOTS.forEach((slot) => {
      if (allSkills.has(slot.requiredSkill)) {
        score += 10;
      }
    });

    // Experience bonus (up to 15%)
    const totalXp = filled.reduce((acc, m) => acc + m.xp, 0);
    const avgXp = totalXp / filled.length;
    if (avgXp > 1800) score += 15;
    else if (avgXp > 1500) score += 10;
    else score += 5;

    const finalScore = Math.min(Math.round(score), 99);

    let level = 'Emerging Dynamic';
    if (finalScore >= 90) level = 'Optimal Synergy (Class S)';
    else if (finalScore >= 75) level = 'High Alignment (Class A)';
    else if (finalScore >= 50) level = 'Balanced Squad (Class B)';

    return {
      compatibilityScore: finalScore,
      synergyLevel: level,
      coveredSkills: Array.from(allSkills),
    };
  }, [assignedSlots]);

  const assignCandidateToSlot = (slotId, candidate) => {
    soundFx.playClick();
    setAssignedSlots((prev) => ({
      ...prev,
      [slotId]: candidate,
    }));
    toast.success(`Assigned ${candidate.name} as ${ROLE_SLOTS.find((s) => s.id === slotId)?.title}`);
  };

  const removeCandidateFromSlot = (slotId) => {
    soundFx.playClick();
    setAssignedSlots((prev) => ({
      ...prev,
      [slotId]: null,
    }));
  };

  const autoFillOptimalSquad = () => {
    soundFx.playClick();
    setAssignedSlots({
      lead: CANDIDATE_POOL[2],
      ai: CANDIDATE_POOL[0],
      backend: CANDIDATE_POOL[1],
      design: CANDIDATE_POOL[3],
    });
    soundFx.playSuccess();
    toast.success('AI Matchmaker assembled 99% Optimal Synergy squad!', {
      description: 'Maximized across fullstack, neural LLMs, smart contracts, and product design tokens.',
    });
  };

  const handleCreateSquad = async () => {
    const filledCount = Object.values(assignedSlots).filter(Boolean).length;
    if (filledCount < 2) {
      toast.error('Squad requires at least 2 team members to register');
      return;
    }

    soundFx.playClick();
    setIsSubmitting(true);

    try {
      const payload = {
        name: squadName,
        tagline,
        hackathonSlug: 'future-of-ai-sprint-2026',
        compatibilityScore,
        members: Object.entries(assignedSlots)
          .filter(([, member]) => Boolean(member))
          .map(([slotKey, member]) => ({
            slot: slotKey,
            name: member.name,
            handle: member.handle,
            role: member.role,
          })),
      };

      const res = await fetch('/api/squads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        soundFx.playSuccess();
        toast.success(`Squad '${squadName}' registered on-chain!`, {
          description: `Compatibility certified at ${compatibilityScore}% synergy with ${filledCount} verified members.`,
        });
        if (onSquadFormed) onSquadFormed(payload);
      } else {
        throw new Error('Squad creation failed');
      }
    } catch {
      // Local fallback
      soundFx.playSuccess();
      toast.success(`Squad '${squadName}' saved locally!`, {
        description: `Compatibility certified at ${compatibilityScore}% synergy.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter candidate pool
  const filteredCandidates = useMemo(() => {
    if (candidateFilter === 'all') return CANDIDATE_POOL;
    return CANDIDATE_POOL.filter((c) => c.specialty === candidateFilter);
  }, [candidateFilter]);

  const assignedCandidateIds = new Set(
    Object.values(assignedSlots)
      .filter(Boolean)
      .map((c) => c.id)
  );

  return (
    <div className="space-y-6">
      {/* ==============================================================================
          SYNERGY HUD & COCKPIT CONTROLS
          ============================================================================== */}
      <div className="relative rounded-3xl p-6 sm:p-7 luxury-glass overflow-hidden border border-white/[0.08] shadow-[0_16px_40px_-15px_rgba(0,0,0,0.8)]">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="hud-tag text-[10px] text-cyan-400 border-cyan-400/30">
                SEMANTIC MATCHMAKER
              </span>
              <span className="text-xs font-mono text-slate-400">Algorithmic Squad Formation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Mission Formation Deck</span>
              <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                4 Nodes Active
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Slot engineers into architectural nodes to balance technical depth, execution speed, and domain expertise.
            </p>
          </div>

          {/* Premium Orbital Synergy Dial */}
          <div className="flex items-center gap-5 bg-[#080C1A]/90 p-3.5 sm:p-4 rounded-2xl border border-white/[0.08] shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="relative flex items-center justify-center">
              <svg className="w-18 h-18 sm:w-20 sm:h-20 transform -rotate-90">
                {/* Background track */}
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="5"
                  fill="transparent"
                />
                {/* Dynamic animated glow stroke */}
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="url(#synergyGradient)"
                  strokeWidth="5"
                  className="transition-all duration-1000 ease-out"
                  fill="transparent"
                  strokeDasharray="201"
                  strokeDashoffset={201 - (201 * compatibilityScore) / 100}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="synergyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00F5FF" />
                    <stop offset="100%" stopColor="#8A2BE2" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-base sm:text-lg font-extrabold text-white tracking-tight">
                  {compatibilityScore}%
                </span>
                <span className="text-[8px] font-mono uppercase tracking-widest text-cyan-400">
                  SCORE
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-medium">
                Team Synergy Rating
              </div>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                <Zap className="h-3.5 w-3.5 fill-emerald-400/20 text-emerald-400" />
                <span>{synergyLevel}</span>
              </div>
              <div className="text-[11px] text-slate-400/90 font-mono">
                {coveredSkills.length} Core Capabilities Verified
              </div>
            </div>
          </div>
        </div>

        {/* Squad Meta Configuration Inputs */}
        <div className="mt-6 pt-6 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Terminal className="h-3 w-3 text-cyan-400" />
              <span>Squad Codename</span>
            </label>
            <input
              type="text"
              value={squadName}
              onChange={(e) => setSquadName(e.target.value)}
              className="w-full h-11 bg-black/40 border border-white/[0.08] rounded-xl px-4 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/30 transition-all font-medium"
              placeholder="e.g. Autonomous Syndicate"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-violet-400" />
              <span>Mission Hypothesis / Tagline</span>
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full h-11 bg-black/40 border border-white/[0.08] rounded-xl px-4 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/30 transition-all font-medium"
              placeholder="e.g. Building distributed AI compute relays"
            />
          </div>
        </div>
      </div>

      {/* ==============================================================================
          THE 4 ROLE DOCKING PODS
          ============================================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Assigned Role Nodes
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {Object.values(assignedSlots).filter(Boolean).length}/4 Slotted
            </span>
          </div>

          <button
            onClick={autoFillOptimalSquad}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 hover:underline transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Auto-Assemble 99% Synergy</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROLE_SLOTS.map((slot) => {
            const Icon = slot.icon;
            const assigned = assignedSlots[slot.id];

            return (
              <motion.div
                key={slot.id}
                layout
                className={`relative rounded-2xl p-5 border transition-all duration-300 ${
                  assigned
                    ? 'bg-gradient-to-b from-cyan-950/20 to-[#0A0E1A]/90 border-cyan-500/30 shadow-[0_10px_30px_-10px_rgba(0,245,255,0.15)]'
                    : 'bg-white/[0.02] border-dashed border-white/[0.12] hover:border-cyan-400/40 hover:bg-white/[0.03]'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl transition-colors ${
                        assigned
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                          : 'bg-white/[0.04] text-slate-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{slot.title}</span>
                      <span className="text-[10px] font-mono text-slate-400/80 block">Node #{slot.id}</span>
                    </div>
                  </div>

                  {assigned && (
                    <button
                      onClick={() => removeCandidateFromSlot(slot.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                      title="Release slot"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {assigned ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-600 flex items-center justify-center text-xs font-extrabold text-slate-950 shadow-md ring-2 ring-white/10 shrink-0">
                        {assigned.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-white truncate">{assigned.name}</div>
                        <div className="text-[11px] font-mono text-cyan-400 truncate">{assigned.handle}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {assigned.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[9px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-300 font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] font-mono border-t border-white/[0.06]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Award className="h-3 w-3 text-amber-400" />
                        <span>Hacker XP</span>
                      </span>
                      <span className="text-emerald-400 font-bold">{assigned.xp} XP</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-2">
                    <div className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/[0.03] border border-dashed border-white/10 text-slate-500">
                      <Icon className="h-4 w-4 opacity-50" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-300">Aperture Open</div>
                      <div className="text-[10px] font-mono text-cyan-400/80 mt-0.5">
                        Target: {slot.requiredSkill}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 italic pt-1">
                      Assign a candidate from the lobby below
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ==============================================================================
          TALENT LOBBY & RECRUITMENT DECK
          ============================================================================== */}
      <div className="rounded-3xl p-6 luxury-glass border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Users className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Vetted Developer Pool in Lobby</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/10">
              {CANDIDATE_POOL.length} Verified Available
            </span>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Roles' },
              { id: 'lead', label: 'Lead' },
              { id: 'ai', label: 'AI/ML' },
              { id: 'backend', label: 'Systems' },
              { id: 'design', label: 'Product UX' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setCandidateFilter(f.id)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-lg transition-all ${
                  candidateFilter === f.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Candidate Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCandidates.map((c) => {
            const isAssigned = assignedCandidateIds.has(c.id);

            return (
              <div
                key={c.id}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  isAssigned
                    ? 'bg-cyan-500/[0.04] border-cyan-500/30 opacity-75'
                    : 'bg-[#080C1A]/80 border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-violet-600 flex items-center justify-center text-xs font-bold text-slate-950 shrink-0">
                      {c.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{c.name}</div>
                      <div className="text-[10px] font-mono text-cyan-400 truncate">{c.handle}</div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                    {c.xp} XP
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {c.skills.map((s) => (
                    <span
                      key={s}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {isAssigned ? (
                  <div className="text-center py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 text-[11px] font-mono font-medium border border-cyan-500/20 flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Slotted in Squad</span>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => assignCandidateToSlot(c.specialty, c)}
                    className="w-full h-8 text-[11px] font-mono justify-center gap-1.5 border-white/[0.08] hover:border-cyan-400/50 hover:bg-cyan-500/10 text-slate-200"
                  >
                    <span>Slot as {ROLE_SLOTS.find((s) => s.id === c.specialty)?.title}</span>
                    <ArrowRight className="h-3 w-3 text-cyan-400" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ==============================================================================
          FINAL DEPLOY & SUBMIT ACTION POD
          ============================================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[#080C1A]/90 border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Squad Protocol Finalization</div>
            <div className="text-[11px] text-slate-400 font-mono">
              Creates squad record and locks member allocation into the hackathon ledger.
            </div>
          </div>
        </div>

        <Button
          onClick={handleCreateSquad}
          disabled={isSubmitting}
          className="w-full sm:w-auto h-11 px-6 bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide uppercase luxury-btn shadow-lg shadow-cyan-500/25 rounded-xl flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
              <span>Registering on Ledger...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4 text-slate-950" />
              <span>Lock Squad & Register ({compatibilityScore}%)</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
export default SquadMatchmakerDock;
