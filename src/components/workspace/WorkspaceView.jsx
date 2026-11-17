'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  KeyRound,
  Radar,
  Scale,
  ShieldCheck,
  Cpu,
  Zap,
  Activity,
} from 'lucide-react';
import { SquadMatchmakerDock } from './SquadMatchmakerDock.jsx';
import { SponsorDispensary } from './SponsorDispensary.jsx';
import { SubmissionsRadarMatrix } from './SubmissionsRadarMatrix.jsx';
import { JudgingConsole } from './JudgingConsole.jsx';
import { soundFx } from '@/lib/audio/sound-fx';

const WORKSPACE_TABS = [
  {
    id: 'matchmaker',
    label: 'Squad Matchmaker',
    sublabel: 'Semantic Formation',
    icon: Users,
    badge: 'AI Mesh v2',
    accent: 'cyan',
  },
  {
    id: 'dispensary',
    label: 'Sponsor Dispensary',
    sublabel: 'Sandboxed Keys',
    icon: KeyRound,
    badge: '$345 Pool',
    accent: 'amber',
  },
  {
    id: 'radar',
    label: 'Radar Matrix',
    sublabel: 'Multi-Axial Canvas',
    icon: Radar,
    badge: '4-Pillar',
    accent: 'violet',
  },
  {
    id: 'judging',
    label: 'Judging Console',
    sublabel: 'Anti-Bias Engine',
    icon: Scale,
    badge: 'Z-Score Normalizer',
    accent: 'emerald',
  },
];

export function WorkspaceView() {
  const [activeTab, setActiveTab] = useState('matchmaker');

  const handleTabChange = (tabId) => {
    soundFx.playClick();
    setActiveTab(tabId);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* ==============================================================================
          STUDIO MISSION CONTROL HEADER
          ============================================================================== */}
      <div className="relative rounded-3xl p-6 sm:p-8 luxury-glass overflow-hidden border border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)]">
        {/* Ambient atmospheric glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            {/* Telemetry Status Line */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 font-mono text-[10px] tracking-wider uppercase font-semibold">
                <Cpu className="h-3 w-3 text-cyan-400" />
                <span>MCP Runtime v2024-11-05</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-mono text-[10px] tracking-wider font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span>Sub-15ms Latency Mesh</span>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-400 font-mono text-[10px]">
                <ShieldCheck className="h-3 w-3 text-cyan-400" />
                <span>Zero-Bias Blind Judging</span>
              </div>
            </div>

            {/* Platform Master Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Interactive Agent Studio</span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-400/30 text-cyan-300">
                PRO COCKPIT
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300/80 max-w-2xl leading-relaxed font-normal">
              High-velocity autonomous squad assembly, sandboxed cloud sponsor token distribution, multi-axial submission radars, and anti-bias peer evaluation.
            </p>
          </div>

          {/* Quick HUD Telemetry Podium */}
          <div className="grid grid-cols-3 gap-2.5 bg-[#080C1A]/90 p-2 sm:p-2.5 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] shrink-0">
            <div className="px-3.5 py-2 text-center rounded-xl bg-white/[0.02]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400/90 font-medium">Synergy</div>
              <div className="text-base sm:text-lg font-bold text-cyan-400 font-mono tracking-tight flex items-center justify-center gap-1">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                <span>99.4%</span>
              </div>
            </div>

            <div className="px-3.5 py-2 text-center rounded-xl bg-white/[0.02] border-x border-white/[0.06]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400/90 font-medium">Tokens</div>
              <div className="text-base sm:text-lg font-bold text-amber-400 font-mono tracking-tight">
                $345/tm
              </div>
            </div>

            <div className="px-3.5 py-2 text-center rounded-xl bg-white/[0.02]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400/90 font-medium">Anti-Bias</div>
              <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono tracking-tight flex items-center justify-center gap-1">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                <span>Z-Score</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==============================================================================
          SEGMENTED STUDIO NAVIGATION DOCK
          ============================================================================== */}
      <div className="p-1.5 rounded-2xl bg-[#080C1A]/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5" role="tablist">
          {WORKSPACE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                role="tab"
                aria-selected={isActive}
                className={`relative group flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all select-none text-left ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                {/* Active spring pill indicator */}
                {isActive && (
                  <motion.div
                    layoutId="workspaceActiveIndicator"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/15 via-cyan-500/10 to-violet-500/10 border border-cyan-400/40 shadow-[0_0_20px_rgba(0,245,255,0.15)]"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                  />
                )}

                <div
                  className={`relative z-10 p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                      : 'bg-white/[0.04] text-slate-400 group-hover:text-slate-200 group-hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="relative z-10 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold tracking-tight truncate">
                      {tab.label}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400/80 font-mono truncate">
                    {tab.sublabel}
                  </div>
                </div>

                {tab.badge && (
                  <div className="relative z-10 hidden sm:block">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-medium ${
                        isActive
                          ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/30'
                          : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ==============================================================================
          ACTIVE WORKSPACE MODULE VIEWPORT
          ============================================================================== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.995 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {activeTab === 'matchmaker' && <SquadMatchmakerDock />}
          {activeTab === 'dispensary' && <SponsorDispensary />}
          {activeTab === 'radar' && <SubmissionsRadarMatrix />}
          {activeTab === 'judging' && <JudgingConsole />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
export default WorkspaceView;
