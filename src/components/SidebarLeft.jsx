'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Radio, ArrowUpDown, Sparkles } from 'lucide-react';

export function SidebarLeft({
  hackathons = [],
  activeHackathon,
  onSelectHackathon,
  isCollapsed = false,
}) {
  return (
    <aside
      className={`border-r border-white/10 bg-[#0C0F1D]/50 backdrop-blur-xl transition-all duration-300 flex flex-col shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Live Sprints
            </span>
          </div>
        )}
        <div className="hud-tag text-[9px] mx-auto">
          {hackathons.length} CHANNELS
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {hackathons.map((h) => {
          const isActive = activeHackathon?.id === h.id;
          const isLive = h.status === 'Active';

          return (
            <button
              key={h.id}
              onClick={() => onSelectHackathon(h)}
              title={h.name}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-xs transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/10 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(0,245,255,0.1)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="relative flex items-center justify-center shrink-0">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isLive ? 'bg-emerald-400' : 'bg-slate-600'
                  }`}
                />
                {isLive && (
                  <span className="animate-ping absolute h-3.5 w-3.5 rounded-full bg-emerald-400 opacity-60" />
                )}
              </div>

              {!isCollapsed && (
                <div className="flex-1 truncate">
                  <div className="font-medium truncate">{h.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                    {h.status}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
