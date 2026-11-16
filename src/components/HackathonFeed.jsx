'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedPost } from '@/components/FeedPost';
import { Filter, Sparkles } from 'lucide-react';

export function HackathonFeed({ posts = [], activeFilter = 'all', onFilterChange }) {
  const filterButtons = [
    { label: 'All Sprints', value: 'all' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Ongoing', value: 'ongoing' },
    { label: 'Remote Only', value: 'remote' },
    { label: 'High Bounty ($25k+)', value: 'prize' },
  ];

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'upcoming') return post.status === 'upcoming';
    if (activeFilter === 'ongoing') return post.status === 'ongoing';
    if (activeFilter === 'remote') return post.tags?.some((t) => t.toLowerCase().includes('remote'));
    if (activeFilter === 'prize') return post.prize && parseInt(post.prize.replace(/[^0-9]/g, ''), 10) >= 25000;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filterButtons.map((btn) => {
          const isActive = activeFilter === btn.value;

          return (
            <button
              key={btn.value}
              onClick={() => onFilterChange(btn.value)}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wide transition-all ${
                isActive
                  ? 'text-cyan-300 font-semibold border border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,245,255,0.15)]'
                  : 'text-slate-400 hover:text-white bg-[#0C0F1D]/80 border border-white/5 hover:border-white/10'
              }`}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Posts List */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filteredPosts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#0C0F1D]/50 p-12 text-center text-slate-400">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-cyan-400 opacity-50" />
              <p className="text-sm">No hackathons matching this filter category.</p>
            </div>
          ) : (
            filteredPosts.map((post) => <FeedPost key={post.id} post={post} />)
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
