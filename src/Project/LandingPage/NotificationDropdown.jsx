'use client';

import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useAppContext } from './AppContext.jsx';
import { soundFx } from '@/lib/audio/sound-fx';

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
  } = useAppContext();

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
      <PopoverContent align="end" className="w-80 p-0 border-white/10 bg-[#0C0F1D]/98 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-3.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Notifications
          </span>
          <div className="flex items-center gap-2">
            <span className="hud-tag text-[10px]">{unreadCount} new</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1 text-[10px] text-cyan-400 hover:underline font-mono cursor-pointer"
              >
                <CheckCheck className="h-3 w-3" />
                <span>Clear</span>
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
                onClick={() => handleItemClick(n.id)}
                className="p-3 text-xs text-slate-300 hover:bg-white/5 transition cursor-pointer flex items-start gap-2.5"
              >
                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${n.unread ? 'bg-cyan-400 shadow-[0_0_8px_#00F5FF]' : 'bg-slate-600'}`} />
                <div className="flex-1">
                  <p className={`text-slate-200 ${n.unread ? 'font-medium' : 'text-slate-400'}`}>{n.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default React.memo(NotificationDropdown);
