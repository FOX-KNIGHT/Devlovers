'use client';

import { useState, useCallback, useMemo } from 'react';
import Header from './Project/LandingPage/Header.jsx';
import SubNav from './Project/LandingPage/SubNav.jsx';
import LandingPage from './Project/LandingPage/LandingPage.jsx';
import SignInModal from './Project/LandingPage/SignInModal.jsx';
import { AppProvider, useAppContext } from './Project/LandingPage/AppContext.jsx';
import { DevloversCommunity } from './components/DevloversCommunity.jsx';
import { AboutView } from './components/AboutView.jsx';
import { LeaderboardView } from './components/LeaderboardView.jsx';
import { MobileDrawer } from './components/MobileDrawer.jsx';
import data from './Project/LandingPage/data.js';

const AppContent = () => {
  const {
    isMobileSidebarVisible,
    setIsMobileSidebarVisible,
    activeHackathon,
    setActiveHackathon,
    isSignInModalOpen,
    simulateLogin,
    setIsSignInModalOpen,
  } = useAppContext();

  const [currentPage, setCurrentPage] = useState('Hackathon');

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const content = useMemo(() => {
    switch (currentPage) {
      case 'Hackathon':
        return <LandingPage setCurrentPage={handlePageChange} />;
      case 'Leaderboard':
        return (
          <div className="main-content flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-5xl">
              <LeaderboardView />
            </div>
          </div>
        );
      case 'Devlovers':
        return (
          <div className="main-content flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-5xl">
              <DevloversCommunity />
            </div>
          </div>
        );
      case 'About':
        return (
          <div className="main-content flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-5xl">
              <AboutView />
            </div>
          </div>
        );
      default:
        return (
          <div className="main-content flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-xl font-bold text-white mb-2">{currentPage}</h2>
              <p className="text-xs text-slate-400">Content for {currentPage} will be available soon.</p>
            </div>
          </div>
        );
    }
  }, [currentPage, handlePageChange]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-void)] text-[hsl(var(--foreground))]">
      <Header setCurrentPage={handlePageChange} />
      <SubNav currentPage={currentPage} setCurrentPage={handlePageChange} />
      <div className="flex flex-1 overflow-hidden" id="page-layout">
        {content}
      </div>
      <SignInModal
        isVisible={isSignInModalOpen}
        hideModal={() => setIsSignInModalOpen(false)}
        onLogin={simulateLogin}
      />
      <MobileDrawer
        open={isMobileSidebarVisible}
        onOpenChange={setIsMobileSidebarVisible}
        hackathons={data.hackathons}
        activeHackathon={activeHackathon}
        onSelectHackathon={(h) => {
          setActiveHackathon(h);
          handlePageChange('Hackathon');
        }}
        trending={data.trending}
        currentPage={currentPage}
        onSelectPage={handlePageChange}
      />
    </div>
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