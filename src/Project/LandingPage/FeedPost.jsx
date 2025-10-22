import React, { useCallback } from 'react';

function FeedPost({ post, showSignInModal }) {
  const statusClass = post.status.toLowerCase();
  
  const handleRegisterClick = useCallback((e) => {
    e.preventDefault();
    showSignInModal();
  }, [showSignInModal]);

  const handleDetailClick = useCallback((e) => {
    e.preventDefault();
    console.log('View details for:', post.title);
    // Add navigation to detail page
  }, [post.title]);

  const handleShareClick = useCallback((e) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description,
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }, [post.title, post.description]);
  
  return (
    <article className="feed-post" data-category={post.category}>
      <div className="post-status">
        <span className={`status-pill ${statusClass}`}>
          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
        </span>
      </div>
      
      <div className="post-header">
        <h3>{post.title}</h3>
        <div className="post-details">
          <span className="detail-item">
            <i className="fas fa-building" aria-hidden="true"></i> 
            Hosted by: <strong>{post.hostedBy}</strong>
          </span>
          {post.starts && (
            <span className="detail-item">
              <i className="fas fa-calendar-alt" aria-hidden="true"></i> 
              Starts: <span className="highlight">{post.starts}</span>
            </span>
          )}
          {post.deadline && (
            <span className="detail-item">
              <i className="fas fa-calendar-times" aria-hidden="true"></i> 
              Deadline: <span className="highlight-danger">{post.deadline}</span>
            </span>
          )}
          {post.prize && (
            <span className="detail-item">
              <i className="fas fa-trophy" aria-hidden="true"></i> 
              Prize: <span className="highlight">{post.prize}</span>
            </span>
          )}
          {post.participants && (
            <span className="detail-item">
              <i className="fas fa-users" aria-hidden="true"></i> 
              Participants: <span className="highlight">{post.participants}</span>
            </span>
          )}
        </div>
      </div>
      
      <p className="post-description">{post.description}</p>
      
      <div className="post-tags" role="list" aria-label="Tags">
        {post.tags.map((tag, index) => (
          <span key={index} className="tag" role="listitem">
            #{tag}
          </span>
        ))}
      </div>
      
      <div className="post-actions">
        <button 
          className="register-btn" 
          onClick={handleRegisterClick}
          aria-label={`Register for ${post.title}`}
        >
          <i className="fas fa-arrow-alt-circle-right" aria-hidden="true"></i> 
          Register Now
        </button>
        <a href="#" onClick={handleDetailClick} aria-label={`View details for ${post.title}`}>
          <i className="fas fa-info-circle" aria-hidden="true"></i> Details
        </a>
        <a href="#" onClick={handleShareClick} aria-label={`Share ${post.title}`}>
          <i className="fas fa-share-alt" aria-hidden="true"></i> Share
        </a>
      </div>
    </article>
  );
}

export default React.memo(FeedPost)