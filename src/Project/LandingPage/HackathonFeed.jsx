// src/Project/LandingPage/HackathonFeed.jsx
import React, { useMemo } from 'react';
import FeedPost from './FeedPost.jsx'; // Correct path: Sibling file
import data from './data.js';

function HackathonFeed({ currentFilter, showSignInModal }) {
  const filteredPosts = useMemo(() => {
    return data.feedPosts.filter(post => {
      if (currentFilter === 'all') return true;
      if (currentFilter === 'prize') return post.prize;
      return post.category.includes(currentFilter);
    });
  }, [currentFilter]);

  return (
    <div className="hackathon-feed" id="hackathon-feed">
      {filteredPosts.map(post => (
        <FeedPost key={post.id} post={post} showSignInModal={showSignInModal} />
      ))}
    </div>
  );
}

export default HackathonFeed;