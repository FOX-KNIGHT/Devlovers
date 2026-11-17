'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
} from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-fx';
import data from '@/Project/LandingPage/data.js';

const PILLARS = [
  { id: 'innovation', label: 'Innovation (30%)', angle: -Math.PI / 2, weight: 0.30 }, // Top
  { id: 'technicalDepth', label: 'Tech Depth (30%)', angle: 0, weight: 0.30 }, // Right
  { id: 'execution', label: 'Execution (20%)', angle: Math.PI / 2, weight: 0.20 }, // Bottom
  { id: 'impact', label: 'Impact (20%)', angle: Math.PI, weight: 0.20 }, // Left
];

const PALETTE = [
  { stroke: '#00F5FF', fill: 'rgba(0, 245, 255, 0.25)', text: 'text-cyan-400' },
  { stroke: '#8A2BE2', fill: 'rgba(138, 43, 226, 0.25)', text: 'text-violet-400' },
  { stroke: '#00FF9D', fill: 'rgba(0, 255, 157, 0.25)', text: 'text-emerald-400' },
  { stroke: '#FF9E00', fill: 'rgba(255, 158, 0, 0.25)', text: 'text-amber-400' },
];

export function SubmissionsRadarMatrix({ submissions = data.submissions }) {
  // Normalize each project to have 4-pillar scores
  const normalizedProjects = useMemo(() => {
    return (submissions || []).map((sub, idx) => {
      // Derive 4-pillar scores from score or pre-calculated attributes
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
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((pId) => pId !== id);
      }
      return [...prev, id];
    });
  };

  // Center & Radius for 320x320 SVG radar chart
  const size = 320;
  const center = size / 2;
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
      {/* Header telemetry */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="hud-tag text-[10px] text-cyan-400 border-cyan-400/40">EVALUATION RADAR</span>
            <span className="text-xs text-slate-400">4-Pillar Score Normalization</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">Multi-Axial Submissions Radar Matrix</h3>
          <p className="text-xs text-slate-400">
            Compare project submissions across Innovation (30%), Technical Depth (30%), Execution (20%), and Impact (20%).
          </p>
        </div>

        <div className="flex items-center gap-3 bg-black/40 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-mono">
          <span className="text-slate-400">Weighting:</span>
          <span className="text-cyan-400 font-semibold">30% Inn</span>
          <span className="text-slate-600">/</span>
          <span className="text-violet-400 font-semibold">30% Tech</span>
          <span className="text-slate-600">/</span>
          <span className="text-emerald-400 font-semibold">20% Exec</span>
          <span className="text-slate-600">/</span>
          <span className="text-amber-400 font-semibold">20% Imp</span>
        </div>
      </div>

      {/* Main Grid: Radar SVG on left, Project Checklist & Metrics on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar SVG Chart */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 rounded-2xl bg-black/40 border border-white/10 relative overflow-hidden">
          <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            RADAR MATRIX CANVAS
          </div>

          <svg width={size} height={size} className="overflow-visible">
            {/* Concentric Grid Rings (25%, 50%, 75%, 100%) */}
            {[25, 50, 75, 100].map((level) => (
              <circle
                key={level}
                cx={center}
                cy={center}
                r={(level / 100) * radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-white/[0.08]"
                strokeDasharray={level === 100 ? 'none' : '3,3'}
              />
            ))}

            {/* Axis Lines from center */}
            {PILLARS.map((pillar) => {
              const { x, y } = getCoordinates(pillar.angle, 100);
              return (
                <line
                  key={pillar.id}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-white/20"
                />
              );
            })}

            {/* Active Polygons */}
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
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  fill={palette.fill}
                  stroke={palette.stroke}
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all"
                />
              );
            })}

            {/* Data Points / Vertices */}
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
                    r={3.5}
                    fill={palette.stroke}
                    className="shadow-md"
                  />
                );
              });
            })}

            {/* Pillar Labels at Outer Extremities */}
            {PILLARS.map((pillar) => {
              const { x, y } = getCoordinates(pillar.angle, 118);
              let textAnchor = 'middle';
              if (pillar.angle === 0) textAnchor = 'start';
              if (pillar.angle === Math.PI) textAnchor = 'end';

              return (
                <text
                  key={pillar.id}
                  x={x}
                  y={y + 4}
                  textAnchor={textAnchor}
                  className="font-mono text-[10px] fill-slate-300 font-semibold"
                >
                  {pillar.label}
                </text>
              );
            })}
          </svg>

          {/* Radar Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-white/5 w-full">
            {normalizedProjects.map((project, idx) => {
              const isSelected = selectedProjectIds.includes(project.id);
              const palette = PALETTE[idx % PALETTE.length];

              return (
                <button
                  key={project.id}
                  onClick={() => toggleProjectSelection(project.id)}
                  onMouseEnter={() => setHoveredProjectId(project.id)}
                  onMouseLeave={() => setHoveredProjectId(null)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                    isSelected
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-white/[0.02] border-transparent text-slate-500 opacity-60'
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: palette.stroke }}
                  />
                  <span>{project.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Project Details Matrix */}
        <div className="lg:col-span-6 space-y-3">
          <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
            <span>Submissions Breakdown ({normalizedProjects.length} evaluated)</span>
            <span>Click to toggle overlay</span>
          </div>

          <div className="space-y-2.5">
            {normalizedProjects.map((project, idx) => {
              const isSelected = selectedProjectIds.includes(project.id);
              const palette = PALETTE[idx % PALETTE.length];

              return (
                <motion.div
                  key={project.id}
                  onClick={() => toggleProjectSelection(project.id)}
                  onMouseEnter={() => setHoveredProjectId(project.id)}
                  onMouseLeave={() => setHoveredProjectId(null)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/[0.05] border-white/20'
                      : 'bg-white/[0.02] border-white/5 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full border border-white/20"
                        style={{ backgroundColor: palette.stroke }}
                      />
                      <span className="text-xs font-bold text-white">{project.title}</span>
                      <span className="text-[10px] font-mono text-cyan-400">{project.squadName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {project.weightedScore} pts
                      </span>
                      {project.verifiedCommits && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono flex items-center gap-0.5">
                          <ShieldCheck className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4 Pillars Progress Bars */}
                  <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
                    <div>
                      <div className="text-slate-400 truncate">Innovation</div>
                      <div className="text-cyan-300 font-bold">{project.scores.innovation}%</div>
                    </div>
                    <div>
                      <div className="text-slate-400 truncate">Tech Depth</div>
                      <div className="text-violet-300 font-bold">{project.scores.technicalDepth}%</div>
                    </div>
                    <div>
                      <div className="text-slate-400 truncate">Execution</div>
                      <div className="text-emerald-300 font-bold">{project.scores.execution}%</div>
                    </div>
                    <div>
                      <div className="text-slate-400 truncate">Impact</div>
                      <div className="text-amber-300 font-bold">{project.scores.impact}%</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
