import React, { useState, useCallback, useMemo } from 'react';
import SidebarLeft from './SidebarLeft.jsx';
import RightSidebar from './RightSidebar.jsx';
import HackathonFeed from './HackathonFeed.jsx';
import { useAppContext } from './AppContext.jsx';

function LandingPage({ setCurrentPage }) {
    const { 
        isSidebarCollapsed, 
        isMobileSidebarVisible, 
        handleSidebarToggle, 
        setIsSignInModalOpen, 
        showToast 
    } = useAppContext();

    const [activeHackathon, setActiveHackathon] = useState({ 
        id: 1, 
        name: 'Hackathon Alpha', 
        status: 'Active' 
    });
    const [filter, setFilter] = useState('all');

    // Memoize filter buttons configuration
    const filterButtons = useMemo(() => [
        { label: 'All', value: 'all' },
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Remote', value: 'remote' },
        { label: 'High Prize Pool', value: 'prize' }
    ], []);

    // Determine sidebar toggle icon based on viewport and state
    const sidebarToggleIconClass = useMemo(() => {
        if (typeof window === 'undefined') return 'fas fa-bars';
        
        const width = window.innerWidth;
        if (width <= 768) {
            return isMobileSidebarVisible ? 'fas fa-times' : 'fas fa-bars';
        } else if (width <= 1024) {
            return 'fas fa-angle-right';
        } else {
            return isSidebarCollapsed ? 'fas fa-angle-right' : 'fas fa-angle-left';
        }
    }, [isSidebarCollapsed, isMobileSidebarVisible]);

    // Handle sign-in modal
    const showSignInModal = useCallback(() => {
        setIsSignInModalOpen(true);
    }, [setIsSignInModalOpen]);

    // Handle filter change
    const handleFilterChange = useCallback((filterValue, filterName) => {
        setFilter(filterValue);
        showToast(`📊 Showing: ${filterName}`);
    }, [showToast]);

    // Handle hackathon change
    const handleHackathonChange = useCallback((hackathon) => {
        setActiveHackathon(hackathon);
        showToast(`📌 Switched to: ${hackathon.name}`);
    }, [showToast]);

    return (
        <>
            <SidebarLeft
                isMobileVisible={isMobileSidebarVisible}
                isCollapsed={isSidebarCollapsed}
                handleSidebarToggle={handleSidebarToggle}
                sidebarToggleIconClass={sidebarToggleIconClass}
                activeHackathon={activeHackathon}
                setActiveHackathon={handleHackathonChange}
                showToast={showToast}
            />
            
            <main className="main-content">
                <h2>
                    <i className="fas fa-fire" aria-hidden="true"></i> 
                    Discover New Hackathons
                </h2>

                <div className="filter-buttons" role="group" aria-label="Filter hackathons">
                    {filterButtons.map(({ label, value }) => {
                        const isActive = filter === value;
                        return (
                            <button
                                key={value}
                                className={`filter-btn ${isActive ? 'active' : ''}`}
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
                    showSignInModal={showSignInModal} 
                />
            </main>

            <RightSidebar />
        </>
    );
}

export default React.memo(LandingPage);