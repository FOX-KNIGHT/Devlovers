'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Globe } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function LanguageSelector() {
  const { locale, setLocale, availableLocales } = useI18n();

  const names = {
    en: 'English (US)',
    es: 'Español (ES)',
    ja: '日本語 (JA)',
  };

  const flags = {
    en: '🇺🇸',
    es: '🇪🇸',
    ja: '🇯🇵',
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs font-mono text-slate-400 hover:text-cyan-400 hover:bg-white/5"
        >
          <Globe className="h-3.5 w-3.5 text-cyan-400" />
          <span className="uppercase">{locale}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 p-1 border-white/10 bg-[#0C0F1D]/95">
        <div className="p-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-500 border-b border-white/5 mb-1">
          Select Language
        </div>
        <div className="space-y-0.5">
          {availableLocales.map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setLocale(loc);
                toast(`Language switched to ${names[loc]}`);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                locale === loc
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{names[loc]}</span>
              <span className="text-sm">{flags[loc]}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
