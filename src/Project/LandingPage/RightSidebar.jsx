import React, { useCallback, useMemo } from 'react';
import data from './data.js';

function RightSidebar() {
  const handleTrendingClick = useCallback((e, item) => {
    e.preventDefault();
    console.log('Clicked trending item:', item.title);
    // Add navigation or details view
  }, []);

  const getIconClass = useCallback((item) => {
    if (item.className === 'danger-text') return 'fa-clock';
    if (item.details.includes('Prize')) return 'fa-trophy';
    if (item.details.includes('New')) return 'fa-star';
    if (item.details.includes('Trending')) return 'fa-fire';
    return 'fa-users';
  }, []);

  const trendingItems = useMemo(() => data.trending, []);

  return (
    <aside className="right-sidebar" role="complementary" aria-label="Trending hackathons">
      <h3>
        <i className="fas fa-fire" aria-hidden="true"></i> 
        Trending Hackathons
      </h3>
      
      {trendingItems.length > 0 ? (
        <div className="trending-list" role="list">
          {trendingItems.map(item => (
            <a 
              key={item.id} 
              className="trending-item" 
              href="#"
              onClick={(e) => handleTrendingClick(e, item)}
              role="listitem"
              aria-label={`${item.title} - ${item.details}`}
            >
              <p>
                <span style={{ 
                  display: 'inline-block', 
                  minWidth: '24px',
                  fontWeight: '700',
                  color: 'var(--color-primary)'
                }}>
                  {item.id}.
                </span> 
                {item.title}
              </p>
              <span className={item.className}>
                <i 
                  className={`fas ${getIconClass(item)}`} 
                  aria-hidden="true"
                ></i>
                {item.details}
              </span>
            </a>
          ))}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: 'var(--color-text-secondary)'
        }}>
          <i className="fas fa-chart-line" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
          <p>No trending hackathons</p>
        </div>
      )}
      
      <div style={{ 
        marginTop: '30px', 
        padding: '15px',
        background: 'var(--color-background)',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ 
          fontSize: '0.85rem',
          color: 'var(--color-text-secondary)',
          marginBottom: '10px'
        }}>
          <i className="fas fa-lightbulb" aria-hidden="true"></i> Tip
        </p>
        <p style={{ fontSize: '0.8rem' }}>
          Join trending hackathons early to connect with top teams!
        </p>
      </div>
    </aside>
  );
}

export default React.memo(RightSidebar);