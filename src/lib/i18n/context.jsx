'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './dictionaries/en.json';
import es from './dictionaries/es.json';
import ja from './dictionaries/ja.json';

const dictionaries = { en, es, ja };

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('preferred_locale');
    if (saved && dictionaries[saved]) {
      setLocale(saved);
    }
  }, []);

  const changeLocale = (newLocale) => {
    if (dictionaries[newLocale]) {
      setLocale(newLocale);
      localStorage.setItem('preferred_locale', newLocale);
      document.documentElement.lang = newLocale;
      document.documentElement.dir = newLocale === 'ar' || newLocale === 'he' ? 'rtl' : 'ltr';
    }
  };

  const t = (path) => {
    const keys = path.split('.');
    let val = dictionaries[locale];
    for (const key of keys) {
      val = val?.[key];
    }
    if (val !== undefined) return val;

    // Fallback to English
    let fallback = dictionaries.en;
    for (const key of keys) {
      fallback = fallback?.[key];
    }
    return fallback !== undefined ? fallback : path;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: changeLocale, t, availableLocales: ['en', 'es', 'ja'] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
