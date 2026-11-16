'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Calendar,
  Users,
  Clock,
  Sparkles,
  ShieldCheck,
  Code2,
  Share2,
  Bookmark,
  UploadCloud,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TiltCard } from '@/components/ui/tilt-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SquadModal } from '@/components/SquadModal';
import { SubmitProjectModal } from '@/components/SubmitProjectModal';
import { useCountdown } from '@/hooks/useCountdown';
import { soundFx } from '@/lib/audio/sound-fx';
import { formatPrize, formatDeadline } from '@/lib/formatters';
import { saveOfflineDraft, getOfflineDraft } from '@/lib/storage/offline-drafts';
import { useAppContext } from '@/Project/LandingPage/AppContext';
import { useI18n } from '@/lib/i18n/context';
import { toast } from 'sonner';

function FeedPost({ post, showSignInModal: _showSignInModal }) {
  const { currency, useUTC, setActiveTechFilter, bookmarkedSprints, toggleBookmark } = useAppContext();
  const { t } = useI18n();
  const [registered, setRegistered] = useState(false);
  const [localUTCToggle, setLocalUTCToggle] = useState(false);
  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const isOngoing = post.status?.toUpperCase() === 'ACTIVE' || post.status?.toLowerCase() === 'ongoing';
  const effectiveShowUTC = localUTCToggle || useUTC;

  // Real-time countdown timer
  const countdownTarget = isOngoing ? post.deadline : post.starts_at;
  const countdown = useCountdown(countdownTarget);

  // Restore saved offline registration draft
  useEffect(() => {
    const draft = getOfflineDraft(`registration_${post.id}`);
    if (draft?.registered) {
      setRegistered(true);
    }
  }, [post.id]);

  const handleRegisterClick = (e) => {
    e.preventDefault();
    soundFx.playSuccess();
    setRegistered(true);
    saveOfflineDraft(`registration_${post.id}`, {
      registered: true,
      hackathonTitle: post.title,
    });
    fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hackathonId: String(post.id || post.hackathonId), userId: 'user-guest' }),
    }).catch(() => {});
    toast.success(`Registered for ${post.title}!`, {
      description: 'Squad invite code and sponsor API access unlocked (cached offline).',
    });
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    soundFx.playClick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`https://devlovers.com/#sprint-${post.id}`);
      toast.success('Sprint link copied!', {
        description: 'Direct deep link copied to clipboard.',
      });
    }
  };

  // Format prize using integer cents + current selected currency
  const displayPrize = post.prize_cents
    ? formatPrize(post.prize_cents / 100, currency)
    : (post.prize || '$25,000');

  return (
    <TiltCard className="border border-white/10 bg-[#0C0F1D]/80 backdrop-blur-xl hover:border-cyan-500/40 hover:shadow-[0_0_35px_rgba(0,245,255,0.15)] transition-all">
      <article className="p-6">
        {/* Top Meta: Status Radar Ping + HUD Telemetry */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="radar-ping">
              <span className={`radar-ping-ring ${isOngoing ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
              <span className={`radar-ping-dot ${isOngoing ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
            </span>
            <span className="hud-tag text-[10px]">
              {post.status?.toUpperCase()}
            </span>
            {post.verified_commits && (
              <span className="hud-tag text-[9px] text-emerald-400 border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                VERIFIED COMMITS
              </span>
            )}
            {!countdown.isExpired && (
              <span
                className={`hud-tag text-[9px] font-mono flex items-center gap-1 ${
                  isOngoing ? 'text-emerald-400 border-emerald-500/30' : 'text-amber-400 border-amber-500/30'
                }`}
              >
                <Clock className="h-2.5 w-2.5" />
                {isOngoing ? `${countdown.formatted} left` : `Starts in ${countdown.formatted}`}
              </span>
            )}
            <span className="text-xs text-slate-400">
              {t('post.by')} <strong className="text-slate-200">{post.hostedBy}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 font-jetbrains text-cyan-300 text-xs font-semibold shrink-0 hover:bg-cyan-500/20 transition cursor-pointer"
                  title="Click to view prize breakdown"
                >
                  <Trophy className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{displayPrize}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-3 border-white/10 bg-[#0C0F1D]/98 shadow-2xl backdrop-blur-xl">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2 border-b border-white/5 pb-1">
                  Prize Distribution
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-amber-300">
                    <span>🥇 1st Place (60%)</span>
                    <span>{formatPrize(((post.prize_cents || 2500000) * 0.6) / 100, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>🥈 2nd Place (25%)</span>
                    <span>{formatPrize(((post.prize_cents || 2500000) * 0.25) / 100, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>🥉 3rd Place (10%)</span>
                    <span>{formatPrize(((post.prize_cents || 2500000) * 0.1) / 100, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-cyan-400 pt-1 border-t border-white/5 text-[11px]">
                    <span>🌟 Sponsor Track (5%)</span>
                    <span>{formatPrize(((post.prize_cents || 2500000) * 0.05) / 100, currency)}</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                toggleBookmark(post.id);
              }}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                bookmarkedSprints?.includes(post.id)
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-400'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
              title={bookmarkedSprints?.includes(post.id) ? 'Remove from bookmarks' : 'Bookmark sprint'}
              aria-label="Bookmark sprint"
            >
              <Bookmark className={`h-3.5 w-3.5 ${bookmarkedSprints?.includes(post.id) ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Challenge Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {post.description}
        </p>

        {/* Tech Stack Chips */}
        {post.tech_stack && (
          <div className="flex flex-wrap items-center gap-1.5 mb-4" aria-label="Tech Stack">
            <span className="text-[10px] uppercase font-mono text-slate-500 mr-1 flex items-center gap-1">
              <Code2 className="h-3 w-3 text-slate-400" /> Stack:
            </span>
            {post.tech_stack.map((tech, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTechFilter(tech);
                }}
                className="px-2 py-0.5 rounded-md bg-[#141A2E] text-[11px] font-mono text-cyan-300 border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                title={`Filter challenges by ${tech}`}
              >
                {tech}
              </button>
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags && (
          <div className="flex flex-wrap gap-1.5 mb-4" aria-label="Tags">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-md bg-white/5 text-[11px] font-mono text-slate-300 border border-white/5 hover:border-white/20 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Judging Rubric Evaluation Weights */}
        {post.criteria_scores && (
          <div className="mb-5 rounded-xl border border-white/5 bg-[#141A2E]/40 p-3">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold tracking-wider">
                <Sparkles className="h-3 w-3" />
                Evaluation Rubric
              </span>
              <span className="text-slate-500">100% weighted score</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(post.criteria_scores).map(([criterion, weight]) => (
                <div key={criterion} className="rounded-lg bg-[#0C0F1D]/80 border border-white/5 p-2 text-center">
                  <div className="text-[10px] text-slate-400 capitalize truncate">
                    {criterion.replace(/_/g, ' ')}
                  </div>
                  <div className="text-xs font-jetbrains font-bold text-cyan-300 mt-0.5">
                    {weight}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer: Timeline & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/5 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px]">
            {post.starts && (
              <span className="flex items-center gap-1.5 text-slate-300">
                <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                {t('post.starts')}: {post.starts}
              </span>
            )}

            {post.deadline && (
              <button
                type="button"
                onClick={() => setLocalUTCToggle((prev) => !prev)}
                title="Click to toggle Local / UTC timezone"
                className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {formatDeadline(post.deadline, effectiveShowUTC)} {effectiveShowUTC ? '(UTC)' : '(Local)'}
                </span>
              </button>
            )}

            {post.participants && (
              <span className="flex items-center gap-1.5 text-violet-300">
                <Users className="h-3.5 w-3.5" />
                {post.participants} {t('post.devs')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShareClick}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition cursor-pointer"
              title="Share Sprint"
              aria-label="Share Sprint"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                soundFx.playClick();
                setIsSquadModalOpen(true);
              }}
              className="text-xs font-semibold px-3 h-9 border-white/10 hover:border-violet-500/50 hover:bg-violet-500/10 text-violet-300 gap-1.5"
            >
              <Users className="h-3.5 w-3.5 text-violet-400" />
              Squads
            </Button>
            <Button
              variant={registered ? 'secondary' : 'cyber'}
              size="sm"
              onClick={handleRegisterClick}
              disabled={registered}
              className="text-xs font-semibold px-4 h-9"
            >
              {registered ? (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  {t('post.joined')}
                </span>
              ) : (
                t('post.enter')
              )}
            </Button>
            {registered && (
              <Button
                variant="cyber"
                size="sm"
                onClick={() => {
                  soundFx.playClick();
                  setIsSubmitModalOpen(true);
                }}
                className="text-xs font-semibold px-3 h-9 gap-1.5 shadow-cyan-500/20"
                title="Submit Project"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                Submit
              </Button>
            )}
          </div>
        </div>
      </article>

      <SquadModal
        open={isSquadModalOpen}
        onOpenChange={setIsSquadModalOpen}
        post={post}
      />
      <SubmitProjectModal
        open={isSubmitModalOpen}
        onOpenChange={setIsSubmitModalOpen}
        hackathon={post}
      />
    </TiltCard>
  );
}

export default React.memo(FeedPost);
