import React, { createContext, useContext, useState, useEffect } from 'react';

import { triggerHaptic } from '../utils/haptics';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Section 2.2 Mode switching: default follow system theme
  const getSystemTheme = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ecobridge_theme') || localStorage.getItem('kabadiwala_theme');
    return saved || getSystemTheme();
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ecobridge_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    triggerHaptic('light');
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
