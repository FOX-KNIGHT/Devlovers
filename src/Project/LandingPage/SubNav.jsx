// src/Project/LandingPage/SubNav.jsx
import React, { useState } from 'react';

function SubNav({ setCurrentPage }) {
    // Initialize active tab based on the desired default view (Hackathons/Hackathon page)
    const [activeTab, setActiveTab] = useState('Hackathons');

    const navItems = [
        { label: 'Hackathons', icon: 'fas fa-laptop-code', pageName: 'Hackathon' },
        { label: 'Devlovers', icon: 'fas fa-users', pageName: 'Devlovers' },
        { label: 'About', icon: 'fas fa-info-circle', pageName: 'About' },
    ];

    const handleNavClick = (item) => {
        // 1. Update local state to set the 'active' class
        setActiveTab(item.label);
        // 2. Notify parent component to change the main page content
        setCurrentPage(item.pageName);
    };

    return (
        <div className="sub-nav-bar">
            <div className="menu">
                {navItems.map(item => (
                    <a
                        key={item.label}
                        // Use the 'active' class for the blue highlight
                        className={`menu-list ${activeTab === item.label ? 'active' : ''}`}
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleNavClick(item); }}
                    >
                        <i className={item.icon}></i>
                        <span className="menu-label">{item.label}</span>
                    </a>
                ))}
            </div>
        </div>
    );
}

export default SubNav;