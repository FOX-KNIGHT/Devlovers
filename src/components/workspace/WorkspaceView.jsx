'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Key,
  Radar,
  Scale,
} from 'lucide-react';
import { SquadMatchmakerDock } from './SquadMatchmakerDock.jsx';
import { SponsorDispensary } from './SponsorDispensary.jsx';
import { SubmissionsRadarMatrix } from './SubmissionsRadarMatrix.jsx';
import { JudgingConsole } from './JudgingConsole.jsx';
import { soundFx } from '@/lib/audio/sound-fx';

const WORKSPACE_TABS = [
  { id: 'matchmaker', label: 'Squad Matchmaker', icon: Users, badge: 'AI v2' },
  { id: 'dispensary', label: 'Sponsor Dispensary', icon: Key, badge: '$345 Credits' },
  { id: 'radar', label: 'Radar Matrix', icon: Radar, badge: '4-Pillar' },
  { id: 'judging', label: 'Judging Console', icon: Scale, badge: 'Anti-Bias' },
];

export function WorkspaceView() {
  const [activeTab, setActiveTab] = useState('matchmaker');

  const handleTabChange = (tabId) => {
    soundFx.playClick();
    setActiveTab(tabId);
  };

  return (
    <div className="space-y-6">
      {/* Top Telemetry Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900/90 via-slate-950/90 to-cyan-950/30 border border-white/10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="hud-tag text-[10px] text-cyan-400 border-cyan-400/40 font-mono">
                PHASE 4: MCP APPS WORKSPACE
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Agentic Studio
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Interactive Hackathon Dynamic Workspace
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl mt-1.5 leading-relaxed">
              Autonomous squad assembly, sandboxed sponsor API distribution, real-time multi-axial evaluation radars, and blind anti-bias judging consoles.
            </p>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex items-center gap-3 bg-black/60 p-2.5 rounded-2xl border border-white/10 shrink-0">
            <div className="px-3 py-1.5 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-400">Squad Synergy</div>
              <div className="text-base font-bold text-cyan-400 font-mono">98%</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="px-3 py-1.5 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-400">Sandbox Pool</div>
              <div className="text-base font-bold text-amber-400 font-mono">$345/team</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="px-3 py-1.5 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-400">Judging Pass</div>
              <div className="text-base font-bold text-violet-400 font-mono">Blind Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-white/10 pb-2">
        {WORKSPACE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${
                    isActive
                      ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/30'
                      : 'bg-white/5 text-slate-500'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content Container */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'matchmaker' && <SquadMatchmakerDock />}
        {activeTab === 'dispensary' && <SponsorDispensary />}
        {activeTab === 'radar' && <SubmissionsRadarMatrix />}
        {activeTab === 'judging' && <JudgingConsole />}
      </motion.div>
    </div>
  );
}
