'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FeedPost from './FeedPost.jsx';
import data from './data.js';
import { Sparkles } from 'lucide-react';
import { useAppContext } from './AppContext.jsx';

function HackathonFeed({ currentFilter = 'all', showSignInModal }) {
  const { activeSort, activeHackathon, activeTechFilter, bookmarkedSprints } = useAppContext();

  const filteredPosts = useMemo(() => {
    const list = data.feedPosts.filter(post => {
      // Channel filtering
      if (activeHackathon && activeHackathon.id && activeHackathon.id !== 0) {
        if (post.hackathonId && post.hackathonId !== activeHackathon.id) {
          return false;
        }
      }

      // Tech Stack filter
      if (activeTechFilter) {
        if (!post.tech_stack?.some(t => t.toLowerCase() === activeTechFilter.toLowerCase())) {
          return false;
        }
      }

      if (currentFilter === 'all') return true;
      if (currentFilter === 'bookmarked') return bookmarkedSprints?.includes(post.id);
      const statusUpper = post.status?.toUpperCase();
      if (currentFilter === 'upcoming') return statusUpper === 'UPCOMING';
      if (currentFilter === 'ongoing') return statusUpper === 'ACTIVE' || statusUpper === 'ONGOING';
      if (currentFilter === 'remote') return post.tags?.some(t => t.toLowerCase().includes('remote'));
      if (currentFilter === 'prize') {
        const prizeAmount = post.prize_cents ? post.prize_cents / 100 : parseInt(post.prize?.replace(/[^0-9]/g, '') || '0', 10);
        return prizeAmount >= 25000;
      }
      return post.category?.includes(currentFilter);
    });

    return [...list].sort((a, b) => {
      if (activeSort === 'Newest') {
        return new Date(b.starts_at || b.starts || 0) - new Date(a.starts_at || a.starts || 0);
      }
      if (activeSort === 'Oldest') {
        return new Date(a.starts_at || a.starts || 0) - new Date(b.starts_at || b.starts || 0);
      }
      if (activeSort === 'High Bounty') {
        return (b.prize_cents || 0) - (a.prize_cents || 0);
      }
      if (activeSort === 'Deadline Soon') {
        return new Date(a.deadline || 0) - new Date(b.deadline || 0);
      }
      return 0;
    });
  }, [currentFilter, activeSort, activeHackathon, activeTechFilter, bookmarkedSprints]);

  if (filteredPosts.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0C0F1D]/50 p-12 text-center text-slate-400">
        <Sparkles className="h-8 w-8 mx-auto mb-2 text-cyan-400 opacity-50" />
        <h3 className="text-white font-semibold text-base mb-1">No challenges found</h3>
        <p className="text-xs text-slate-400">Try adjusting your filters to see more active sprints.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="feed" aria-label="Hackathon challenges feed">
      <AnimatePresence mode="popLayout">
        {filteredPosts.map(post => (
          <motion.div
            key={post.id}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <FeedPost
              post={post}
              showSignInModal={showSignInModal}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="text-center py-4 text-xs font-mono text-slate-500">
        <p>🎯 Showing {filteredPosts.length} challenge{filteredPosts.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}

export default React.memo(HackathonFeed);
