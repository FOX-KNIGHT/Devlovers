'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Radio, ArrowUpDown, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import data from './data.js';
import { soundFx } from '@/lib/audio/sound-fx';

function SidebarLeft({
  isMobileVisible,
  isCollapsed,
  handleSidebarToggle,
  activeHackathon,
  setActiveHackathon,
  showToast,
}) {
  const [activeSort, setActiveSort] = useState('Newest');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortOptions = ['Newest', 'Oldest', 'High Bounty', 'Deadline Soon'];

  const handleSelectSort = (option) => {
    soundFx.playClick();
    setActiveSort(option);
    setIsSortOpen(false);
    if (showToast) showToast(`Sorted by: ${option}`);
  };

  const handleHackathonClick = (h) => {
    soundFx.playClick();
    setActiveHackathon(h);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 68 : 260 }}
      transition={{ type: 'spring', stiffness: 350, damping: 35 }}
      className={`relative z-20 flex flex-col border-r border-white/10 bg-[#0C0F1D]/75 backdrop-blur-xl shrink-0 overflow-hidden ${
        isMobileVisible ? 'flex' : 'hidden md:flex'
      }`}
      aria-label="Active Sprints Navigation"
    >
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-white/10 px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Live Sprints
            </span>
          </div>
        )}
        <div className="hud-tag text-[9px] mx-auto">
          {data.hackathons.length} CHANNELS
        </div>
      </div>

      {/* Sort Dropdown */}
      {!isCollapsed && (
        <div className="p-3 border-b border-white/5 relative">
          <button
            type="button"
            onClick={() => setIsSortOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#141A2E]/60 border border-white/5 text-xs text-slate-300 hover:border-cyan-500/30 transition-colors"
          >
            <span className="font-mono text-[11px]">Sort: <strong className="text-cyan-400">{activeSort}</strong></span>
            {isSortOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          <AnimatePresence>
            {isSortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-12 left-3 right-3 z-30 rounded-xl border border-white/10 bg-[#0C0F1D]/95 p-1 shadow-2xl backdrop-blur-xl space-y-0.5"
              >
                {sortOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelectSort(opt)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition ${
                      activeSort === opt
                        ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Hackathons List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {data.hackathons.map((h) => {
          const isActive = activeHackathon?.id === h.id;
          const isLive = h.status?.toUpperCase() === 'ACTIVE';

          return (
            <button
              key={h.id}
              onClick={() => handleHackathonClick(h)}
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
                  <div className="font-medium truncate text-white">{h.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                    {h.status}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </motion.aside>
  );
}

export default React.memo(SidebarLeft);
