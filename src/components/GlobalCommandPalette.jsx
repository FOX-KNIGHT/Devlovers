'use client';

import React, { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@/components/ui/command';
import { useTheme } from 'next-themes';
import {
  Trophy,
  Users,
  Info,
  Moon,
  Sun,
  Flame,
  Search,
  Sparkles,
  Clock,
  Volume2,
} from 'lucide-react';
import data from '@/Project/LandingPage/data';
import { useAppContext } from '@/Project/LandingPage/AppContext';
import { soundFx } from '@/lib/audio/sound-fx';
import { toast } from 'sonner';

export function GlobalCommandPalette({ onSelectPage }) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toggleUTC, useUTC } = useAppContext();
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(navigator.platform?.toUpperCase().indexOf('MAC') >= 0);

    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (callback) => {
    setOpen(false);
    callback();
  };

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-[#0C0F1D]/80 hover:border-cyan-500/40 text-slate-400 hover:text-slate-200 cursor-pointer text-xs font-mono transition-colors"
      >
        <Search className="w-3.5 h-3.5 text-cyan-400" />
        <span>Quick search...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-white/10 px-1.5 font-mono text-[10px] font-medium text-slate-300">
          <span>{isMac ? '⌘' : 'Ctrl'}</span>K
        </kbd>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search hackathons, community, or commands..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => handleSelect(() => onSelectPage?.('Hackathon'))}>
              <Trophy className="mr-2 h-4 w-4 text-cyan-400" />
              <span>Hackathon Challenges</span>
              <CommandShortcut>G H</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect(() => onSelectPage?.('Devlovers'))}>
              <Users className="mr-2 h-4 w-4 text-emerald-400" />
              <span>Devlovers Community</span>
              <CommandShortcut>G D</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect(() => onSelectPage?.('About'))}>
              <Info className="mr-2 h-4 w-4 text-violet-400" />
              <span>About Platform</span>
              <CommandShortcut>G A</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Active Sprints & Challenges">
            {data.feedPosts.map((post) => (
              <CommandItem
                key={post.id}
                onSelect={() =>
                  handleSelect(() => {
                    onSelectPage?.('Hackathon');
                    toast.info(`Selected Sprint: ${post.title}`);
                  })
                }
              >
                <Trophy className="mr-2 h-4 w-4 text-cyan-400" />
                <span className="truncate">{post.title}</span>
                <span className="ml-auto font-mono text-[10px] text-cyan-300">
                  {post.status}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Theme & Settings">
            <CommandItem onSelect={() => handleSelect(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}>
              {theme === 'dark' ? (
                <Sun className="mr-2 h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="mr-2 h-4 w-4 text-cyan-400" />
              )}
              <span>Toggle Light / Dark Mode</span>
            </CommandItem>

            <CommandItem onSelect={() => handleSelect(() => toggleUTC())}>
              <Clock className="mr-2 h-4 w-4 text-amber-400" />
              <span>Toggle Timezone Mode ({useUTC ? 'UTC Active' : 'Local Active'})</span>
            </CommandItem>

            <CommandItem
              onSelect={() =>
                handleSelect(() => {
                  const nowOn = soundFx.toggle();
                  toast(nowOn ? '🔊 Sound effects enabled' : '🔇 Sound effects muted');
                })
              }
            >
              <Volume2 className="mr-2 h-4 w-4 text-cyan-400" />
              <span>Toggle Cyber Sound FX</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
