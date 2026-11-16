'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Info } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-fx';
import { useI18n } from '@/lib/i18n/context';

function SubNav({ currentPage, setCurrentPage }) {
  const { t } = useI18n();

  const navItems = useMemo(() => [
    { label: t('nav.hackathons'), icon: Trophy, pageName: 'Hackathon', count: '6 Live' },
    { label: t('nav.community'), icon: Users, pageName: 'Devlovers', count: '10k+' },
    { label: t('nav.mission'), icon: Info, pageName: 'About' },
  ], [t]);

  const handleNavClick = (pageName) => {
    soundFx.playClick();
    setCurrentPage(pageName);
  };

  return (
    <div className="w-full border-b border-white/10 bg-[var(--color-void)]/90 backdrop-blur-md sticky top-16 z-30 px-4 sm:px-6">
      <nav className="flex items-center gap-1.5 h-12 overflow-x-auto no-scrollbar" role="tablist">
        {navItems.map((item) => {
          const isActive = currentPage === item.pageName;
          const Icon = item.icon;

          return (
            <button
              key={item.pageName}
              onClick={() => handleNavClick(item.pageName)}
              role="tab"
              aria-selected={isActive}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className="h-3.5 w-3.5 text-cyan-400" />
              <span>{item.label}</span>
              {item.count && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-white/5 text-slate-500'
                  }`}
                >
                  {item.count}
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

export default React.memo(SubNav);
