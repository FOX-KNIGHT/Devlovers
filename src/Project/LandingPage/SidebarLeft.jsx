import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import data from './data.js';

function SidebarLeft({ 
  isMobileVisible, 
  isCollapsed, 
  handleSidebarToggle, 
  sidebarToggleIconClass, 
  activeHackathon, 
  setActiveHackathon, 
  showToast 
}) {
  const [isSortDropdownVisible, setIsSortDropdownVisible] = useState(false);
  const [activeSort, setActiveSort] = useState('Newest');
  const sortContainerRef = useRef(null);
  
  // Memoize sort options
  const sortOptions = useMemo(() => [
    'Newest', 
    'Oldest', 
    'Recent Activity', 
    'Deadline Soon'
  ], []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortContainerRef.current && !sortContainerRef.current.contains(event.target)) {
        setIsSortDropdownVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle sort dropdown
  const toggleSortDropdown = useCallback((e) => {
    e.stopPropagation();
    setIsSortDropdownVisible(prev => !prev);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((e, newSort) => {
    e.preventDefault();
    setActiveSort(newSort);
    setIsSortDropdownVisible(false);
    showToast(`📊 Sorted by: ${newSort}`);
  }, [showToast]);

  // Handle hackathon click
  const handleHackathonClick = useCallback((e, hackathon) => {
    e.preventDefault();
    setActiveHackathon(hackathon);
  }, [setActiveHackathon]);

  return (
    <aside 
      className={`sidebar-L ${isMobileVisible ? 'visible' : ''}`} 
      id="sidebar-left"
      role="complementary"
      aria-label="Hackathon navigation"
    >
      <div className="sidebar-header">
        <p className="hackathon-title">Your Hackathons</p>
        
        <i
          className={`fas ${sidebarToggleIconClass} sidebar-toggle-icon`}
          title="Toggle Sidebar"
          id="sidebar-toggle-desktop"
          onClick={handleSidebarToggle}
          role="button"
          tabIndex={0}
          aria-label="Toggle sidebar"
          aria-expanded={!isCollapsed}
        ></i>
        
        <div className="sort-container" id="sort-container" ref={sortContainerRef}>
          <button 
            className="sort-button" 
            id="sort-button" 
            onClick={toggleSortDropdown}
            aria-haspopup="true"
            aria-expanded={isSortDropdownVisible}
            aria-label="Sort hackathons"
          >
            <i className="fas fa-sort-amount-down" aria-hidden="true"></i> 
            <span>{activeSort}</span>
          </button>
          <div 
            className={`sort-dropdown ${isSortDropdownVisible ? 'visible' : ''}`} 
            id="sort-dropdown"
            role="menu"
          >
            {sortOptions.map(sort => (
              <a
                key={sort}
                href="#"
                className={`sort-option ${activeSort === sort ? 'active-sort' : ''}`}
                data-sort={sort.toLowerCase().replace(/\s/g, '')}
                onClick={(e) => handleSortChange(e, sort)}
                role="menuitem"
                aria-selected={activeSort === sort}
              >
                {sort}
              </a>
            ))}
          </div>
        </div>
      </div>
      
      <nav className="hackathons-list" role="navigation" aria-label="Hackathon list">
        {data.hackathons.map(hackathon => (
          <a
            key={hackathon.id}
            className={`hackathon-item ${hackathon.id === activeHackathon.id ? 'active-item' : ''}`}
            href="#"
            onClick={(e) => handleHackathonClick(e, hackathon)}
            role="button"
            aria-current={hackathon.id === activeHackathon.id ? 'page' : undefined}
            aria-label={`${hackathon.name} - ${hackathon.status}`}
          >
            <span 
              className={`dot ${hackathon.status === 'Active' ? 'active-dot' : ''}`}
              aria-label={hackathon.status}
            ></span>
            <span>{hackathon.name}</span>
            {isCollapsed && (
              <span className="hackathon-tooltip" role="tooltip">
                {hackathon.name}
              </span>
            )}
          </a>
        ))}
      </nav>
      
      {data.hackathons.length === 0 && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          color: 'var(--color-text-secondary)'
        }}>
          <i className="fas fa-inbox" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
          <p>No hackathons yet</p>
        </div>
      )}
    </aside>
  );
}

export default React.memo(SidebarLeft);