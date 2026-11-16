'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Info, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { soundFx } from '@/lib/audio/sound-fx';

export function SubNav({ currentPage, onPageChange }) {
  const { t } = useI18n();

  const tabs = [
    { id: 'Hackathon', label: t('nav.hackathons'), icon: Trophy, count: '6 Live' },
    { id: 'Devlovers', label: t('nav.community'), icon: Users, count: '10k+' },
    { id: 'About', label: t('nav.mission'), icon: Info },
  ];

  return (
    <div className="w-full border-b border-white/10 bg-[#06080F]/90 backdrop-blur-md sticky top-16 z-30 px-4 sm:px-6">
      <nav className="flex items-center gap-1.5 h-12 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                onPageChange(tab.id);
              }}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.count && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-white/5 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}

              {isActive && (
                <motion.div
                  layoutId="activeSubNavTab"
                  className="absolute inset-0 rounded-lg border border-cyan-400/40 bg-cyan-500/10 -z-10 shadow-[0_0_15px_rgba(0,245,255,0.15)]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
