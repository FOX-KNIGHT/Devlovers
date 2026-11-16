'use client';

import { ShieldCheck, Cpu, Terminal, Scale } from 'lucide-react';

export function AboutView() {
  const pillars = [
    {
      title: 'Fair & Blind Judging',
      desc: 'Anonymized project evaluation combined with z-score normalization prevents bias and guarantees meritocracy.',
      icon: Scale,
    },
    {
      title: 'Commit Verification',
      desc: 'Automated GitHub code analysis verifies all submissions are original software built during the sprint window.',
      icon: ShieldCheck,
    },
    {
      title: 'Autonomous MCP AI Copilot',
      desc: 'Participants access interactive MCP Apps directly in the terminal dock for matchmaking and sponsor API assistance.',
      icon: Cpu,
    },
    {
      title: 'Sub-second Global Performance',
      desc: 'Built on Next.js 16 and Vercel edge networks for zero-lag interaction anywhere across the globe.',
      icon: Terminal,
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-3">
        <span className="hud-tag text-[10px]">MANIFESTO & SYSTEM ARCHITECTURE</span>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          About Devlovers
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Devlovers is the universal proving ground for builders. We believe hackathons are the ultimate engine of technological advancement when built on fair judging, verified engineering, and global access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-[#0C0F1D]/80 p-6 backdrop-blur-xl hover:border-cyan-500/30 transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{pillar.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{pillar.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
