import React, { useMemo } from 'react';
import FeedPost from './FeedPost.jsx';
import data from './data.js';

function HackathonFeed({ currentFilter, showSignInModal }) {
  const filteredPosts = useMemo(() => {
    return data.feedPosts.filter(post => {
      if (currentFilter === 'all') return true;
      if (currentFilter === 'prize') return post.prize;
      return post.category.includes(currentFilter);
    });
  }, [currentFilter]);

  if (filteredPosts.length === 0) {
    return (
      <div className="hackathon-feed" id="hackathon-feed">
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: 'var(--color-text-secondary)'
        }}>
          <i className="fas fa-search" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
          <h3>No hackathons found</h3>
          <p>Try adjusting your filters to see more results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hackathon-feed" id="hackathon-feed" role="feed" aria-label="Hackathon posts">
      {filteredPosts.map(post => (
        <FeedPost 
          key={post.id} 
          post={post} 
          showSignInModal={showSignInModal} 
        />
      ))}
      
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        color: 'var(--color-text-secondary)',
        fontSize: '0.9rem'
      }}>
        <p>🎯 Showing {filteredPosts.length} hackathon{filteredPosts.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}

export default React.memo(HackathonFeed);