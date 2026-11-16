'use client';

import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  MessageSquare,
  Clock,
  Trophy,
  Terminal,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useAppContext } from './AppContext.jsx';
import { soundFx } from '@/lib/audio/sound-fx';

function getCategoryIcon(category) {
  switch (category) {
    case 'feedback':
      return <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />;
    case 'deadline':
      return <Clock className="h-3.5 w-3.5 text-amber-400" />;
    case 'joined':
      return <Trophy className="h-3.5 w-3.5 text-emerald-400" />;
    case 'system':
      return <Terminal className="h-3.5 w-3.5 text-violet-400" />;
    case 'submission':
      return <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />;
    default:
      return <Sparkles className="h-3.5 w-3.5 text-slate-400" />;
  }
}

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter((n) => n.unread);
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleItemClick = (id) => {
    soundFx.playClick();
    markNotificationAsRead(id);
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    soundFx.playSuccess();
    markAllNotificationsAsRead();
  };

  return (
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
      <PopoverContent align="end" className="w-84 p-0 border-white/10 bg-[#0C0F1D]/98 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-3.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Notifications
            </span>
            <span className="hud-tag text-[9px]">{unreadCount} new</span>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline font-mono cursor-pointer"
            >
              <CheckCheck className="h-3 w-3" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/5 bg-[#141A2E]/40 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-2 py-0.5 rounded-md transition ${
              activeTab === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={`px-2 py-0.5 rounded-md transition ${
              activeTab === 'unread' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <p className="p-4 text-center text-xs text-slate-500 font-mono">
              {activeTab === 'unread' ? 'No unread notifications.' : 'No notifications.'}
            </p>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleItemClick(n.id)}
                className={`p-3 text-xs text-slate-300 hover:bg-white/5 transition cursor-pointer flex items-start gap-2.5 ${
                  n.unread ? 'bg-cyan-500/[0.03]' : ''
                }`}
              >
                <div className="p-1 rounded-md bg-[#141A2E] border border-white/10 shrink-0 mt-0.5">
                  {getCategoryIcon(n.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-slate-200 leading-snug ${n.unread ? 'font-medium' : 'text-slate-400'}`}>
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                    <span className="text-[9px] uppercase font-mono px-1 rounded bg-white/5 text-slate-400">
                      {n.category}
                    </span>
                  </div>
                </div>
                {n.unread && (
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F5FF] shrink-0" />
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default React.memo(NotificationDropdown);
