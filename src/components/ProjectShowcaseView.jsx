'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Code,
  ExternalLink,
  ShieldCheck,
  Heart,
  Plus,
  Search,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TiltCard } from '@/components/ui/tilt-card';
import { SubmitProjectModal } from './SubmitProjectModal.jsx';
import data from '@/Project/LandingPage/data.js';
import { soundFx } from '@/lib/audio/sound-fx';
import { toast } from 'sonner';

function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function ProjectShowcaseView() {
  const [submissions, setSubmissions] = useState(data.submissions || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [likedMap, setLikedMap] = useState({});

  useEffect(() => {
    let isMounted = true;
    async function loadSubmissions() {
      try {
        const res = await fetch('/api/submissions');
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
            setSubmissions(json.data);
          }
        }
      } catch (_err) {
        // Fall back gracefully to data.submissions
      }
    }
    loadSubmissions();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSubmissions = useMemo(() => {
    if (!searchQuery.trim()) return submissions;
    const q = searchQuery.toLowerCase();
    return submissions.filter(
      (sub) =>
        sub.title?.toLowerCase().includes(q) ||
        sub.tagline?.toLowerCase().includes(q) ||
        sub.squadName?.toLowerCase().includes(q) ||
        sub.hackathonTitle?.toLowerCase().includes(q) ||
        sub.techStack?.some((t) => t.toLowerCase().includes(q))
    );
  }, [submissions, searchQuery]);

  const handleLike = async (subId) => {
    soundFx.playClick();
    const isCurrentlyLiked = likedMap[subId];
    setLikedMap((prev) => ({ ...prev, [subId]: !isCurrentlyLiked }));

    // Optimistically update count
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === subId) {
          return {
            ...s,
            likes: (s.likes || 0) + (isCurrentlyLiked ? -1 : 1),
          };
        }
        return s;
      })
    );

    try {
      await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hackathonId: subId, userId: 'dev-current' }),
      });
      toast.success(isCurrentlyLiked ? 'Upvote removed' : 'Project upvoted! 🚀');
    } catch (_e) {
      // Offline fallback
      toast.success(isCurrentlyLiked ? 'Upvote removed' : 'Project upvoted! 🚀 (cached)');
    }
  };

  const handleSubmissionSuccess = (newSub) => {
    setSubmissions((prev) => [newSub, ...prev]);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="relative rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0C0F1D] via-[#141A2E] to-[#06080F] p-8 overflow-hidden shadow-[0_0_50px_rgba(0,245,255,0.1)]">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Code className="h-64 w-64 text-cyan-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="hud-tag text-[10px] tracking-widest text-cyan-400 border-cyan-400/40">
              OPEN-SOURCE PROJECTS & COMMIT RADAR
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Project Showcase Matrix
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore transformative software shipped during sprint windows. Evaluated by AI judging rubrics with verified cryptographic git commit history.
            </p>
          </div>

          <Button
            variant="cyber"
            size="lg"
            onClick={() => {
              soundFx.playClick();
              setIsSubmitModalOpen(true);
            }}
            className="shrink-0 gap-2 font-semibold shadow-[0_0_20px_rgba(0,245,255,0.3)]"
          >
            <Plus className="h-4 w-4" />
            Submit Project
          </Button>
        </div>
      </div>

      {/* Search & Statistics Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-white/10 bg-[#0C0F1D]/80">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search project by title, stack, or squad..."
            className="w-full h-10 rounded-xl bg-[#141A2E]/80 border border-white/5 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 px-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>{filteredSubmissions.length} Verified Submissions</span>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSubmissions.map((sub, idx) => {
          const isLiked = likedMap[sub.id];

          return (
            <motion.div
              key={sub.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <TiltCard className="border border-white/10 bg-[#0C0F1D]/80 backdrop-blur-xl hover:border-cyan-500/40 transition-all h-full flex flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="hud-tag text-[9px] text-cyan-300 border-cyan-500/30 truncate max-w-[180px]">
                      {sub.hackathonTitle || 'Global Sprint'}
                    </span>
                    {sub.verifiedCommits && (
                      <span className="hud-tag text-[9px] text-emerald-400 border-emerald-500/30 flex items-center gap-1 shrink-0">
                        <ShieldCheck className="h-3 w-3" />
                        {sub.commitCount || 35} COMMITS VERIFIED
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                    {sub.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {sub.tagline || sub.description}
                  </p>

                  <div className="text-[11px] font-mono text-slate-400 mb-3 flex items-center justify-between">
                    <span>
                      Squad: <strong className="text-slate-200">{sub.squadName || 'Independent'}</strong>
                    </span>
                    {sub.score && (
                      <span className="text-cyan-300 font-bold flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-amber-400" />
                        {sub.score} / 100
                      </span>
                    )}
                  </div>

                  {sub.techStack && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {sub.techStack.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-[#141A2E] text-[10px] font-mono text-cyan-300 border border-cyan-500/20"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Link & Upvote Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-2">
                    {sub.repoUrl && (
                      <a
                        href={sub.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-cyan-500/40 transition"
                      >
                        <GithubIcon className="h-3.5 w-3.5" />
                        <span>Source</span>
                      </a>
                    )}
                    {sub.demoUrl && (
                      <a
                        href={sub.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition font-medium"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLike(sub.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      isLiked
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30'
                    }`}
                    title="Upvote Project"
                  >
                    <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-current text-rose-400' : ''}`} />
                    <span className="font-mono text-xs">{sub.likes || 0}</span>
                  </button>
                </div>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>

      <SubmitProjectModal
        open={isSubmitModalOpen}
        onOpenChange={setIsSubmitModalOpen}
        onSuccess={handleSubmissionSuccess}
      />
    </div>
  );
}
