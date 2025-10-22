import React, { useState, useCallback, useMemo } from 'react';

function SubNav({ setCurrentPage }) {
    const [activeTab, setActiveTab] = useState('Hackathons');

    const navItems = useMemo(() => [
        { label: 'Hackathons', icon: 'fas fa-laptop-code', pageName: 'Hackathon' },
        { label: 'Devlovers', icon: 'fas fa-users', pageName: 'Devlovers' },
        { label: 'About', icon: 'fas fa-info-circle', pageName: 'About' },
    ], []);

    const handleNavClick = useCallback((item) => {
        setActiveTab(item.label);
        setCurrentPage(item.pageName);
    }, [setCurrentPage]);

    const handleKeyPress = useCallback((e, item) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNavClick(item);
        }
    }, [handleNavClick]);

    return (
        <div className="sub-nav-bar" role="navigation" aria-label="Main navigation">
            <div className="menu">
                {navItems.map(item => (
                    <a
                        key={item.label}
                        className={`menu-list ${activeTab === item.label ? 'active' : ''}`}
                        href="#"
                        onClick={(e) => { 
                            e.preventDefault(); 
                            handleNavClick(item); 
                        }}
                        onKeyPress={(e) => handleKeyPress(e, item)}
                        role="tab"
                        aria-selected={activeTab === item.label}
                        tabIndex={0}
                    >
                        <i className={item.icon} aria-hidden="true"></i>
                        <span className="menu-label">{item.label}</span>
                    </a>
                ))}
            </div>
        </div>
    );
}

export default React.memo(SubNav);