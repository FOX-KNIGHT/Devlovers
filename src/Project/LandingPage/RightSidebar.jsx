// src/Project/LandingPage/RightSidebar.jsx
import React from 'react';
import data from './data.js'; // Sibling file

function RightSidebar() {
  return (
    <aside className="right-sidebar">
      <h3>🔥 Trending Hackathons</h3>
      <div className="trending-list">
        {data.trending.map(item => (
          <a key={item.id} className="trending-item" href="#">
            <p>{item.id}. {item.title}</p>
            <span className={item.className}>
              <i className={`fas ${item.className === 'danger-text' ? 'fa-clock' : 
                                     item.details.includes('Prize') ? 'fa-trophy' : 
                                     item.details.includes('New') ? 'fa-star' :
                                     item.details.includes('Trending') ? 'fa-fire' : 'fa-users'}`}></i>
              {item.details}
            </span>
          </a>
        ))}
      </div>
    </aside>
  );
}

export default RightSidebar;