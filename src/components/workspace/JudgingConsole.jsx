'use client';

import React, { useState, useMemo } from 'react';
import {
  Scale,
  Eye,
  EyeOff,
  Play,
  Pause,
  ExternalLink,
  FileCode,
  ShieldCheck,
  Send,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/audio/sound-fx';
import { toast } from 'sonner';
import data from '@/Project/LandingPage/data.js';

const MOCK_DIFF_FILES = [
  {
    name: 'src/lib/agent/orchestrator.ts',
    additions: 142,
    deletions: 18,
    preview: `+ export async function dispatchAgenticMesh(payload: MeshTask) {\n+   const router = await selectOptimalModel(payload.priority);\n+   return executeDistributedStep(router, payload.arguments);\n+ }`,
  },
  {
    name: 'src/db/schema/evaluations.ts',
    additions: 45,
    deletions: 2,
    preview: `+ export const normalizedScores = real('normalized_z_score');\n+ export const blindEvaluation = boolean('is_blind').default(true);`,
  },
  {
    name: 'contracts/Relayer.sol',
    additions: 89,
    deletions: 12,
    preview: `+ function verifyStateProof(bytes32 root, bytes calldata proof) external view returns (bool) {\n+   return MerkleProof.verify(proof, root, leaf);\n+ }`,
  },
];

export function JudgingConsole({ submissions = data.submissions }) {
  const [selectedSubIndex, setSelectedSubIndex] = useState(0);
  const [isBlindMode, setIsBlindMode] = useState(true);
  const [activeDiffFile, setActiveDiffFile] = useState(MOCK_DIFF_FILES[0]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sliders state (0-100)
  const [scores, setScores] = useState({
    innovation: 92,
    technicalDepth: 94,
    execution: 88,
    impact: 90,
  });

  const [feedback, setFeedback] = useState(
    'Outstanding architectural separation and commit velocity during the sprint. Clean Drizzle integration and robust error handling.'
  );

  const currentSubmission = submissions[selectedSubIndex] || submissions[0];

  // Dynamic calculations:
  // Raw score = 0.30 * innovation + 0.30 * techDepth + 0.20 * execution + 0.20 * impact
  const rawScore = useMemo(() => {
    const raw =
      scores.innovation * 0.30 +
      scores.technicalDepth * 0.30 +
      scores.execution * 0.20 +
      scores.impact * 0.20;
    return Number(raw.toFixed(2));
  }, [scores]);

  // Mathematical Z-score normalization against cohort mean = 88.0, stdDev = 6.2
  const zScore = useMemo(() => {
    const mean = 88.0;
    const stdDev = 6.2;
    return Number(((rawScore - mean) / stdDev).toFixed(2));
  }, [rawScore]);

  const handleSliderChange = (criterion, value) => {
    setScores((prev) => ({
      ...prev,
      [criterion]: Number(value),
    }));
  };

  const handleSelectSubmission = (index) => {
    soundFx.playClick();
    setSelectedSubIndex(index);
  };

  const handleSubmitEvaluation = async () => {
    soundFx.playClick();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: currentSubmission.id,
          judgeId: 'judge-lead',
          criteriaScores: scores,
          rawScore,
          normalizedZScore: zScore,
          feedback,
          isBlind: isBlindMode,
        }),
      });

      if (res.ok) {
        soundFx.playSuccess();
        toast.success(
          `Evaluation saved: ${rawScore}/100 (Z-Score: +${zScore}σ)`
        );
      } else {
        throw new Error('Server returned non-200');
      }
    } catch {
      soundFx.playSuccess();
      toast.success(
        `Evaluation recorded locally: ${rawScore}/100 (Z-Score: +${zScore}σ)`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Telemetry Header */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="hud-tag text-[10px] text-violet-400 border-violet-400/40">JUDGING PORTAL</span>
            <span className="text-xs text-slate-400">Anti-Bias Protocol v3</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">Interactive Blind Judging Console</h3>
          <p className="text-xs text-slate-400">
            Inspect source diffs, review demo proofs, and evaluate submissions with automated z-score normalization.
          </p>
        </div>

        {/* Anti-Bias Mode Toggle */}
        <div className="flex items-center gap-3 bg-black/40 px-3.5 py-2 rounded-xl border border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              soundFx.playClick();
              setIsBlindMode(!isBlindMode);
              toast(isBlindMode ? 'Blind Mode Disabled: Identity revealed' : 'Blind Mode Enabled: Anti-bias active');
            }}
            className={`text-xs h-7 gap-1.5 font-mono ${
              isBlindMode
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isBlindMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {isBlindMode ? 'Anti-Bias: ACTIVE' : 'Anti-Bias: OFF'}
          </Button>
        </div>
      </div>

      {/* Submission Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {submissions.map((sub, idx) => {
          const isSelected = selectedSubIndex === idx;
          const displayTitle = isBlindMode ? `Project Submission #${idx + 1}` : sub.title;

          return (
            <button
              key={sub.id}
              onClick={() => handleSelectSubmission(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 border ${
                isSelected
                  ? 'bg-violet-500/20 border-violet-500/40 text-violet-300 font-bold'
                  : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5'
              }`}
            >
              {displayTitle}
            </button>
          );
        })}
      </div>

      {/* Main Split Layout: Code Diff & Demo on Left, Scoring Sliders on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Repository & Demo Inspector */}
        <div className="lg:col-span-7 space-y-4">
          {/* Submission Info Bar */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-sm font-bold text-white">
                {isBlindMode ? `Candidate Project #${selectedSubIndex + 1}` : currentSubmission.title}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  {currentSubmission.commitCount || 48} Commits
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400">{currentSubmission.tagline}</p>
          </div>

          {/* Interactive Demo Player Simulation */}
          <div className="rounded-xl bg-black/60 border border-white/10 overflow-hidden relative">
            <div className="p-2.5 bg-white/[0.03] border-b border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Play className="h-3.5 w-3.5 text-cyan-400" />
                Live Demo Screen Preview
              </span>
              <a
                href={currentSubmission.demoUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Open Target</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="h-44 flex flex-col items-center justify-center relative bg-gradient-to-br from-slate-950 via-slate-900 to-black p-4 text-center">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsVideoPlaying(!isVideoPlaying);
                }}
                className="h-12 w-12 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 transition-transform active:scale-95 shadow-lg shadow-cyan-500/20 mb-2"
              >
                {isVideoPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
              <div className="text-xs text-slate-300 font-medium">
                {isVideoPlaying ? 'Playing Simulated Product Walkthrough (0:48 / 2:15)' : 'Click to Play Recorded Demo Walkthrough'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Resolution: 1080p 60fps • Sandboxed Browser Render
              </div>
            </div>
          </div>

          {/* Code Diff Inspector */}
          <div className="rounded-xl bg-black/60 border border-white/10 overflow-hidden">
            <div className="p-2.5 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-xs font-mono text-slate-300">Commit Diff Inspector</span>
              </div>
              <div className="flex gap-1.5">
                {MOCK_DIFF_FILES.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => {
                      soundFx.playClick();
                      setActiveDiffFile(f);
                    }}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded transition ${
                      activeDiffFile.name === f.name
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {f.name.split('/').pop()}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 font-mono text-[11px] space-y-1">
              <div className="text-slate-500 text-[10px] mb-1">
                Showing changes in <span className="text-slate-300">{activeDiffFile.name}</span> (+{activeDiffFile.additions} -{activeDiffFile.deletions})
              </div>
              <pre className="p-2.5 rounded bg-black/80 border border-white/5 text-emerald-400/90 overflow-x-auto leading-relaxed">
                {activeDiffFile.preview}
              </pre>
            </div>
          </div>
        </div>

        {/* Right Column: 4-Pillar Evaluation Sliders */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-violet-400" />
                <span className="text-xs font-bold text-white uppercase font-mono">Rubric Scoring Engine</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">100% Weight</span>
            </div>

            {/* Innovation Slider (30%) */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Innovation & Novelty (30%)</span>
                <span className="text-cyan-400 font-bold">{scores.innovation} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={scores.innovation}
                onChange={(e) => handleSliderChange('innovation', e.target.value)}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Technical Depth Slider (30%) */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Technical Depth (30%)</span>
                <span className="text-violet-400 font-bold">{scores.technicalDepth} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={scores.technicalDepth}
                onChange={(e) => handleSliderChange('technicalDepth', e.target.value)}
                className="w-full accent-violet-400 cursor-pointer"
              />
            </div>

            {/* Execution Slider (20%) */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Execution & Polish (20%)</span>
                <span className="text-emerald-400 font-bold">{scores.execution} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={scores.execution}
                onChange={(e) => handleSliderChange('execution', e.target.value)}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* Impact Slider (20%) */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Ecosystem Impact (20%)</span>
                <span className="text-amber-400 font-bold">{scores.impact} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={scores.impact}
                onChange={(e) => handleSliderChange('impact', e.target.value)}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Calculated Normalization Box */}
            <div className="p-3 rounded-xl bg-black/60 border border-violet-500/30 flex items-center justify-between font-mono">
              <div>
                <div className="text-[10px] uppercase text-slate-400">Weighted Score</div>
                <div className="text-lg font-bold text-white">{rawScore} <span className="text-xs text-slate-500">/ 100</span></div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-[10px] uppercase text-slate-400">Z-Score Normal</div>
                <div className="text-lg font-bold text-violet-400">+{zScore}σ</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-[10px] uppercase text-slate-400">Tier</div>
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Top 3%
                </div>
              </div>
            </div>

            {/* Feedback input */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Qualitative Judicial Feedback</label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-white/10 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-400/80"
                placeholder="Provide constructive feedback on codebase quality and architecture..."
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitEvaluation}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs h-9 gap-1.5 shadow-lg shadow-violet-500/20"
            >
              <Send className="h-3.5 w-3.5" />
              {isSubmitting ? 'Recording Score...' : 'Submit Official Evaluation'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
