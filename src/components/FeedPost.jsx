'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Calendar,
  Users,
  Clock,
  Sparkles,
  ExternalLink,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TiltCard } from '@/components/ui/tilt-card';
import { soundFx } from '@/lib/audio/sound-fx';
import { toast } from 'sonner';

export function FeedPost({ post }) {
  const [registered, setRegistered] = useState(false);

  const handleRegister = () => {
    soundFx.playSuccess();
    setRegistered(true);
    toast.success(`Registered for ${post.title}!`, {
      description: 'Squad invite code and sponsor API access unlocked.',
    });
  };

  const isOngoing = post.status === 'ongoing';

  return (
    <TiltCard className="border border-white/10 bg-[#0C0F1D]/80 backdrop-blur-xl hover:border-cyan-500/40 hover:shadow-[0_0_35px_rgba(0,245,255,0.15)]">
      <article className="p-6">
        {/* Top Meta: Status Radar + Hosted by */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="radar-ping">
              <span className={`radar-ping-ring ${isOngoing ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
              <span className={`radar-ping-dot ${isOngoing ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
            </span>
            <span className="hud-tag text-[10px]">
              {post.status?.toUpperCase()}
            </span>
            <span className="text-xs text-slate-400">
              by <strong className="text-slate-200">{post.hostedBy}</strong>
            </span>
          </div>

          {post.prize && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 font-mono text-cyan-300 text-xs font-semibold">
              <Trophy className="h-3.5 w-3.5 text-cyan-400" />
              <span>{post.prize}</span>
            </div>
          )}
        </div>

        {/* Main Title & Description */}
        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
          {post.title}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {post.description}
        </p>

        {/* Tags */}
        {post.tags && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-md bg-[#141A2E] text-[11px] font-mono text-slate-300 border border-white/5 hover:border-cyan-500/30 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: Timeline & Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/5 text-xs text-slate-400">
          <div className="flex items-center gap-4 font-mono text-[11px]">
            {post.starts && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                Starts: {post.starts}
              </span>
            )}
            {post.deadline && (
              <span className="flex items-center gap-1.5 text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                Deadline: {post.deadline}
              </span>
            )}
            {post.participants && (
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-violet-400" />
                {post.participants} devs
              </span>
            )}
          </div>

          <Button
            variant={registered ? 'secondary' : 'cyber'}
            size="sm"
            onClick={handleRegister}
            disabled={registered}
            className="text-xs font-semibold px-4 h-9"
          >
            {registered ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                Joined
              </span>
            ) : (
              'Enter Challenge'
            )}
          </Button>
        </div>
      </article>
    </TiltCard>
  );
}
