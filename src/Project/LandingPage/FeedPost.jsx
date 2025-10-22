// src/Project/LandingPage/FeedPost.jsx
import React from 'react';

function FeedPost({ post, showSignInModal }) {
  const statusClass = post.status.toLowerCase();
  
  return (
    <div className="feed-post" data-category={post.category}>
      <div className="post-status">
        <span className={`status-pill ${statusClass}`}>{post.status.charAt(0).toUpperCase() + post.status.slice(1)}</span>
      </div>
      <div className="post-header">
        <h3>{post.title}</h3>
        <div className="post-details">
          <span className="detail-item"><i className="fas fa-building"></i> Hosted by: <strong>{post.hostedBy}</strong></span>
          {post.starts && (
            <span className="detail-item"><i className="fas fa-calendar-alt"></i> Starts: <span className="highlight">{post.starts}</span></span>
          )}
          {post.deadline && (
            <span className="detail-item"><i className="fas fa-calendar-times"></i> Deadline: <span className="highlight-danger">{post.deadline}</span></span>
          )}
          {post.prize && (
            <span className="detail-item"><i className="fas fa-trophy"></i> Prize: <span className="highlight">{post.prize}</span></span>
          )}
          {post.participants && (
            <span className="detail-item"><i className="fas fa-users"></i> Participants: <span className="highlight">{post.participants}</span></span>
          )}
        </div>
      </div>
      <p className="post-description">{post.description}</p>
      <div className="post-tags">
        {post.tags.map((tag, index) => <span key={index} className="tag">{tag}</span>)}
      </div>
      <div className="post-actions">
        <button className="register-btn" onClick={showSignInModal}>
          <i className="fas fa-arrow-alt-circle-right"></i> Register Now
        </button>
        <a href="#"><i className="fas fa-info-circle"></i> Details</a>
        <a href="#"><i className="fas fa-share-alt"></i> Share</a>
      </div>
    </div>
  );
}

export default FeedPost;