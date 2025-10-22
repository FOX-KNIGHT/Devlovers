// src/Project/LandingPage/Header.jsx
import React, { useState, useMemo } from 'react';
import { useAuthDropdown } from '../../hooks/useAuthDropdown.js';
import NotificationDropdown from './NotificationDropdown.jsx';
import { useAppContext } from './AppContext.jsx';

function Header({ setCurrentPage }) {
  const {
    isLoggedIn,
    isDarkMode,
    unreadCount,
    toggleTheme,
    handleSidebarToggle,
    setIsSignInModalOpen,
    simulateLogout,
    setIsMobileSearchOpen,
    isMobileSearchOpen,
    isMobileSidebarVisible, 
    isSidebarCollapsed, 
  } = useAppContext();

  const [searchInput, setSearchInput] = useState('');
  
  const {
    isProfileDropdownVisible,
    isNotificationDropdownVisible,
    toggleProfileDropdown,
    toggleNotificationDropdown,
    dropdownRef,
    closeAllDropdowns 
  } = useAuthDropdown();

  const handleSearchInput = (e) => {
    setSearchInput(e.target.value);
  };
  
  const closeMobileSearch = (e) => {
    e.preventDefault();
    setIsMobileSearchOpen(false);
    setSearchInput('');
  }
  
  const openMobileSearch = () => {
    setIsMobileSearchOpen(true);
  }

  /* ENHANCEMENT 1: Updated menuIconClass logic to align with CSS/JS expectations:
    - Mobile (<= 768px): fa-bars (closed) / fa-times (open)
    - Tablet/Desktop (> 768px): fa-angle-left (expanded) / fa-angle-right (collapsed)
    The provided HTML/JS uses `fa-bars` for expanded desktop, but the CSS/JS
    logic implies `fa-arrow-right`/`fa-angle-right` for collapsed and `fa-bars`/`fa-angle-left` for expanded/open.
    The CSS logic uses `fa-angle-left` for expanded and `fa-angle-right` for collapsed *inside* the sidebar on desktop/tablet,
    but the main navbar toggle uses `fa-bars` and `fa-times` for mobile, and the provided CSS uses `fa-bars` or `fa-arrow-right`
    in the JS logic for desktop. We'll use the CSS/JS's intended final icons for simplicity: 
    Mobile: fa-bars/fa-times. Desktop: fa-angle-left (expanded) / fa-angle-right (collapsed).
  */
  const menuIconClass = useMemo(() => {
    const isMobileView = window.innerWidth <= 768;
    
    if (isMobileView) {
      // Mobile view uses 'fas fa-bars' to open the overlay, 'fas fa-times' to close
      return isMobileSidebarVisible ? 'fas fa-times' : 'fas fa-bars';
    } else {
      // Desktop/Tablet view uses 'fas fa-angle-left' for expanded, 'fas fa-angle-right' for collapsed
      return isSidebarCollapsed ? 'fas fa-angle-right' : 'fas fa-angle-left';
    }
  }, [isMobileSidebarVisible, isSidebarCollapsed]);

  const handleLogoutClick = (e) => {
    e.preventDefault();
    closeAllDropdowns();
    simulateLogout();
  };
  
  return (
    <>
      <header>
        <nav className="nav-bar">
          <div className="header-left">
            {/* 1. Menu Toggle (for Sidebar visibility/collapse) */}
            <div className="menu-toggle" id="menu-toggle" onClick={handleSidebarToggle}>
              <i className={menuIconClass}></i>
            </div>
            <div className="logo" onClick={() => setCurrentPage('Hackathon')}>
              <p>Devlovers</p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="search-bar" id="desktop-search-bar">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              id="search-input" 
              placeholder="Search hackathons, projects..." 
              onChange={handleSearchInput}
              value={searchInput}
            />
          </div>

          <div className="header-right" ref={dropdownRef}>
            
            {/* Conditional Sign In Button */}
            {!isLoggedIn && (
              <button className="sign-in-btn" id="signin-button" onClick={() => setIsSignInModalOpen(true)}>Sign In</button>
            )}
            
            {/* Mobile Search Toggle */}
            <div className="mobile-search-toggle" id="mobile-search-toggle" onClick={openMobileSearch}>
              <i className="fas fa-search"></i>
            </div>

            {/* 3. Theme Toggle (Day/Night Mode) */}
            <div className="theme-toggle" id="theme-toggle" onClick={toggleTheme}>
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </div>

            {/* Authenticated Icons (Notification & Profile) */}
            {isLoggedIn && (
              <div className="auth-icons">
                {/* 2. Notification Dropdown */}
                <div className="notification-container" id="notification-container">
                  <div className="notification" id="notification-icon" onClick={toggleNotificationDropdown}>
                    <i className="fas fa-bell"></i>
                    {/* The unreadCount logic matches the required HTML/CSS structure for the badge */}
                    {unreadCount > 0 && <span className="notification-badge" id="notification-badge">{unreadCount}</span>}
                  </div>
                  <NotificationDropdown
                    isVisible={isNotificationDropdownVisible}
                  />
                </div>
                {/* 4. Profile Dropdown */}
                <div className="profile-container" id="profile-container">
                  <div className="profile-icon" id="profile-icon" onClick={toggleProfileDropdown}>
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <div className={`profile-dropdown ${isProfileDropdownVisible ? 'visible' : ''}`} id="profile-dropdown-menu">
                    <a href="#dashboard" onClick={closeAllDropdowns}><i className="fas fa-tachometer-alt"></i> Dashboard</a>
                    <a href="#profile" onClick={closeAllDropdowns}><i className="fas fa-address-card"></i> My Profile</a>
                    <a href="#projects" onClick={closeAllDropdowns}><i className="fas fa-folder-open"></i> My Projects</a>
                    <a href="#settings" onClick={closeAllDropdowns}><i className="fas fa-cog"></i> Account Settings</a>
                    <a href="#logout" id="logout-link" onClick={handleLogoutClick}>
                      <i className="fas fa-sign-out-alt"></i> Log Out
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>
      
      {/* Mobile Search Overlay */}
      <div className={`mobile-search-overlay ${isMobileSearchOpen ? 'visible' : ''}`} id="mobile-search-overlay">
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            id="mobile-search-input" 
            placeholder="Search hackathons, projects..." 
            onChange={handleSearchInput}
            value={searchInput}
          />
        </div>
        <a 
          href="#" 
          id="close-mobile-search" 
          onClick={closeMobileSearch}
          style={{ display: 'block', textAlign: 'center', marginTop: '20px', color: 'var(--color-danger)', fontWeight: '600' }}
        >
          Close
        </a>
      </div>
    </>
  );
}

export default Header;