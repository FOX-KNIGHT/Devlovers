'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Sparkles, Search, ShieldCheck, Flame, Users } from 'lucide-react';
import data from '@/Project/LandingPage/data.js';
import { formatPrize } from '@/lib/formatters';
import { useAppContext } from '@/Project/LandingPage/AppContext';
import { soundFx } from '@/lib/audio/sound-fx';

export function LeaderboardView() {
  const { currency } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [leaderboardData, setLeaderboardData] = useState(data.leaderboard || []);

  useEffect(() => {
    let isMounted = true;
    async function loadLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
            setLeaderboardData(json.data);
          }
        }
      } catch (e) {
        // Fall back gracefully
      }
    }
    loadLeaderboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return leaderboardData;
    const q = searchQuery.toLowerCase();
    return leaderboardData.filter(
      (item) =>
        item.team.toLowerCase().includes(q) ||
        item.captain.toLowerCase().includes(q) ||
        item.specialty.toLowerCase().includes(q)
    );
  }, [leaderboardData, searchQuery]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="relative rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0C0F1D] via-[#141A2E] to-[#06080F] p-8 overflow-hidden shadow-[0_0_50px_rgba(0,245,255,0.1)]">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy className="h-64 w-64 text-cyan-400" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="hud-tag text-[10px] tracking-widest text-cyan-400 border-cyan-400/40">
            GLOBAL RANKINGS & HALL OF FAME
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Developer Leaderboard
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            The top-performing engineering squads and builders worldwide. Ranked by verified commit sprints, peer evaluation z-scores, and bounty earnings.
          </p>
        </div>
      </div>

      {/* Podium (Top 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leaderboardData.slice(0, 3).map((item, idx) => {
          const isFirst = item.rank === 1;
          const isSecond = item.rank === 2;

          return (
            <motion.div
              key={item.rank}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-2xl border p-5 backdrop-blur-xl relative overflow-hidden transition-all ${
                isFirst
                  ? 'border-cyan-400/50 bg-[#141A2E]/80 shadow-[0_0_30px_rgba(0,245,255,0.2)] md:-translate-y-2'
                  : isSecond
                  ? 'border-violet-400/40 bg-[#0C0F1D]/80'
                  : 'border-amber-400/40 bg-[#0C0F1D]/80'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold font-mono ${
                    isFirst
                      ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_#00F5FF]'
                      : isSecond
                      ? 'bg-violet-400 text-slate-950'
                      : 'bg-amber-400 text-slate-950'
                  }`}
                >
                  #{item.rank}
                </span>
                <span className="hud-tag text-[9px] uppercase tracking-wider">{item.badge}</span>
              </div>

              <h3 className="text-base font-bold text-white mb-0.5 truncate">{item.team}</h3>
              <p className="text-xs text-slate-400 font-mono mb-3">
                Led by <strong className="text-slate-200">{item.captain}</strong> ({item.handle})
              </p>

              <div className="pt-3 border-t border-white/5 space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Specialty:</span>
                  <span className="text-cyan-300 truncate max-w-[150px]">{item.specialty}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Total Bounties:</span>
                  <span className="text-emerald-400 font-bold">
                    {formatPrize(item.bounties_won_cents / 100, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Score:</span>
                  <span className="text-white font-bold">{item.points} XP</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-white/10 bg-[#0C0F1D]/80">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search squad, captain, or tech specialty..."
            className="w-full h-10 rounded-xl bg-[#141A2E]/80 border border-white/5 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 px-2">
          <Users className="h-4 w-4 text-cyan-400" />
          <span>Showing {filteredData.length} of {leaderboardData.length} Squads</span>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0C0F1D]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-[#141A2E]/50 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Squad & Captain</th>
                <th className="py-3 px-4">Specialty</th>
                <th className="py-3 px-4 text-center">Wins</th>
                <th className="py-3 px-4 text-right">Points</th>
                <th className="py-3 px-4 text-right">Bounties Won</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.map((item) => (
                <tr
                  key={item.rank}
                  onClick={() => soundFx.playClick()}
                  className="hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs ${
                        item.rank === 1
                          ? 'bg-cyan-400 text-slate-950 font-bold'
                          : item.rank === 2
                          ? 'bg-violet-400 text-slate-950 font-bold'
                          : item.rank === 3
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'text-slate-400 bg-white/5'
                      }`}
                    >
                      {item.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                      {item.team}
                      <span className="hud-tag text-[9px] uppercase">{item.badge}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {item.captain} • <span className="text-slate-500">{item.handle}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300">
                    {item.specialty}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-amber-400 font-bold">
                    {item.wins} 🏆
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-white font-semibold">
                    {item.points.toLocaleString()} XP
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                    {formatPrize(item.bounties_won_cents / 100, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
