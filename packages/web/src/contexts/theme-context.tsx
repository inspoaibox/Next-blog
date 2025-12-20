'use client';

import { createContext, useContext, ReactNode } from 'react';
import { getTheme, type ThemeConfig } from '@/themes';

interface ThemeContextValue {
  themeName: string;
  themeConfig: ThemeConfig;
  theme: ReturnType<typeof getTheme>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  themeName: string;
  themeConfig: ThemeConfig;
}

export function ThemeProvider({ children, themeName, themeConfig }: ThemeProviderProps) {
  const theme = getTheme(themeName);
  const mergedConfig = { ...theme.defaultConfig, ...themeConfig };

  return (
    <ThemeContext.Provider value={{ themeName, themeConfig: mergedConfig, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    // 如果没有 Provider，返回默认主题
    const theme = getTheme('classic');
    return {
      themeName: 'classic',
      themeConfig: theme.defaultConfig,
      theme,
    };
  }
  return context;
}
