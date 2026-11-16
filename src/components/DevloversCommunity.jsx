'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Code, Trophy, Cpu, Zap, Globe } from 'lucide-react';

export function DevloversCommunity() {
  const stats = [
    { label: 'Active Developers', value: '10,480+', icon: Users, change: '+18% this month' },
    { label: 'Verified Codebases', value: '5,290+', icon: Code, change: '100% commit checked' },
    { label: 'Total Bounties Distributed', value: '$1.4M+', icon: Trophy, change: 'Across 52 countries' },
    { label: 'AI Copilot Sprints', value: '3,840+', icon: Cpu, change: 'MCP assisted' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0C0F1D] via-[#141A2E] to-[#06080F] p-8 overflow-hidden shadow-[0_0_50px_rgba(0,245,255,0.1)]">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Globe className="h-64 w-64 text-cyan-400" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="hud-tag text-[10px]">GLOBAL DEVELOPER NETWORK</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Devlovers Community
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Connect with full-stack engineers, AI researchers, and designers. Build unstoppable hackathon squads, share open-source modules, and accelerate your engineering journey.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-2xl border border-white/10 bg-[#0C0F1D]/80 p-5 backdrop-blur-xl hover:border-cyan-500/40 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-mono">{stat.label}</span>
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono text-white mb-1">{stat.value}</div>
              <div className="text-[11px] text-emerald-400 font-mono">{stat.change}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
