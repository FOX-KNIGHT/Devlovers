// src/Project/LandingPage/SidebarLeft.jsx
import React, { useState, useRef, useEffect } from 'react';
import data from './data.js'; // Sibling file

function SidebarLeft({ isMobileVisible, isCollapsed, handleSidebarToggle, sidebarToggleIconClass, activeHackathon, setActiveHackathon, showToast }) {
  const [isSortDropdownVisible, setIsSortDropdownVisible] = useState(false);
  const [activeSort, setActiveSort] = useState('Newest');
  const sortContainerRef = useRef(null);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortContainerRef.current && !sortContainerRef.current.contains(event.target)) {
        setIsSortDropdownVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleSortChange = (e, newSort) => {
    e.preventDefault();
    setActiveSort(newSort);
    setIsSortDropdownVisible(false);
    showToast(`Sorted by: ${newSort}`);
  };

  return (
    <aside className={`sidebar-L ${isMobileVisible ? 'visible' : ''}`} id="sidebar-left">
      <div className="sidebar-header">
        <p className="hackathon-title">Your Hackathons</p>
        
        <i
          className={`fas ${sidebarToggleIconClass} sidebar-toggle-icon`}
          title="Toggle Sidebar"
          id="sidebar-toggle-desktop"
          onClick={handleSidebarToggle}
        ></i>
        
        <div className="sort-container" id="sort-container" ref={sortContainerRef}>
          <button className="sort-button" id="sort-button" onClick={(e) => { e.stopPropagation(); setIsSortDropdownVisible(prev => !prev); }}>
            <i className="fas fa-sort-amount-down"></i> <span>{activeSort}</span>
          </button>
          <div className={`sort-dropdown ${isSortDropdownVisible ? 'visible' : ''}`} id="sort-dropdown">
            {['Newest', 'Oldest', 'Recent Activity', 'Deadline Soon'].map(sort => (
              <a
                key={sort}
                href="#"
                className={`sort-option ${activeSort === sort ? 'active-sort' : ''}`}
                data-sort={sort.toLowerCase().replace(/\s/g, '')}
                onClick={(e) => handleSortChange(e, sort)}
              >
                {sort}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="hackathons-list">
        {data.hackathons.map(hackathon => (
          <a
            key={hackathon.id}
            className={`hackathon-item ${hackathon.id === activeHackathon.id ? 'active-item' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveHackathon(hackathon); }}
          >
            <span className={`dot ${hackathon.status === 'Active' ? 'active-dot' : ''}`}></span>
            <span>{hackathon.name}</span>
            {isCollapsed && <span className="hackathon-tooltip">{hackathon.name}</span>}
          </a>
        ))}
      </div>
    </aside>
  );
}

export default SidebarLeft;