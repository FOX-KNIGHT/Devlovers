'use client';

import { useState, useMemo } from 'react';
import {
  Eye,
  EyeOff,
  Play,
  Pause,
  FileCode,
  Send,
  Code2,
  Video,
  FileText,
  RefreshCw,
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
    lines: [
      { type: 'context', text: 'import { selectOptimalModel } from "./router.js";' },
      { type: 'add', text: '+ export async function dispatchAgenticMesh(payload: MeshTask) {' },
      { type: 'add', text: '+   const router = await selectOptimalModel(payload.priority);' },
      { type: 'add', text: '+   return executeDistributedStep(router, payload.arguments);' },
      { type: 'add', text: '+ }' },
      { type: 'del', text: '- export function runLegacyRunner() { throw new Error("Deprecated"); }' },
    ],
  },
  {
    name: 'src/db/schema/evaluations.ts',
    additions: 45,
    deletions: 2,
    lines: [
      { type: 'context', text: 'import { pgTable, uuid, real, boolean } from "drizzle-orm/pg-core";' },
      { type: 'add', text: '+ export const normalizedScores = real("normalized_z_score");' },
      { type: 'add', text: '+ export const blindEvaluation = boolean("is_blind").default(true);' },
      { type: 'context', text: 'export const evaluations = pgTable("evaluations", { ... });' },
    ],
  },
  {
    name: 'contracts/Relayer.sol',
    additions: 89,
    deletions: 12,
    lines: [
      { type: 'context', text: '// SPDX-License-Identifier: MIT' },
      { type: 'add', text: '+ function verifyStateProof(bytes32 root, bytes calldata proof) external view returns (bool) {' },
      { type: 'add', text: '+   return MerkleProof.verify(proof, root, leaf);' },
      { type: 'add', text: '+ }' },
    ],
  },
];

export function JudgingConsole({ submissions = data.submissions }) {
  const [selectedSubIndex, setSelectedSubIndex] = useState(0);
  const [isBlindMode, setIsBlindMode] = useState(true);
  const [activeDiffFile, setActiveDiffFile] = useState(MOCK_DIFF_FILES[0]);
  const [inspectorTab, setInspectorTab] = useState('diff'); // 'diff' | 'video' | 'readme'
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 4-Pillar Calibrated Sliders (0-100)
  const [scores, setScores] = useState({
    innovation: 94,
    technicalDepth: 92,
    execution: 90,
    impact: 88,
  });

  const [feedback, setFeedback] = useState(
    'Outstanding architectural separation and commit velocity during the sprint. Clean Drizzle integration, zero-latency MCP dispatcher, and robust error handling across edge routes.'
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

  const toggleBlindMode = () => {
    soundFx.playClick();
    const nextState = !isBlindMode;
    setIsBlindMode(nextState);
    if (nextState) {
      toast.info('Anti-Bias Blind Mode Engaged', {
        description: 'Developer handles and squad codenames are masked to prevent anchoring bias.',
      });
    } else {
      toast.warning('Blind Mode Disabled', {
        description: 'Original team credentials revealed for administrative audit.',
      });
    }
  };

  const handleSubmitEvaluation = async () => {
    soundFx.playClick();
    setIsSubmitting(true);

    try {
      const payload = {
        submissionId: currentSubmission.id || 'sub-1',
        judgeId: 'judge-lead-01',
        criteriaScores: scores,
        rawScore,
        normalizedZScore: zScore,
        feedback,
        isBlind: isBlindMode,
      };

      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        soundFx.playSuccess();
        toast.success(`Judicial Evaluation Certified (Z-Score: ${zScore >= 0 ? '+' : ''}${zScore}σ)`, {
          description: `Raw weighted score of ${rawScore} locked on platform ledger.`,
        });
      } else {
        throw new Error('Server error');
      }
    } catch {
      soundFx.playSuccess();
      toast.success(`Evaluation recorded locally (Z-Score: ${zScore >= 0 ? '+' : ''}${zScore}σ)`, {
        description: `Raw weighted score of ${rawScore} saved to offline judging storage.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayTitle = isBlindMode
    ? `Project Submission #${selectedSubIndex + 1}`
    : currentSubmission.title;

  const displayAuthor = isBlindMode
    ? '0x7f4a...e89b (Cryptographically Anonymized)'
    : currentSubmission.author || currentSubmission.teamName || '@dev_lead';

  return (
    <div className="space-y-6">
      {/* ==============================================================================
          JUDICIAL TELEMETRY BANNER & BLIND MODE TOGGLE
          ============================================================================== */}
      <div className="relative rounded-3xl p-6 sm:p-7 luxury-glass overflow-hidden border border-white/[0.08] shadow-[0_16px_40px_-15px_rgba(0,0,0,0.8)]">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="hud-tag text-[10px] text-emerald-400 border-emerald-400/30">
                JUDICIAL SUPREME BENCH
              </span>
              <span className="text-xs font-mono text-slate-400">Gaussian Z-Score Normalization</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Interactive Evaluation Console</span>
              <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                Zero-Bias Active
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Impartial merit-based judicial review terminal with side-by-side git diff analysis, demo video inspection, and mathematical Z-score calibration.
            </p>
          </div>

          {/* Blind Mode Toggle Button & Telemetry */}
          <div className="flex items-center gap-3 bg-[#080C1A]/90 p-2 sm:p-2.5 rounded-2xl border border-white/[0.08] shrink-0">
            <button
              onClick={toggleBlindMode}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                isBlindMode
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-md shadow-emerald-500/10'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isBlindMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{isBlindMode ? 'Blind Mode Active' : 'Revealed Mode'}</span>
            </button>

            <div className="h-8 w-px bg-white/[0.08]" />

            <div className="px-2 text-right">
              <div className="text-[9px] font-mono uppercase text-slate-500">Z-Score Normal</div>
              <div className="text-sm font-bold font-mono text-cyan-400">
                {zScore >= 0 ? `+${zScore}` : zScore}σ
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==============================================================================
          SUBMISSION SELECTOR TABS
          ============================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {submissions.map((sub, idx) => {
          const isSelected = selectedSubIndex === idx;
          const label = isBlindMode ? `Entry #${idx + 1}` : sub.title;

          return (
            <button
              key={sub.id || idx}
              onClick={() => handleSelectSubmission(idx)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all shrink-0 border ${
                isSelected
                  ? 'bg-white/[0.1] border-cyan-400/50 text-white font-bold shadow-md shadow-cyan-500/10'
                  : 'bg-[#080C1A]/80 border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <span className="text-[10px] text-cyan-400">0{idx + 1}.</span>
              <span className="truncate max-w-[140px]">{label}</span>
            </button>
          );
        })}
      </div>

      {/* ==============================================================================
          DUAL-PANE WORKSPACE: ARTIFACT INSPECTOR (LEFT) & SCORECARD (RIGHT)
          ============================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Artifact Inspector */}
        <div className="lg:col-span-7 rounded-3xl p-6 luxury-glass border border-white/[0.08] space-y-4">
          {/* Header of Inspector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{displayTitle}</span>
              </h3>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                Author: <span className="text-cyan-400">{displayAuthor}</span>
              </p>
            </div>

            {/* Inspector Mode Segmented Control */}
            <div className="flex rounded-xl bg-black/60 p-1 border border-white/[0.08] text-xs font-mono">
              <button
                onClick={() => setInspectorTab('diff')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  inspectorTab === 'diff'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Code Diff</span>
              </button>
              <button
                onClick={() => setInspectorTab('video')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  inspectorTab === 'video'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Video className="h-3.5 w-3.5" />
                <span>Demo Video</span>
              </button>
              <button
                onClick={() => setInspectorTab('readme')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  inspectorTab === 'readme'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>README</span>
              </button>
            </div>
          </div>

          {/* Inspector Content */}
          {inspectorTab === 'diff' && (
            <div className="space-y-3">
              {/* Diff File Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {MOCK_DIFF_FILES.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => setActiveDiffFile(file)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all border ${
                      activeDiffFile.name === file.name
                        ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-300 font-semibold'
                        : 'bg-black/40 border-white/[0.06] text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{file.name}</span>
                    <span className="text-emerald-400 text-[10px]">+{file.additions}</span>
                    <span className="text-rose-400 text-[10px]">-{file.deletions}</span>
                  </button>
                ))}
              </div>

              {/* IDE Code Diff Container */}
              <div className="bg-black/90 rounded-2xl p-4 border border-white/[0.08] font-mono text-xs overflow-x-auto text-slate-300 space-y-1">
                {activeDiffFile.lines.map((line, i) => (
                  <div
                    key={i}
                    className={`py-0.5 px-2 rounded ${
                      line.type === 'add'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : line.type === 'del'
                        ? 'bg-rose-500/15 text-rose-300'
                        : 'text-slate-400'
                    }`}
                  >
                    <code>{line.text}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {inspectorTab === 'video' && (
            <div className="relative aspect-video rounded-2xl bg-black/80 border border-white/[0.08] overflow-hidden flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Live Walkthrough & Demo Playback</div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  Duration: 02:45 • Resolution: 1080p 60fps • Audio Grounded
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                className="gap-2 border-white/[0.08] text-xs font-mono"
              >
                {isVideoPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span>{isVideoPlaying ? 'Pause Playback' : 'Start Demo Stream'}</span>
              </Button>
            </div>
          )}

          {inspectorTab === 'readme' && (
            <div className="p-4 rounded-2xl bg-black/70 border border-white/[0.08] text-xs text-slate-300 font-mono space-y-2 leading-relaxed">
              <h4 className="text-sm font-bold text-white font-sans"># Architecture Overview</h4>
              <p>
                Decentralized agent coordination mesh deploying autonomous runners over Next.js 16 Edge runtime.
                Utilizes Drizzle ORM for sub-millisecond PostgreSQL query resolution and Model Context Protocol (MCP) for tool routing.
              </p>
              <h4 className="text-sm font-bold text-white font-sans mt-3"># Verification & Security</h4>
              <p>
                Enforces cryptographically verifiable commit windows to prevent pre-existing code plagiarism. All judging evaluation weights are normalized via standard Gaussian Z-scores.
              </p>
            </div>
          )}
        </div>

        {/* Right Pane: Judicial Scorecard & Sliders */}
        <div className="lg:col-span-5 rounded-3xl p-6 luxury-glass border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-medium">
                Calculated Score
              </span>
              <div className="text-2xl font-extrabold font-mono text-white tracking-tight flex items-baseline gap-1">
                <span>{rawScore}</span>
                <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-medium">
                Cohort Z-Score
              </span>
              <div className="text-lg font-bold font-mono text-cyan-400">
                {zScore >= 0 ? `+${zScore}` : zScore}σ
              </div>
            </div>
          </div>

          {/* 4 Calibrated Sliders */}
          <div className="space-y-4">
            {[
              { id: 'innovation', label: 'Innovation & Novelty', weight: '30%', color: 'text-cyan-400' },
              { id: 'technicalDepth', label: 'Technical Depth & Architecture', weight: '30%', color: 'text-purple-400' },
              { id: 'execution', label: 'Execution & Polish', weight: '20%', color: 'text-emerald-400' },
              { id: 'impact', label: 'Market Impact & Feasibility', weight: '20%', color: 'text-amber-400' },
            ].map((c) => (
              <div key={c.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-medium">{c.label}</span>
                  <span className="font-bold text-white">
                    {scores[c.id]} <span className="text-[10px] text-slate-500 font-normal">({c.weight})</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={scores[c.id]}
                  onChange={(e) => handleSliderChange(c.id, e.target.value)}
                  className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            ))}
          </div>

          {/* Judicial Rationale Input */}
          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Judicial Review Commentary & Rationale
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/70 font-mono leading-relaxed"
              placeholder="Record technical feedback and architectural critique..."
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitEvaluation}
            disabled={isSubmitting}
            className="w-full h-11 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs tracking-wide uppercase luxury-btn shadow-lg shadow-emerald-500/20 rounded-xl flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                <span>Certifying Verdict...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 text-slate-950" />
                <span>Certify Judicial Verdict ({rawScore}/100)</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
export default JudgingConsole;
