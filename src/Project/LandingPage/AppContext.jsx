import React, { createContext, useState, useContext, useCallback } from 'react';

const AppContext = createContext();

const initialNotifications = [
    { id: 1, message: 'New hackathon "CodeFest" has been announced!', time: '15m ago', unread: true, icon: 'fas fa-trophy' },
    { id: 2, message: 'Your project "DevLink" has a new team member.', time: '1h ago', unread: true, icon: 'fas fa-user-plus' },
    { id: 3, message: 'Reminder: "Global Hack Week" starts tomorrow.', time: '6h ago', unread: true, icon: 'fas fa-calendar-alt' },
    { id: 4, message: 'You have been invited to join "Project X".', time: '1d ago', unread: false, icon: 'fas fa-envelope' },
    { id: 5, message: 'Welcome to Devlovers! Complete your profile.', time: '2d ago', unread: false, icon: 'fas fa-handshake' },
];


export const AppProvider = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const simulateLogin = (username) => {
    setUser({ name: username });
    setIsSignInModalOpen(false);
    showToast(`Welcome, ${username}!`);
  };

  const simulateLogout = () => {
    setUser(null);
    showToast('You have been logged out.');
  };

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const handleSidebarToggle = useCallback(() => {
    const isMobileView = window.innerWidth <= 768;
    if (isMobileView) {
      setIsMobileSidebarVisible(prev => !prev);
    } else {
      setIsSidebarCollapsed(prev => !prev);
    }
  }, []);


  const value = {
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileSidebarVisible,
    setIsMobileSidebarVisible,
    isSignInModalOpen,
    setIsSignInModalOpen,
    toast,
    setToast,
    showToast,
    user,
    simulateLogin,
    isLoggedIn: !!user,
    isDarkMode,
    toggleTheme,
    handleSidebarToggle,
    simulateLogout,
    isMobileSearchOpen,
    setIsMobileSearchOpen,
    notifications,
    unreadCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};