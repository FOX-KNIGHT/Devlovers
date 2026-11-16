'use client';

import React, { useState } from 'react';
import { Flame, Mail, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/audio/sound-fx';
import { useI18n } from '@/lib/i18n/context';
import data from './data.js';
import { toast } from 'sonner';

function RightSidebar() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');

  const handleTrendingClick = (item) => {
    soundFx.playClick();
    toast.info(`Trending: ${item.title}`, {
      description: item.details,
    });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    soundFx.playSuccess();
    toast.success('Subscribed to Global Dispatch', {
      description: `Weekly sprint updates sent to ${email}`,
    });
    setEmail('');
  };

  return (
    <aside className="hidden lg:flex w-72 flex-col gap-6 border-l border-white/10 bg-[#0C0F1D]/50 backdrop-blur-xl p-5 shrink-0" aria-label="Trending and Newsletter">
      {/* Trending Challenges */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
          <Flame className="h-4 w-4 text-amber-400" />
          <span>{t('nav.trending')}</span>
        </div>

        <div className="space-y-2">
          {data.trending.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => handleTrendingClick(item)}
              className="w-full text-left p-3 rounded-xl border border-white/5 bg-[#141A2E]/50 hover:border-cyan-500/30 hover:bg-[#141A2E]/80 transition-all group"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition truncate">
                {item.title}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
                <span
                  className={
                    item.className === 'danger-text'
                      ? 'text-rose-400 font-medium'
                      : item.className === 'success-text'
                      ? 'text-emerald-400 font-medium'
                      : 'text-slate-400'
                  }
                >
                  {item.details}
                </span>
                <span className="text-slate-600 group-hover:text-cyan-400">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Global Newsletter Dispatch */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 to-violet-950/30 p-4 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Sparkles className="h-16 w-16 text-cyan-400" />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 font-mono uppercase">
          <Mail className="h-3.5 w-3.5" />
          <span>{t('nav.globalDispatch')}</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Curated high-bounty sprints, sponsor API credentials, and invite codes.
        </p>

        <form onSubmit={handleSubscribe} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="developer@domain.com"
            required
            className="w-full h-9 rounded-lg bg-[#0C0F1D] border border-white/10 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <Button type="submit" variant="cyber" size="sm" className="w-full text-xs font-semibold h-8">
            <Send className="h-3 w-3 mr-1.5" />
            {t('nav.subscribe')}
          </Button>
        </form>
      </div>
    </aside>
  );
}

export default React.memo(RightSidebar);
