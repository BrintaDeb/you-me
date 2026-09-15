import { useContext } from 'react';
import { ThemeContext } from './themeContextDef';
import type { ThemeContextType, Theme } from './themeContextDef';

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export type { Theme, ThemeContextType };
