import React, { useState, useCallback, useMemo } from 'react';
import './App.css';

import Header from './Project/LandingPage/Header.jsx'; 
import SubNav from './Project/LandingPage/SubNav.jsx'; 
import LandingPage from './Project/LandingPage/LandingPage.jsx';
import SignInModal from './Project/LandingPage/SignInModal.jsx'; 
import Toast from './Project/LandingPage/Toast.jsx'; 
import { AppProvider, useAppContext } from './Project/LandingPage/AppContext.jsx';

const AppContent = () => {
  const {
    isSidebarCollapsed,
    isMobileSidebarVisible,
    isSignInModalOpen,
    toast,
    simulateLogin,
    setIsSignInModalOpen,
  } = useAppContext();

  const [currentPage, setCurrentPage] = useState('Hackathon');

  // Memoize page change handler
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Memoize content based on current page
  const content = useMemo(() => {
    switch (currentPage) {
      case 'Hackathon':
        return <LandingPage setCurrentPage={handlePageChange} />;
      
      case 'Devlovers':
        return (
          <div className="main-content">
            <h2><i className="fas fa-users"></i> Devlovers Community</h2>
            <p>Connect with other developers and collaborate on exciting projects.</p>
            <div className="community-stats">
              <div className="stat-card">
                <i className="fas fa-users"></i>
                <h3>10,000+</h3>
                <p>Active Developers</p>
              </div>
              <div className="stat-card">
                <i className="fas fa-project-diagram"></i>
                <h3>5,000+</h3>
                <p>Projects Created</p>
              </div>
              <div className="stat-card">
                <i className="fas fa-trophy"></i>
                <h3>500+</h3>
                <p>Hackathons Hosted</p>
              </div>
            </div>
          </div>
        );
      
      case 'About':
        return (
          <div className="main-content">
            <h2><i className="fas fa-info-circle"></i> About Devlovers</h2>
            <p>Devlovers is a platform dedicated to bringing together passionate developers, innovative projects, and exciting hackathons.</p>
            <div className="about-section">
              <h3>Our Mission</h3>
              <p>To foster a global community of developers who collaborate, innovate, and create impactful solutions through hackathons and open-source projects.</p>
              
              <h3>What We Offer</h3>
              <ul>
                <li>🚀 Access to global hackathons and competitions</li>
                <li>🤝 Connect with like-minded developers</li>
                <li>💡 Showcase your projects and gain recognition</li>
                <li>🏆 Win prizes and opportunities</li>
                <li>📚 Learn from industry experts and mentors</li>
              </ul>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="main-content">
            <h2><i className="fas fa-user-tie"></i> {currentPage}</h2>
            <p>Content for {currentPage} will be available soon.</p>
          </div>
        );
    }
  }, [currentPage, handlePageChange]);

  // Memoize main container classes
  const mainContainerClass = useMemo(() => {
    const classes = ['main-container'];
    if (isSidebarCollapsed) classes.push('sidebar-collapsed');
    if (isMobileSidebarVisible) classes.push('mobile-sidebar-open');
    return classes.join(' ');
  }, [isSidebarCollapsed, isMobileSidebarVisible]);

  return (
    <>
      <Header setCurrentPage={handlePageChange} />
      <SubNav setCurrentPage={handlePageChange} />
      <div className={mainContainerClass} id="page-layout">
        {content}
      </div>
      <SignInModal
        isVisible={isSignInModalOpen}
        hideModal={() => setIsSignInModalOpen(false)}
        onLogin={simulateLogin}
      />
      <Toast message={toast.message} isVisible={toast.show} />
    </>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;