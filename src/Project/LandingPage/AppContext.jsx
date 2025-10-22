import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import data from './data.js';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // Theme state
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    // Auth state
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    // UI state
    const [isSidebarDesktopCollapsed, setIsSidebarDesktopCollapsed] = useState(false);
    const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(false);
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    
    // Notification state
    const [notifications, setNotifications] = useState(data.notifications);
    const [toast, setToast] = useState({ message: '', show: false });

    // Breakpoints
    const MOBILE_BREAKPOINT = 768;
    const TABLET_BREAKPOINT = 1024;

    // Memoized unread count
    const unreadCount = useMemo(() => 
        notifications.filter(n => n.unread).length, 
        [notifications]
    );

    // Apply theme and auth classes to body
    useEffect(() => {
        document.body.classList.toggle('dark-mode', isDarkMode);
        document.body.classList.toggle('logged-in', isLoggedIn);
        document.body.classList.toggle('logged-out', !isLoggedIn);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode, isLoggedIn]);

    // Handle window resize
    const handleResize = useCallback(() => {
        const width = window.innerWidth;
        const isMobile = width <= MOBILE_BREAKPOINT;
        const isTablet = width > MOBILE_BREAKPOINT && width <= TABLET_BREAKPOINT;

        if (isTablet) {
            setIsSidebarDesktopCollapsed(true);
        } else if (width > TABLET_BREAKPOINT) {
            setIsSidebarDesktopCollapsed(false);
        }
        
        if (!isMobile) {
            setIsMobileSidebarVisible(false);
            setIsMobileSearchOpen(false);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    // Toast notification
    const showToast = useCallback((message, duration = 3000) => {
        setToast({ message, show: true });
        setTimeout(() => setToast({ message: '', show: false }), duration);
    }, []);

    // Theme toggle
    const toggleTheme = useCallback(() => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            showToast(newMode ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
            return newMode;
        });
    }, [showToast]);

    // Sidebar toggle
    const handleSidebarToggle = useCallback(() => {
        if (window.innerWidth <= MOBILE_BREAKPOINT) {
            setIsMobileSidebarVisible(prev => !prev);
        } else {
            setIsSidebarDesktopCollapsed(prev => !prev);
        }
    }, []);

    // Login simulation
    const simulateLogin = useCallback((provider) => {
        const username = provider === 'Email' ? 'User' : `${provider} User`;
        setUser({ name: username, provider });
        setIsLoggedIn(true);
        setIsSignInModalOpen(false);
        setNotifications(data.notifications);
        showToast(`✅ Welcome, ${username}!`);
    }, [showToast]);

    // Logout simulation
    const simulateLogout = useCallback(() => {
        setUser(null);
        setIsLoggedIn(false);
        showToast('👋 Logged out successfully');
    }, [showToast]);

    // Mark all notifications as read
    const markAllNotificationsAsRead = useCallback(() => {
        const count = notifications.filter(n => n.unread).length;
        if (count > 0) {
            setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
            showToast(`✅ Marked ${count} notification${count > 1 ? 's' : ''} as read`);
        } else {
            showToast('ℹ️ No unread notifications', 2000);
        }
    }, [notifications, showToast]);

    // Mark single notification as read
    const markNotificationAsRead = useCallback((id) => {
        setNotifications(prev => {
            const notification = prev.find(n => n.id === id);
            if (notification?.unread) {
                showToast('✅ Notification marked as read');
            }
            return prev.map(n => n.id === id ? { ...n, unread: false } : n);
        });
    }, [showToast]);

    // Memoized context value
    const contextValue = useMemo(() => ({
        // State
        isDarkMode,
        isLoggedIn,
        user,
        isSidebarCollapsed: isSidebarDesktopCollapsed,
        isMobileSidebarVisible,
        isSignInModalOpen,
        isMobileSearchOpen,
        toast,
        notifications,
        unreadCount,

        // Actions
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
        isDarkMode, isLoggedIn, user, isSidebarDesktopCollapsed, isMobileSidebarVisible,
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
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
};