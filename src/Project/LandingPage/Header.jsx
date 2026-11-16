'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  User,
  LogOut,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { GlobalCommandPalette } from '@/components/GlobalCommandPalette';
import { LanguageSelector } from '@/components/LanguageSelector';
import { CurrencySelector } from '@/components/CurrencySelector';
import { soundFx } from '@/lib/audio/sound-fx';
import { useAppContext } from './AppContext.jsx';
import { toast } from 'sonner';

function Header({ setCurrentPage }) {
  const {
    isLoggedIn,
    unreadCount,
    handleSidebarToggle,
    setIsSignInModalOpen,
    simulateLogout,
    isSidebarCollapsed,
    user,
    notifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
  } = useAppContext();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    setSoundEnabled(soundFx.isEnabled());
  }, []);

  const handleToggleSound = () => {
    const isNowOn = soundFx.toggle();
    setSoundEnabled(isNowOn);
    toast(isNowOn ? '🔊 Cyber audio effects enabled' : '🔇 Cyber audio effects muted');
  };

  const handleLogoClick = () => {
    soundFx.playClick();
    setCurrentPage('Hackathon');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#06080F]/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Menu toggle + Cyber Logo */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              soundFx.playClick();
              handleSidebarToggle();
            }}
            aria-label="Toggle navigation menu"
            className="text-slate-400 hover:text-cyan-400 hover:bg-white/5"
          >
            <Menu className="h-5 w-5 md:hidden" />
            <span className="hidden md:flex">
              {isSidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </span>
          </Button>

          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            role="button"
            tabIndex={0}
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 shadow-[0_0_15px_rgba(0,245,255,0.4)] group-hover:shadow-[0_0_25px_rgba(0,245,255,0.7)] transition-all">
              <Trophy className="h-4 w-4 text-slate-950 font-bold" />
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-600 opacity-30 blur-sm group-hover:opacity-75 transition" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Devlovers
                <span className="hud-tag text-[10px] tracking-widest text-cyan-400 border-cyan-400/40">
                  GLOBAL
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search -> Command Palette (cmdk) */}
        <div className="flex-1 max-w-md mx-4 sm:mx-6">
          <GlobalCommandPalette onSelectPage={setCurrentPage} />
        </div>

        {/* Right: Language, Sound FX, Theme, Notifications & Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Selector */}
          <LanguageSelector />

          {/* Currency Selector */}
          <CurrencySelector />

          {/* Sound FX Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleSound}
              aria-label="Toggle UI Audio Effects"
              title={soundEnabled ? 'Cyber Sound: Enabled' : 'Cyber Sound: Muted'}
              className="text-slate-400 hover:text-cyan-400 hover:bg-white/5 h-9 w-9"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-cyan-400" />
              ) : (
                <VolumeX className="h-4 w-4 opacity-50" />
              )}
            </Button>
          )}

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                soundFx.playClick();
                const nextTheme = theme === 'dark' ? 'light' : 'dark';
                setTheme(nextTheme);
                toast(`Switched to ${nextTheme} mode`);
              }}
              aria-label="Toggle Theme"
              className="text-slate-400 hover:text-amber-400 hover:bg-white/5 h-9 w-9"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-cyan-400" />
              )}
            </Button>
          )}

          {/* NotificationDropdown -> Popover/Sheet */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-400 hover:text-cyan-400 hover:bg-white/5 h-9 w-9"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 border-white/10 bg-[#0C0F1D]/98 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/10 p-3.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  Notifications
                </span>
                <div className="flex items-center gap-2">
                  <span className="hud-tag text-[10px]">{unreadCount} new</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[10px] text-cyan-400 hover:underline font-mono"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-500 font-mono">No new alerts.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className="p-3 text-xs text-slate-300 hover:bg-white/5 transition cursor-pointer flex items-start gap-2.5"
                    >
                      <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${n.unread ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                      <div>
                        <p className="font-medium text-slate-200">{n.message}</p>
                        <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Auth State */}
          {isLoggedIn && user ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-white/10 bg-[#0C0F1D] text-slate-200 hover:border-cyan-400/50"
                >
                  <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-slate-950">
                    {user.name?.[0] || 'U'}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium">{user.name}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-48 p-1.5 border-white/10 bg-[#0C0F1D]">
                <button
                  onClick={simulateLogout}
                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign out</span>
                </button>
              </PopoverContent>
            </Popover>
          ) : (
            <Button
              variant="cyber"
              size="sm"
              onClick={() => {
                soundFx.playClick();
                setIsSignInModalOpen(true);
              }}
              className="text-xs font-semibold px-4 h-9"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default React.memo(Header);