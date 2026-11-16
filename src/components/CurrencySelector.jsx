'use client';

import React from 'react';
import { Coins } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/Project/LandingPage/AppContext';
import { soundFx } from '@/lib/audio/sound-fx';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export function CurrencySelector() {
  const { currency, setCurrency } = useAppContext();

  const handleSelect = (code) => {
    soundFx.playClick();
    setCurrency(code);
  };

  const current = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs font-mono text-slate-400 hover:text-cyan-400 hover:bg-white/5"
          aria-label="Select currency"
        >
          <Coins className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-semibold">{current.symbol}</span>
          <span className="hidden sm:inline uppercase text-[11px] text-slate-500">{current.code}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1 border-white/10 bg-[#0C0F1D]/95">
        <div className="p-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-500 border-b border-white/5 mb-1">
          Prize Currency
        </div>
        <div className="space-y-0.5">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => handleSelect(c.code)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition ${
                currency === c.code
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">{c.symbol}</span>
                <span>{c.code}</span>
              </div>
              <span className="text-[10px] text-slate-500">{c.name}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
