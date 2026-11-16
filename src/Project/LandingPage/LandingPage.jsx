'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Flame } from 'lucide-react';
import SidebarLeft from './SidebarLeft.jsx';
import RightSidebar from './RightSidebar.jsx';
import HackathonFeed from './HackathonFeed.jsx';
import { useAppContext } from './AppContext.jsx';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

function LandingPage({ setCurrentPage }) {
    const {
        isSidebarCollapsed,
        isMobileSidebarVisible,
        handleSidebarToggle,
        setIsSignInModalOpen,
        showToast
    } = useAppContext();

    const isMobile = useMediaQuery('(max-width: 768px)');
    const isTablet = useMediaQuery('(max-width: 1024px)');

    const [activeHackathon, setActiveHackathon] = useState({
        id: 1,
        name: 'Hackathon Alpha',
        status: 'Active'
    });
    const [filter, setFilter] = useState('all');

    // Memoize filter buttons configuration
    const filterButtons = useMemo(() => [
        { label: 'All Sprints', value: 'all' },
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Remote Only', value: 'remote' },
        { label: 'High Bounty ($25k+)', value: 'prize' }
    ], []);

    // Handle filter change
    const handleFilterChange = useCallback((filterValue, filterName) => {
        setFilter(filterValue);
        showToast(`📊 Filter: ${filterName}`);
    }, [showToast]);

    // Handle hackathon change
    const handleHackathonChange = useCallback((hackathon) => {
        setActiveHackathon(hackathon);
        showToast(`📌 Channel: ${hackathon.name}`);
    }, [showToast]);

    return (
        <div className="flex flex-1 overflow-hidden relative">
            <SidebarLeft
                isMobileVisible={isMobileSidebarVisible}
                isCollapsed={isSidebarCollapsed}
                handleSidebarToggle={handleSidebarToggle}
                activeHackathon={activeHackathon}
                setActiveHackathon={handleHackathonChange}
                showToast={showToast}
            />

            <main className="main-content flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-5xl space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 m-0 p-0 border-none">
                                <Flame className="h-6 w-6 text-amber-400" aria-hidden="true" />
                                Discover Global Hackathons
                                <span className="hud-tag text-[10px]">LIVE GLOBAL FEED</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                High-stakes developer sprints with commit verification and fair judging.
                            </p>
                        </div>
                    </div>

                    <div className="filter-buttons flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar" role="group" aria-label="Filter hackathons">
                        {filterButtons.map(({ label, value }) => {
                            const isActive = filter === value;
                            return (
                                <button
                                    key={value}
                                    className={`filter-btn relative px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wide transition-all ${
                                        isActive
                                            ? 'active text-cyan-300 font-semibold border border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,245,255,0.15)]'
                                            : 'text-slate-400 hover:text-white bg-[#0C0F1D]/80 border border-white/5 hover:border-white/10'
                                    }`}
                                    data-filter={value}
                                    onClick={() => handleFilterChange(value, label)}
                                    aria-pressed={isActive}
                                    aria-label={`Filter by ${label}`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    <HackathonFeed
                        currentFilter={filter}
                        activeHackathon={activeHackathon}
                        showToast={showToast}
                        showSignInModal={() => setIsSignInModalOpen(true)}
                    />
                </div>
            </main>

            <RightSidebar />
        </div>
    );
}

export default LandingPage;
