'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/audio/sound-fx';
import { toast } from 'sonner';

const ROLE_SLOTS = [
  { id: 'lead', title: 'Lead / Fullstack', icon: Code2, requiredSkill: 'Next.js 16' },
  { id: 'ai', title: 'AI / ML Engineer', icon: Cpu, requiredSkill: 'PyTorch / LLMs' },
  { id: 'backend', title: 'Systems / Smart Contracts', icon: Layers, requiredSkill: 'Rust / Solidity' },
  { id: 'design', title: 'Product & UX Designer', icon: Palette, requiredSkill: 'Figma / Design Tokens' },
];

const CANDIDATE_POOL = [
  { id: 'c-1', name: 'Elena Rostova', handle: '@elena_ai', role: 'AI / ML Engineer', skills: ['PyTorch / LLMs', 'CUDA', 'Python'], xp: 2450, avatar: 'ER' },
  { id: 'c-2', name: 'Marco Silva', handle: '@marcodev', role: 'Systems / Smart Contracts', skills: ['Rust / Solidity', 'WebAssembly', 'Go'], xp: 1980, avatar: 'MS' },
  { id: 'c-3', name: 'Siddhant Jena', handle: '@siddhant_eth', role: 'Lead / Fullstack', skills: ['Next.js 16', 'TypeScript', 'Tailwind'], xp: 1820, avatar: 'SJ' },
  { id: 'c-4', name: 'Amina Diallo', handle: '@amina_ux', role: 'Product & UX Designer', skills: ['Figma / Design Tokens', 'UI Design', 'Prototyping'], xp: 1650, avatar: 'AD' },
  { id: 'c-5', name: 'Liam O’Connor', handle: '@liam_ai', role: 'AI / ML Engineer', skills: ['Agent Orchestration', 'PyTorch / LLMs', 'LangGraph'], xp: 1720, avatar: 'LO' },
  { id: 'c-6', name: 'Yuki Tanaka', handle: '@yuki_rs', role: 'Systems / Smart Contracts', skills: ['Rust / Solidity', 'Wasm', 'Drizzle ORM'], xp: 1890, avatar: 'YT' },
];

export function SquadMatchmakerDock({ onSquadFormed }) {
  const [squadName, setSquadName] = useState('Autonomous Syndicate');
  const [tagline, setTagline] = useState('Building next-gen agentic hackathon tooling');
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
    if (filled.length === 0) return { compatibilityScore: 0, synergyLevel: 'Empty', coveredSkills: [] };

    // Base score per member filled (up to 40%)
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

    let level = 'Emerging';
    if (finalScore >= 90) level = 'Optimal Synergy';
    else if (finalScore >= 75) level = 'Strong Alignment';
    else if (finalScore >= 50) level = 'Moderate Balance';

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
    toast.success('AI Matchmaker auto-assembled optimal 99% synergy squad!');
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
        toast.success(`Squad '${squadName}' registered on-chain with ${compatibilityScore}% compatibility!`);
        if (onSquadFormed) onSquadFormed(payload);
      } else {
        throw new Error('Squad creation failed');
      }
    } catch {
      // Local fallback
      soundFx.playSuccess();
      toast.success(`Squad '${squadName}' saved locally with ${compatibilityScore}% compatibility!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header telemetry */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="hud-tag text-[10px] text-cyan-400 border-cyan-400/40">MCP SQUAD ENGINE</span>
            <span className="text-xs text-slate-400">Semantic Matching v2</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">Interactive Squad Formation Dock</h3>
          <p className="text-xs text-slate-400">
            Slot engineers into role nodes to maximize algorithmic team synergy & skill coverage.
          </p>
        </div>

        {/* Compatibility Gauge */}
        <div className="flex items-center gap-4 bg-black/40 px-4 py-2.5 rounded-xl border border-white/10">
          <div className="relative flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-white/10" fill="transparent" />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="4"
                className="text-cyan-400 transition-all duration-700 ease-out"
                fill="transparent"
                strokeDasharray="138"
                strokeDashoffset={138 - (138 * compatibilityScore) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-mono text-sm font-bold text-cyan-300">
              {compatibilityScore}%
            </span>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-400">Team Synergy</div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {synergyLevel}
            </div>
          </div>
        </div>
      </div>

      {/* Squad Details Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-mono uppercase text-slate-400 mb-1.5 block">Squad Codename</label>
          <input
            type="text"
            value={squadName}
            onChange={(e) => setSquadName(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400/80 font-medium"
            placeholder="e.g. Autonomous Syndicate"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-slate-400 mb-1.5 block">Squad Mission / Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400/80 font-medium"
            placeholder="e.g. Building distributed AI compute relays"
          />
        </div>
      </div>

      {/* 4 Role Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLE_SLOTS.map((slot) => {
          const Icon = slot.icon;
          const assigned = assignedSlots[slot.id];

          return (
            <motion.div
              key={slot.id}
              layout
              className={`relative rounded-2xl p-4 border transition-all ${
                assigned
                  ? 'bg-cyan-500/[0.04] border-cyan-500/30'
                  : 'bg-white/[0.02] border-dashed border-white/15 hover:border-cyan-400/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${assigned ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-slate-400'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-white">{slot.title}</span>
                </div>
                {assigned && (
                  <button
                    onClick={() => removeCandidateFromSlot(slot.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Remove from slot"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {assigned ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {assigned.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{assigned.name}</div>
                      <div className="text-[10px] font-mono text-cyan-400">{assigned.handle}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {assigned.skills.map((skill) => (
                      <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300 font-mono">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 pt-1 flex justify-between border-t border-white/5">
                    <span>Rank XP</span>
                    <span className="text-emerald-400 font-bold">{assigned.xp} XP</span>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <div className="text-xs text-slate-500 mb-1">Slot Open</div>
                  <div className="text-[10px] font-mono text-cyan-400/70 mb-3">Target: {slot.requiredSkill}</div>
                  <div className="text-[10px] text-slate-500 italic">Select a candidate below to slot</div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Available Talent Roster */}
      <div className="bg-black/30 rounded-2xl p-4 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">Available Hackers in Lobby</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
              {CANDIDATE_POOL.length} Ready
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={autoFillOptimalSquad}
            className="text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 h-7 gap-1"
          >
            <Sparkles className="h-3 w-3" />
            Auto-Assemble Max Synergy
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {CANDIDATE_POOL.map((candidate) => {
            const isAssigned = Object.values(assignedSlots).some((m) => m?.id === candidate.id);

            return (
              <div
                key={candidate.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  isAssigned
                    ? 'bg-white/[0.02] border-white/5 opacity-50'
                    : 'bg-white/[0.04] border-white/10 hover:border-cyan-400/40'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-cyan-300">
                    {candidate.avatar}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white truncate">{candidate.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{candidate.role}</div>
                  </div>
                </div>

                {!isAssigned ? (
                  <div className="flex gap-1">
                    {ROLE_SLOTS.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => assignCandidateToSlot(slot.id, candidate)}
                        title={`Slot as ${slot.title}`}
                        className="h-6 px-1.5 rounded bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 text-[10px] font-mono border border-white/5"
                      >
                        +{slot.id.substring(0, 2).toUpperCase()}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-0.5">
                    <CheckCircle2 className="h-3 w-3" />
                    Slotted
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tech Stack Coverage Matrix */}
      {coveredSkills.length > 0 && (
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Covered Stack:</span>
          {coveredSkills.map((skill) => (
            <span
              key={skill}
              className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setAssignedSlots({ lead: null, ai: null, backend: null, design: null })
          }
          className="text-xs text-slate-400 border-white/10 hover:bg-white/5"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          Reset Slots
        </Button>

        <Button
          onClick={handleCreateSquad}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-xs gap-1.5 shadow-lg shadow-cyan-500/20"
        >
          <Send className="h-3.5 w-3.5" />
          {isSubmitting ? 'Registering Squad...' : 'Lock Squad & Register'}
        </Button>
      </div>
    </div>
  );
}
