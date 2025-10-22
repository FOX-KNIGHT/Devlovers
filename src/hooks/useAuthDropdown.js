// src/hooks/useAuthDropdown.js
import { useState, useRef, useEffect, useCallback } from 'react';

export const useAuthDropdown = () => {
  const [isProfileDropdownVisible, setIsProfileDropdownVisible] = useState(false);
  const [isNotificationDropdownVisible, setIsNotificationDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);

  const closeAllDropdowns = useCallback(() => {
    setIsProfileDropdownVisible(false);
    setIsNotificationDropdownVisible(false);
  }, []);

  const toggleProfileDropdown = useCallback(() => {
    // Close others before opening
    setIsNotificationDropdownVisible(false);
    setIsProfileDropdownVisible(prev => !prev);
  }, []);

  const toggleNotificationDropdown = useCallback(() => {
    // Close others before opening
    setIsProfileDropdownVisible(false);
    setIsNotificationDropdownVisible(prev => !prev);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      // Close dropdowns if click is outside the entire header-right container
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeAllDropdowns();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeAllDropdowns]);

  return {
    isProfileDropdownVisible,
    isNotificationDropdownVisible,
    toggleProfileDropdown,
    toggleNotificationDropdown,
    dropdownRef,
    closeAllDropdowns,
  };
};