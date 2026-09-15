import React, { useState, useEffect } from 'react';
import { ThemeContext } from './themeContextDef';
import type { Theme } from './themeContextDef';

const THEME_CYCLE: Theme[] = ['white', 'burgundy'];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = (localStorage.getItem('youandme_theme') || localStorage.getItem('theme')) as string | null;
      if (saved === 'burgundy') return 'burgundy';
      if (saved === 'white' || saved === 'light' || saved === 'champagne') return 'white';
    }
    return 'white';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-color-scheme', theme === 'white' ? 'light' : 'dark');
    try {
      localStorage.setItem('youandme_theme', theme);
    } catch {}
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const cycleTheme = () => {
    setThemeState(prev => {
      const nextIdx = (THEME_CYCLE.indexOf(prev) + 1) % THEME_CYCLE.length;
      return THEME_CYCLE[nextIdx];
    });
  };

  const toggleTheme = () => {
    cycleTheme();
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
