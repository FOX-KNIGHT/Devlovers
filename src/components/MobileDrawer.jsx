'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy, Flame, Users, Info, X, Radio, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileDrawer({
  open,
  onOpenChange,
  hackathons = [],
  activeHackathon,
  onSelectHackathon,
  trending = [],
  currentPage,
  onSelectPage,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-y-0 left-0 z-50 h-full w-4/5 max-w-sm rounded-none border-r border-white/10 bg-[#0C0F1D]/98 p-6 shadow-2xl backdrop-blur-2xl transition ease-in-out safe-area-inset">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
              <Trophy className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-bold text-white">
              Navigation
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4 overflow-y-auto max-h-[calc(100vh-100px)]">
          {/* Quick Pages */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-2">
              Menu
            </div>
            <button
              onClick={() => {
                onSelectPage('Hackathon');
                onOpenChange(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                currentPage === 'Hackathon'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy className="h-4 w-4 text-cyan-400" />
              <span>Hackathon Challenges</span>
            </button>

            <button
              onClick={() => {
                onSelectPage('Leaderboard');
                onOpenChange(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                currentPage === 'Leaderboard'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="h-4 w-4 text-amber-400" />
              <span>Developer Leaderboard</span>
            </button>

            <button
              onClick={() => {
                onSelectPage('Devlovers');
                onOpenChange(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                currentPage === 'Devlovers'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="h-4 w-4 text-emerald-400" />
              <span>Devlovers Community</span>
            </button>

            <button
              onClick={() => {
                onSelectPage('About');
                onOpenChange(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                currentPage === 'About'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Info className="h-4 w-4 text-violet-400" />
              <span>About & Manifesto</span>
            </button>
          </div>

          {/* Live Channels */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-2">
              <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
              <span>Live Sprints</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onSelectHackathon({ id: 0, slug: 'all', name: 'All Sprints (Global)', status: 'ALL', category: 'all' });
                  onOpenChange(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition ${
                  !activeHackathon || activeHackathon.id === 0
                    ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <span className="truncate">All Sprints (Global)</span>
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
              </button>

              {hackathons.map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    onSelectHackathon(h);
                    onOpenChange(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition ${
                    activeHackathon?.id === h.id
                      ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{h.name}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      h.status === 'Active' ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-2">
              <Flame className="h-3 w-3 text-amber-400" />
              <span>Trending</span>
            </div>
            <div className="space-y-1.5">
              {trending.slice(0, 3).map((item) => (
                <div key={item.id} className="text-xs p-2 rounded-lg bg-white/5 text-slate-300">
                  <div className="font-medium truncate">{item.title}</div>
                  <div className="text-[10px] font-mono text-cyan-400 mt-0.5">{item.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
