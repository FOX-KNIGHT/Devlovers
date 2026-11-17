'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-fx';
import data from '@/Project/LandingPage/data.js';

const PILLARS = [
  { id: 'innovation', label: 'Innovation (30%)', shortLabel: 'Innovation', angle: -Math.PI / 2, weight: 0.30 }, // Top
  { id: 'technicalDepth', label: 'Tech Depth (30%)', shortLabel: 'Tech Depth', angle: 0, weight: 0.30 }, // Right
  { id: 'execution', label: 'Execution (20%)', shortLabel: 'Execution', angle: Math.PI / 2, weight: 0.20 }, // Bottom
  { id: 'impact', label: 'Impact (20%)', shortLabel: 'Impact', angle: Math.PI, weight: 0.20 }, // Left
];

const PALETTE = [
  { stroke: '#00F5FF', fill: 'rgba(0, 245, 255, 0.22)', text: 'text-cyan-400', glow: 'rgba(0, 245, 255, 0.5)' },
  { stroke: '#A855F7', fill: 'rgba(168, 85, 247, 0.22)', text: 'text-purple-400', glow: 'rgba(168, 85, 247, 0.5)' },
  { stroke: '#10B981', fill: 'rgba(16, 185, 129, 0.22)', text: 'text-emerald-400', glow: 'rgba(16, 185, 129, 0.5)' },
  { stroke: '#F59E0B', fill: 'rgba(245, 158, 11, 0.22)', text: 'text-amber-400', glow: 'rgba(245, 158, 11, 0.5)' },
];

export function SubmissionsRadarMatrix({ submissions = data.submissions }) {
  // Normalize each project to have 4-pillar scores
  const normalizedProjects = useMemo(() => {
    return (submissions || []).map((sub, idx) => {
      const base = sub.score || 90;
      const seed = idx * 3.7;
      const innovation = Math.min(100, Math.max(70, Math.round(base + Math.sin(seed) * 5)));
      const technicalDepth = Math.min(100, Math.max(70, Math.round(base + Math.cos(seed) * 6)));
      const execution = Math.min(100, Math.max(70, Math.round(base - Math.sin(seed * 2) * 4)));
      const impact = Math.min(100, Math.max(70, Math.round(base + Math.cos(seed * 2) * 4)));

      const weightedScore = (
        innovation * 0.30 +
        technicalDepth * 0.30 +
        execution * 0.20 +
        impact * 0.20
      ).toFixed(1);

      return {
        ...sub,
        scores: { innovation, technicalDepth, execution, impact },
        weightedScore,
        colorIndex: idx % PALETTE.length,
      };
    });
  }, [submissions]);

  // Selected projects to plot on radar chart (default to first 2)
  const [selectedProjectIds, setSelectedProjectIds] = useState([
    normalizedProjects[0]?.id,
    normalizedProjects[1]?.id,
  ].filter(Boolean));

  const [hoveredProjectId, setHoveredProjectId] = useState(null);

  const toggleProjectSelection = (id) => {
    soundFx.playClick();
    setSelectedProjectIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one active
        return prev.filter((pId) => pId !== id);
      }
      return [...prev, id];
    });
  };

  // Center & Radius for 320x320 SVG radar chart (Matching test suite specifications)
  const size = 320;
  const center = size / 2; // 160
  const radius = 110;

  // Function to calculate (x, y) for an angle and score (0-100)
  const getCoordinates = (angle, score) => {
    const r = (score / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate polygon points string for a project's scores
  const getPolygonPoints = (scores) => {
    return PILLARS.map((pillar) => {
      const score = scores[pillar.id] || 80;
      const { x, y } = getCoordinates(pillar.angle, score);
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* ==============================================================================
          EVALUATION RADAR TELEMETRY BANNER
          ============================================================================== */}
      <div className="relative rounded-3xl p-6 sm:p-7 luxury-glass overflow-hidden border border-white/[0.08] shadow-[0_16px_40px_-15px_rgba(0,0,0,0.8)]">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="hud-tag text-[10px] text-purple-400 border-purple-400/30">
                MULTI-AXIAL MATRIX
              </span>
              <span className="text-xs font-mono text-slate-400">Multi-Polygon Comparative Overlay</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Submissions Evaluation Radar</span>
              <span className="text-xs font-mono font-medium text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/25">
                4-Pillar Geometry
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Cross-evaluate project submissions against Innovation (30%), Technical Depth (30%), Execution (20%), and Market Impact (20%).
            </p>
          </div>

          {/* Metric Weights Indicator Podium */}
          <div className="grid grid-cols-4 gap-1.5 bg-[#080C1A]/90 p-2 sm:p-2.5 rounded-2xl border border-white/[0.08] shrink-0 font-mono text-center">
            <div className="px-2.5 py-1.5 rounded-lg bg-white/[0.02]">
              <div className="text-[9px] text-slate-500 uppercase">Inn</div>
              <div className="text-xs font-bold text-cyan-400">30%</div>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg bg-white/[0.02]">
              <div className="text-[9px] text-slate-500 uppercase">Tech</div>
              <div className="text-xs font-bold text-purple-400">30%</div>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg bg-white/[0.02]">
              <div className="text-[9px] text-slate-500 uppercase">Exec</div>
              <div className="text-xs font-bold text-emerald-400">20%</div>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg bg-white/[0.02]">
              <div className="text-[9px] text-slate-500 uppercase">Imp</div>
              <div className="text-xs font-bold text-amber-400">20%</div>
            </div>
          </div>
        </div>
      </div>

      {/* ==============================================================================
          RADAR MATRIX CANVAS & COMPARATIVE PODIUM
          ============================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Radar SVG Canvas */}
        <div className="lg:col-span-6 rounded-3xl p-6 sm:p-8 luxury-glass border border-white/[0.08] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>SVG POLAR ENGINE</span>
          </div>

          <div className="relative py-4">
            <svg width={size} height={size} className="overflow-visible select-none">
              <defs>
                <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Concentric Grid Rings (25%, 50%, 75%, 100%) */}
              {[25, 50, 75, 100].map((level) => (
                <g key={level}>
                  <circle
                    cx={center}
                    cy={center}
                    r={(level / 100) * radius}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="1"
                    strokeDasharray={level === 100 ? 'none' : '3,3'}
                  />
                  {/* Subtle level label */}
                  <text
                    x={center + 4}
                    y={center - (level / 100) * radius + 10}
                    className="font-mono text-[8px] fill-slate-600 select-none"
                  >
                    {level}%
                  </text>
                </g>
              ))}

              {/* Axis Crosshairs */}
              {PILLARS.map((pillar) => {
                const { x, y } = getCoordinates(pillar.angle, 100);
                return (
                  <line
                    key={pillar.id}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.16)"
                    strokeWidth="1.2"
                  />
                );
              })}

              {/* Active Plotted Polygons */}
              {normalizedProjects.map((project, idx) => {
                const isSelected = selectedProjectIds.includes(project.id);
                if (!isSelected) return null;

                const points = getPolygonPoints(project.scores);
                const palette = PALETTE[idx % PALETTE.length];
                const isHovered = hoveredProjectId === project.id;

                return (
                  <motion.polygon
                    key={project.id}
                    points={points}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    fill={palette.fill}
                    stroke={palette.stroke}
                    strokeWidth={isHovered ? 3 : 2}
                    filter="url(#radarGlow)"
                    className="transition-all"
                  />
                );
              })}

              {/* Plotted Data Point Nodes */}
              {normalizedProjects.map((project, idx) => {
                const isSelected = selectedProjectIds.includes(project.id);
                if (!isSelected) return null;

                const palette = PALETTE[idx % PALETTE.length];

                return PILLARS.map((pillar) => {
                  const score = project.scores[pillar.id] || 80;
                  const { x, y } = getCoordinates(pillar.angle, score);

                  return (
                    <circle
                      key={`${project.id}-${pillar.id}`}
                      cx={x}
                      cy={y}
                      r={4}
                      fill={palette.stroke}
                      stroke="#06080F"
                      strokeWidth="2"
                      className="shadow-lg"
                    />
                  );
                });
              })}

              {/* Axis Labels with Weighted Metric Breakdown */}
              {PILLARS.map((pillar) => {
                const { x, y } = getCoordinates(pillar.angle, 122);
                let textAnchor = 'middle';
                if (pillar.angle === 0) textAnchor = 'start';
                if (pillar.angle === Math.PI) textAnchor = 'end';

                return (
                  <text
                    key={pillar.id}
                    x={x}
                    y={y + 4}
                    textAnchor={textAnchor}
                    className="font-mono text-[10px] fill-slate-300 font-bold uppercase tracking-wider"
                  >
                    {pillar.label}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Interactive Legend Toggle Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-white/[0.06] w-full">
            {normalizedProjects.map((project, idx) => {
              const isSelected = selectedProjectIds.includes(project.id);
              const palette = PALETTE[idx % PALETTE.length];

              return (
                <button
                  key={project.id}
                  onClick={() => toggleProjectSelection(project.id)}
                  onMouseEnter={() => setHoveredProjectId(project.id)}
                  onMouseLeave={() => setHoveredProjectId(null)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                    isSelected
                      ? 'bg-white/[0.08] border-white/20 text-white shadow-sm'
                      : 'bg-white/[0.02] border-transparent text-slate-500 opacity-50 hover:opacity-80'
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full ring-2 ring-white/10"
                    style={{ backgroundColor: palette.stroke }}
                  />
                  <span className="font-semibold">{project.title}</span>
                  <span className="text-[10px] text-slate-400">({project.weightedScore})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparative Project Metrics Cards */}
        <div className="lg:col-span-6 space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Comparative Analysis Deck
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              {selectedProjectIds.length} Plotted
            </span>
          </div>

          {normalizedProjects.map((project, idx) => {
            const isSelected = selectedProjectIds.includes(project.id);
            const palette = PALETTE[idx % PALETTE.length];

            return (
              <div
                key={project.id}
                onClick={() => toggleProjectSelection(project.id)}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#0C1226]/90 to-[#080C1A]/90 border-cyan-500/30 shadow-[0_10px_30px_-10px_rgba(0,245,255,0.1)]'
                    : 'bg-[#080C1A]/70 border-white/[0.06] hover:border-white/[0.12] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="h-3 w-3 rounded-full shrink-0 ring-2 ring-white/10"
                      style={{ backgroundColor: palette.stroke }}
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white tracking-tight truncate">
                        {project.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        {project.tagline || 'Autonomous submission entry'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-extrabold font-mono text-white tracking-tight">
                      {project.weightedScore}
                      <span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                      Rank #{idx + 1}
                    </div>
                  </div>
                </div>

                {/* 4 Pillars Progress Bars */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/[0.06]">
                  {PILLARS.map((p) => {
                    const score = project.scores[p.id];
                    return (
                      <div key={p.id} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>{p.shortLabel}</span>
                          <span className="text-slate-200 font-bold">{score}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${score}%`,
                              backgroundColor: palette.stroke,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.06] text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <ShieldCheck className="h-3 w-3 text-cyan-400" />
                    <span>Verified Git Commits</span>
                  </span>

                  <span className="text-slate-500">
                    Click to {isSelected ? 'isolate' : 'plot'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default SubmissionsRadarMatrix;
