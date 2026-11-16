'use client';

import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import data from './data.js';
import { useTheme } from 'next-themes';
import { toast as sonnerToast } from 'sonner';
import { updateAppBadge, clearAppBadge } from '@/lib/pwa/badge';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const { theme, setTheme } = useTheme();

    // Default to true (dark-first) without reading localStorage in the initializer
    const [isDarkMode, setIsDarkMode] = useState(true);

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
    const [toastState, setToastState] = useState({ message: '', show: false });

    // Active Hackathon Channel
    const [activeHackathon, setActiveHackathonState] = useState(data.hackathons[0]);
    const [activeSort, setActiveSortState] = useState('Newest');

    // Global Internationalization & Preferences
    const [currency, setCurrencyState] = useState('USD');
    const [useUTC, setUseUTC] = useState(false);

    // Sync saved preferences from localStorage safely in effect
    useEffect(() => {
        const savedCurrency = localStorage.getItem('devlovers_currency');
        if (savedCurrency) setCurrencyState(savedCurrency);
        const savedUTC = localStorage.getItem('devlovers_utc');
        if (savedUTC) setUseUTC(savedUTC === 'true');
    }, []);

    const setCurrency = useCallback((cur) => {
        setCurrencyState(cur);
        localStorage.setItem('devlovers_currency', cur);
        sonnerToast(`Currency display set to ${cur}`);
    }, []);

    const toggleUTC = useCallback(() => {
        setUseUTC(prev => {
            const next = !prev;
            localStorage.setItem('devlovers_utc', String(next));
            sonnerToast(next ? 'Timezone set to UTC' : 'Timezone set to Local Browser Time');
            return next;
        });
    }, []);

    // Breakpoints
    const MOBILE_BREAKPOINT = 768;
    const TABLET_BREAKPOINT = 1024;

    // Sync theme safely on mount
    useEffect(() => {
        if (theme) {
            setIsDarkMode(theme === 'dark');
        } else {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                setIsDarkMode(savedTheme === 'dark');
            }
        }
    }, [theme]);

    // Memoized unread count
    const unreadCount = useMemo(() =>
        notifications.filter(n => n.unread).length,
        [notifications]
    );

    // Sync native PWA badge
    useEffect(() => {
        if (unreadCount > 0) {
            updateAppBadge(unreadCount);
        } else {
            clearAppBadge();
        }
    }, [unreadCount]);

    // Apply classes to body
    useEffect(() => {
        document.body.classList.toggle('dark-mode', isDarkMode);
        document.body.classList.toggle('logged-in', isLoggedIn);
        document.body.classList.toggle('logged-out', !isLoggedIn);
    }, [isDarkMode, isLoggedIn]);

    // Safe resize handler
    const handleResize = useCallback(() => {
        if (typeof window === 'undefined') return;
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
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    // Toast notification with Sonner
    const showToast = useCallback((message, duration = 3000) => {
        setToastState({ message, show: true });
        sonnerToast(message, { duration });
        setTimeout(() => setToastState({ message: '', show: false }), duration);
    }, []);

    // Theme toggle
    const toggleTheme = useCallback(() => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            const themeName = newMode ? 'dark' : 'light';
            if (setTheme) setTheme(themeName);
            localStorage.setItem('theme', themeName);
            showToast(newMode ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
            return newMode;
        });
    }, [setTheme, showToast]);

    // Sidebar toggle
    const handleSidebarToggle = useCallback(() => {
        if (typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT) {
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

    // Hackathon channel selection
    const selectHackathon = useCallback((hackathon) => {
        setActiveHackathonState(hackathon);
        showToast(`📌 Sprint Channel: ${hackathon.name}`);
    }, [showToast]);

    // Memoized context value
    const contextValue = useMemo(() => ({
        isDarkMode,
        isLoggedIn,
        user,
        isSidebarCollapsed: isSidebarDesktopCollapsed,
        isMobileSidebarVisible,
        setIsMobileSidebarVisible,
        activeHackathon,
        setActiveHackathon: selectHackathon,
        activeSort,
        setActiveSort: setActiveSortState,
        isSignInModalOpen,
        isMobileSearchOpen,
        toast: toastState,
        notifications,
        unreadCount,

        currency,
        setCurrency,
        useUTC,
        toggleUTC,

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
        setIsMobileSidebarVisible, activeHackathon, selectHackathon, activeSort,
        isSignInModalOpen, isMobileSearchOpen, toastState, notifications, unreadCount,
        currency, setCurrency, useUTC, toggleUTC,
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
