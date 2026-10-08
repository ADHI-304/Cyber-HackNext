import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { t as i18nT, languages, speechVoiceMap } from '../i18n';

const STORAGE_KEY = 'authbuddy_a11y_prefs';

const defaultPrefs = {
  textSize: 'base', // 'sm', 'base', 'lg', 'xl'
  highContrast: false,
  voiceGuidance: false,
  language: 'en', // Default language: English
};

export const A11yContext = createContext(null);

export function A11yProvider({ children }) {
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...defaultPrefs, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Failed to load a11y preferences from localStorage', e);
    }
    return defaultPrefs;
  });

  // Save to localStorage whenever preferences change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Failed to save a11y preferences to localStorage', e);
    }

    const root = document.documentElement;

    ['text-size-sm', 'text-size-base', 'text-size-lg', 'text-size-xl'].forEach(cls => {
      root.classList.remove(cls);
    });
    root.classList.add(`text-size-${prefs.textSize}`);

    if (prefs.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    root.setAttribute('lang', prefs.language || 'en');
  }, [prefs]);

  const setTextSize = (size) => setPrefs(prev => ({ ...prev, textSize: size }));
  const toggleHighContrast = () => setPrefs(prev => ({ ...prev, highContrast: !prev.highContrast }));
  const toggleVoiceGuidance = () => setPrefs(prev => ({ ...prev, voiceGuidance: !prev.voiceGuidance }));
  const setLanguage = (lang) => setPrefs(prev => ({ ...prev, language: lang }));
  const resetA11yPrefs = () => setPrefs(defaultPrefs);

  const translate = useCallback((key, params) => {
    return i18nT(prefs.language || 'en', key, params);
  }, [prefs.language]);

  const voiceCode = speechVoiceMap[prefs.language] || 'en-IN';

  return (
    <A11yContext.Provider
      value={{
        prefs,
        language: prefs.language || 'en',
        languages,
        voiceCode,
        t: translate,
        setTextSize,
        toggleHighContrast,
        toggleVoiceGuidance,
        setLanguage,
        resetA11yPrefs,
      }}
    >
      {children}
    </A11yContext.Provider>
  );
}

export function useA11yPrefs() {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11yPrefs must be used within an A11yProvider');
  }
  return context;
}
