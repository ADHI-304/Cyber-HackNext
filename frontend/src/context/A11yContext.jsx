import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'authbuddy_a11y_prefs';

const defaultPrefs = {
  textSize: 'base', // 'sm', 'base', 'lg', 'xl'
  highContrast: false,
  voiceGuidance: false,
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

    // Apply root document classes for styling
    const root = document.documentElement;

    // Text size classes
    ['text-size-sm', 'text-size-base', 'text-size-lg', 'text-size-xl'].forEach(cls => {
      root.classList.remove(cls);
    });
    root.classList.add(`text-size-${prefs.textSize}`);

    // High contrast class
    if (prefs.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [prefs]);

  const setTextSize = (size) => {
    setPrefs(prev => ({ ...prev, textSize: size }));
  };

  const toggleHighContrast = () => {
    setPrefs(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleVoiceGuidance = () => {
    setPrefs(prev => ({ ...prev, voiceGuidance: !prev.voiceGuidance }));
  };

  const resetA11yPrefs = () => {
    setPrefs(defaultPrefs);
  };

  return (
    <A11yContext.Provider
      value={{
        prefs,
        setTextSize,
        toggleHighContrast,
        toggleVoiceGuidance,
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
