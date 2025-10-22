import React, { useState } from 'react';
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

  let content;
  if (currentPage === 'Hackathon') {
    content = <LandingPage setCurrentPage={setCurrentPage} />;
  } else if (currentPage === 'Devlovers') {
    content = (
      <div className="main-content">
        <h2><i className="fas fa-users"></i> Devlovers Community</h2>
        <p>Connect with other developers and collaborate on projects.</p>
      </div>
    );
  } else if (currentPage === 'About') {
    content = (
      <div className="main-content">
        <h2><i className="fas fa-info-circle"></i> About Devlovers</h2>
        <p>Find out more about our mission to bring hackers and projects together.</p>
      </div>
    );
  } else {
    content = (
      <div className="main-content">
        <h2><i className="fas fa-user-tie"></i> {currentPage}</h2>
        <p>Content for {currentPage} will go here.</p>
      </div>
    );
  }

  const mainContainerClass = `main-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobileSidebarVisible ? 'mobile-sidebar-open' : ''}`;

  return (
    <>
      <Header setCurrentPage={setCurrentPage} />
      <SubNav setCurrentPage={setCurrentPage} />
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