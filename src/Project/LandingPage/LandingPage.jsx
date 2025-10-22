// src/Project/LandingPage/LandingPage.jsx
import React, { useState } from 'react';
import SidebarLeft from './SidebarLeft.jsx'; // Sibling file
import RightSidebar from './RightSidebar.jsx'; // Sibling file
import HackathonFeed from './HackathonFeed.jsx';
import { useAppContext } from './AppContext.jsx'; // Sibling file

function LandingPage({ setCurrentPage }) {
    const { 
        isSidebarCollapsed, 
        isMobileSidebarVisible, 
        handleSidebarToggle, 
        setIsSignInModalOpen, 
        showToast 
    } = useAppContext();

    const [activeHackathon, setActiveHackathon] = useState({ id: 1, name: 'Hackathon Alpha', status: 'Active' });
    const [filter, setFilter] = useState('all');

    let sidebarToggleIconClass = 'fa-angle-left';
    if (window.innerWidth <= 768) {
        sidebarToggleIconClass = isMobileSidebarVisible ? 'fas fa-times' : 'fas fa-bars';
    } else if (window.innerWidth <= 1024) {
        sidebarToggleIconClass = 'fa-angle-right';
    } else {
        sidebarToggleIconClass = isSidebarCollapsed ? 'fas fa-angle-right' : 'fas fa-angle-left';
    }

    const showSignInModal = () => setIsSignInModalOpen(true);


    return (
        <>
            <SidebarLeft
                isMobileVisible={isMobileSidebarVisible}
                isCollapsed={isSidebarCollapsed}
                handleSidebarToggle={handleSidebarToggle}
                sidebarToggleIconClass={sidebarToggleIconClass}
                activeHackathon={activeHackathon}
                setActiveHackathon={setActiveHackathon}
                showToast={showToast}
            />
            
            <main className="main-content">
                <h2><i className="fas fa-fire"></i> Discover New Hackathons</h2>

                <div className="filter-buttons">
                    {['All', 'Upcoming', 'Ongoing', 'Remote', 'High Prize Pool'].map(name => {
                        const value = name.toLowerCase().replace(/\s/g, '');
                        const filterValue = value === 'highprizepool' ? 'prize' : value;
                        const isActive = filter === filterValue;
                        return (
                            <button
                                key={value}
                                className={`filter-btn ${isActive ? 'active' : ''}`}
                                data-filter={filterValue}
                                onClick={() => {
                                    setFilter(filterValue);
                                    showToast(`Showing: ${name}`);
                                }}
                            >
                                {name}
                            </button>
                        );
                    })}
                </div>

                <HackathonFeed currentFilter={filter} showSignInModal={showSignInModal} />
            </main>

            <RightSidebar />
        </>
    );
}

export default LandingPage;