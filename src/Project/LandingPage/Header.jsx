import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faSignInAlt, faSun, faMoon, faBell, faUserCircle, 
  faBars, faTimes, faChevronLeft, faChevronRight, 
  faTachometerAlt, faAddressCard, faFolderOpen, faCog, faSignOutAlt, faUser 
} from '@fortawesome/free-solid-svg-icons';

import { useAuthDropdown } from '../../hooks/useAuthDropdown.js';
import NotificationDropdown from './NotificationDropdown.jsx';
import { useAppContext } from './AppContext.jsx';

import './Header.css'; 

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
    user,
  } = useAppContext();

  const [searchInput, setSearchInput] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const mobileSearchInputRef = useRef(null);
  
  const {
    isProfileDropdownVisible,
    isNotificationDropdownVisible,
    toggleProfileDropdown,
    toggleNotificationDropdown,
    dropdownRef,
    closeAllDropdowns 
  } = useAuthDropdown();

  // Handle responsive view detection
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Auto-focus mobile search input when opened
  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  // Close mobile search on escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isMobileSearchOpen) {
        setIsMobileSearchOpen(false);
        setSearchInput('');
      }
    };

    if (isMobileSearchOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isMobileSearchOpen, setIsMobileSearchOpen]);

  // Handle search input change with debouncing capability
  const handleSearchInput = useCallback((e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Optional: Add real-time search suggestions here
    // debounce(() => fetchSearchSuggestions(value), 300);
  }, []);
  
  // Close mobile search
  const closeMobileSearch = useCallback((e) => {
    e?.preventDefault();
    setIsMobileSearchOpen(false);
    setSearchInput('');
  }, [setIsMobileSearchOpen]);
  
  // Open mobile search
  const openMobileSearch = useCallback(() => {
    setIsMobileSearchOpen(true);
  }, [setIsMobileSearchOpen]);

  // Handle search submit with validation
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    const trimmedSearch = searchInput.trim();
    
    if (trimmedSearch) {
      console.log('Searching for:', trimmedSearch);
      // Close mobile search after submission
      if (isMobileSearchOpen) {
        closeMobileSearch();
      }
      // Add actual search functionality here
      // e.g., navigate to search results page or trigger search API
    }
  }, [searchInput, isMobileSearchOpen, closeMobileSearch]);

  // Memoize menu icon based on viewport and sidebar state
  const menuIcon = useMemo(() => {
    if (isMobileView) {
      return isMobileSidebarVisible ? faTimes : faBars;
    }
    return isSidebarCollapsed ? faChevronRight : faChevronLeft;
  }, [isMobileView, isMobileSidebarVisible, isSidebarCollapsed]);

  // Handle logout with confirmation (optional)
  const handleLogoutClick = useCallback((e) => {
    e.preventDefault();
    closeAllDropdowns();
    
    // Optional: Add confirmation dialog
    // if (window.confirm('Are you sure you want to log out?')) {
    //   simulateLogout();
    // }
    
    simulateLogout();
  }, [closeAllDropdowns, simulateLogout]);

  // Handle logo click - navigate to home
  const handleLogoClick = useCallback(() => {
    setCurrentPage('Hackathon');
    closeAllDropdowns();
  }, [setCurrentPage, closeAllDropdowns]);

  // Handle keyboard navigation for interactive elements
  const handleKeyPress = useCallback((callback) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback(e);
    }
  }, []);

  // Profile menu navigation handler
  const handleProfileMenuClick = useCallback((e, action) => {
    e.preventDefault();
    closeAllDropdowns();
    
    // Handle different menu actions
    switch(action) {
      case 'dashboard':
        setCurrentPage('Dashboard');
        break;
      case 'profile':
        setCurrentPage('Profile');
        break;
      case 'projects':
        setCurrentPage('Projects');
        break;
      case 'settings':
        setCurrentPage('Settings');
        break;
      default:
        break;
    }
  }, [closeAllDropdowns, setCurrentPage]);
  
  return (
    <>
      <header className="site-header">
        <nav className="nav-bar" role="navigation" aria-label="Main navigation">
          <div className="header-left">
            <button 
              className="menu-toggle" 
              onClick={handleSidebarToggle}
              onKeyPress={handleKeyPress(handleSidebarToggle)}
              aria-label={isMobileView 
                ? (isMobileSidebarVisible ? 'Close sidebar' : 'Open sidebar')
                : (isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar')
              }
              aria-expanded={isMobileView ? isMobileSidebarVisible : !isSidebarCollapsed}
            >
              <FontAwesomeIcon icon={menuIcon} aria-hidden="true" />
            </button>
            
            <button 
              className="logo" 
              onClick={handleLogoClick}
              onKeyPress={handleKeyPress(handleLogoClick)}
              aria-label="Go to home page"
            >
              <p>Devlovers</p>
            </button>
          </div>

          {/* Desktop Search Bar */}
          <form 
            className="search-bar" 
            id="desktop-search-bar"
            onSubmit={handleSearchSubmit}
            role="search"
          >
            <FontAwesomeIcon icon={faSearch} aria-hidden="true" />
            <input 
              type="search" 
              id="search-input" 
              placeholder="Search hackathons, projects..." 
              onChange={handleSearchInput}
              value={searchInput}
              aria-label="Search hackathons and projects"
              autoComplete="off"
            />
          </form>

          <div className="header-right" ref={dropdownRef}>
            
            {/* Sign In Button */}
            {!isLoggedIn && (
              <button 
                className="sign-in-btn" 
                onClick={() => setIsSignInModalOpen(true)}
                aria-label="Sign in to your account"
              >
                <FontAwesomeIcon icon={faSignInAlt} aria-hidden="true" /> 
                <span>Sign In</span>
              </button>
            )}
            
            {/* Mobile Search Toggle */}
            <button 
              className="mobile-search-toggle" 
              onClick={openMobileSearch}
              onKeyPress={handleKeyPress(openMobileSearch)}
              aria-label="Open search"
            >
              <FontAwesomeIcon icon={faSearch} aria-hidden="true" />
            </button>

            {/* Theme Toggle */}
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              onKeyPress={handleKeyPress(toggleTheme)}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              <FontAwesomeIcon 
                icon={isDarkMode ? faSun : faMoon} 
                aria-hidden="true"
              />
            </button>

            {/* Authenticated Icons */}
            {isLoggedIn && (
              <div className="auth-icons">
                {/* Notification Dropdown */}
                <div className="notification-container">
                  <button 
                    className="notification" 
                    onClick={toggleNotificationDropdown}
                    onKeyPress={handleKeyPress(toggleNotificationDropdown)}
                    aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                    aria-expanded={isNotificationDropdownVisible}
                    aria-haspopup="true"
                  >
                    <FontAwesomeIcon icon={faBell} aria-hidden="true" />
                    {unreadCount > 0 && (
                      <span 
                        className="notification-badge" 
                        aria-label={`${unreadCount} unread notifications`}
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <NotificationDropdown
                    isVisible={isNotificationDropdownVisible}
                  />
                </div>

                {/* Profile Dropdown */}
                <div className="profile-container">
                  <button 
                    className="profile-icon" 
                    onClick={toggleProfileDropdown}
                    onKeyPress={handleKeyPress(toggleProfileDropdown)}
                    aria-label="Profile menu"
                    aria-expanded={isProfileDropdownVisible}
                    aria-haspopup="true"
                  >
                    <FontAwesomeIcon icon={faUserCircle} aria-hidden="true" />
                  </button>
                  
                  <div 
                    className={`profile-dropdown ${isProfileDropdownVisible ? 'visible' : ''}`} 
                    role="menu"
                    aria-hidden={!isProfileDropdownVisible}
                  >
                    {user && (
                      <div className="profile-header" role="presentation">
                        <FontAwesomeIcon icon={faUser} aria-hidden="true" /> 
                        <span>{user.name}</span>
                      </div>
                    )}
                    
                    <button 
                      onClick={(e) => handleProfileMenuClick(e, 'dashboard')} 
                      role="menuitem"
                      className="profile-menu-item"
                    >
                      <FontAwesomeIcon icon={faTachometerAlt} aria-hidden="true" /> 
                      <span>Dashboard</span>
                    </button>
                    
                    <button 
                      onClick={(e) => handleProfileMenuClick(e, 'profile')} 
                      role="menuitem"
                      className="profile-menu-item"
                    >
                      <FontAwesomeIcon icon={faAddressCard} aria-hidden="true" /> 
                      <span>My Profile</span>
                    </button>
                    
                    <button 
                      onClick={(e) => handleProfileMenuClick(e, 'projects')} 
                      role="menuitem"
                      className="profile-menu-item"
                    >
                      <FontAwesomeIcon icon={faFolderOpen} aria-hidden="true" /> 
                      <span>My Projects</span>
                    </button>
                    
                    <button 
                      onClick={(e) => handleProfileMenuClick(e, 'settings')} 
                      role="menuitem"
                      className="profile-menu-item"
                    >
                      <FontAwesomeIcon icon={faCog} aria-hidden="true" /> 
                      <span>Account Settings</span>
                    </button>
                    
                    <button 
                      onClick={handleLogoutClick}
                      role="menuitem"
                      className="profile-menu-item logout-item"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} aria-hidden="true" /> 
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>
      
      {/* Mobile Search Overlay */}
      <div 
        className={`mobile-search-overlay ${isMobileSearchOpen ? 'visible' : ''}`} 
        role="dialog"
        aria-modal="true"
        aria-label="Mobile search"
      >
        <form className="search-bar" onSubmit={handleSearchSubmit} role="search">
          <FontAwesomeIcon icon={faSearch} aria-hidden="true" />
          <input 
            type="search" 
            ref={mobileSearchInputRef}
            placeholder="Search hackathons, projects..." 
            onChange={handleSearchInput}
            value={searchInput}
            aria-label="Search hackathons and projects"
            autoComplete="off"
          />
        </form>
        
        <button 
          onClick={closeMobileSearch}
          className="close-mobile-search-btn"
          aria-label="Close search"
        >
          <FontAwesomeIcon icon={faTimes} aria-hidden="true" /> 
          <span>Close</span>
        </button>
      </div>
    </>
  );
}

export default Header;