import { useState, useRef, useEffect, useCallback } from 'react';

export const useAuthDropdown = () => {
  const [isProfileDropdownVisible, setIsProfileDropdownVisible] = useState(false);
  const [isNotificationDropdownVisible, setIsNotificationDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);

  const closeAllDropdowns = useCallback(() => {
    setIsProfileDropdownVisible(false);
    setIsNotificationDropdownVisible(false);
  }, []);

  // Opening one dropdown always closes the other
  const toggleProfileDropdown = useCallback(() => {
    setIsNotificationDropdownVisible(false);
    setIsProfileDropdownVisible(prev => !prev);
  }, []);

  const toggleNotificationDropdown = useCallback(() => {
    setIsProfileDropdownVisible(false);
    setIsNotificationDropdownVisible(prev => !prev);
  }, []);

  const isAnyOpen = isProfileDropdownVisible || isNotificationDropdownVisible;

  // Close on outside click/tap or Escape — listeners only exist while a menu is open
  useEffect(() => {
    if (!isAnyOpen) return undefined;

    const handlePointerDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeAllDropdowns();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeAllDropdowns();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAnyOpen, closeAllDropdowns]);

  return {
    isProfileDropdownVisible,
    isNotificationDropdownVisible,
    toggleProfileDropdown,
    toggleNotificationDropdown,
    dropdownRef,
    closeAllDropdowns,
  };
};
