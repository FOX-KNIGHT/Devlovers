// src/Project/LandingPage/AppContext.jsx
import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import data from './data.js'; // Correct path: ./data.js (same directory)

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSidebarDesktopCollapsed, setIsSidebarDesktopCollapsed] = useState(false); 
    const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(false);
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [toast, setToast] = useState({ message: '', show: false });
    const [notifications, setNotifications] = useState(data.notifications); 

    const unreadCount = useMemo(() => notifications.filter(n => n.unread).length, [notifications]);

    useEffect(() => {
        document.body.classList.toggle('dark-mode', isDarkMode);
        document.body.classList.toggle('logged-in', isLoggedIn);
        document.body.classList.toggle('logged-out', !isLoggedIn);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode, isLoggedIn]);

    const MOBILE_BREAKPOINT = 768;
    const TABLET_BREAKPOINT = 1024;

    const handleResize = useCallback(() => {
        const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
        const isTablet = window.innerWidth > MOBILE_BREAKPOINT && window.innerWidth <= TABLET_BREAKPOINT;

        if (isTablet) {
            setIsSidebarDesktopCollapsed(true);
        } else if (window.innerWidth > TABLET_BREAKPOINT) {
            setIsSidebarDesktopCollapsed(false);
        }
        
        if (!isMobile) {
            setIsMobileSidebarVisible(false);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);


    const showToast = useCallback((message, duration = 3000) => {
        setToast({ message, show: true });
        setTimeout(() => setToast({ message: '', show: false }), duration);
    }, []);

    const toggleTheme = useCallback(() => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            showToast(newMode ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
            return newMode;
        });
    }, [showToast]);

    const handleSidebarToggle = useCallback(() => {
        if (window.innerWidth <= MOBILE_BREAKPOINT) {
            setIsMobileSidebarVisible(prev => !prev);
        } else {
            setIsSidebarDesktopCollapsed(prev => !prev);
        }
    }, [MOBILE_BREAKPOINT]);

    const simulateLogin = useCallback((provider) => {
        setIsLoggedIn(true);
        setIsSignInModalOpen(false);
        setNotifications(data.notifications);
        showToast(`✅ Signed in with ${provider}!`);
    }, [showToast]);

    const simulateLogout = useCallback(() => {
        setIsLoggedIn(false);
        showToast('👋 Logged out successfully');
    }, [showToast]);

    const markAllNotificationsAsRead = useCallback(() => {
        const count = notifications.filter(n => n.unread).length;
        if (count > 0) {
            const newNotifications = notifications.map(n => ({ ...n, unread: false }));
            setNotifications(newNotifications);
            showToast(`Marked ${count} notifications as read.`);
        } else {
            showToast('No unread notifications.', 2000);
        }
    }, [notifications, showToast]);

    const markNotificationAsRead = useCallback((id) => {
        setNotifications(prevNotifications => {
            const notificationToMark = prevNotifications.find(n => n.id === id);
            if (notificationToMark && notificationToMark.unread) {
                showToast('Notification marked as read.');
            }
            return prevNotifications.map(n =>
                n.id === id ? { ...n, unread: false } : n
            );
        });
    }, [showToast]);
    
    const contextValue = useMemo(() => ({
        isDarkMode,
        isLoggedIn,
        isSidebarCollapsed: isSidebarDesktopCollapsed,
        isMobileSidebarVisible,
        isSignInModalOpen,
        isMobileSearchOpen,
        toast,
        notifications,
        unreadCount,

        toggleTheme,
        handleSidebarToggle,
        setIsSignInModalOpen,
        setIsMobileSearchOpen,
        simulateLogin,
        simulateLogout,
        showToast,
        markAllNotificationsAsRead,
        markNotificationAsRead,
    }), [
        isDarkMode, isLoggedIn, isSidebarDesktopCollapsed, isMobileSidebarVisible,
        isSignInModalOpen, isMobileSearchOpen, toast, notifications, unreadCount,
        toggleTheme, handleSidebarToggle, simulateLogin, simulateLogout, showToast,
        markAllNotificationsAsRead, markNotificationAsRead
    ]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    return useContext(AppContext);
};