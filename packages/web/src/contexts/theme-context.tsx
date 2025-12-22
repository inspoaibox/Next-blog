'use client';

import { createContext, useContext, ReactNode } from 'react';
import { getTheme, type ThemeConfig } from '@/themes';
import { 
  type ColorScheme, 
  defaultColorScheme, 
  builtinColorSchemes,
  chromaDimensionPalettes,
  magazineColorSchemes,
} from '@/themes/shared';

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

/**
 * 获取当前主题的配色方案
 * 
 * 优先使用主题提供的 getColorScheme 方法，
 * 否则使用内置的配色方案映射。
 * 
 * @example
 * ```tsx
 * function FriendsPage() {
 *   const colors = useThemeColorScheme();
 *   return (
 *     <div className={`bg-gradient-to-r ${colors.gradient}`}>
 *       <span className={colors.accentText}>Hello</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useThemeColorScheme(): ColorScheme {
  const { themeName, themeConfig, theme } = useThemeContext();
  
  // 1. 优先使用主题提供的 getColorScheme 方法
  if (theme.getColorScheme) {
    return theme.getColorScheme(themeConfig);
  }
  
  // 2. 特殊处理 magazine 主题的配色方案
  if (themeName === 'magazine') {
    const colorScheme = (themeConfig?.colorScheme as string) || 'purple';
    return magazineColorSchemes[colorScheme] || magazineColorSchemes.purple;
  }
  
  // 3. 特殊处理 chroma-dimension 主题的 vibeMode
  if (themeName === 'chroma-dimension') {
    const vibeMode = (themeConfig?.vibeMode as string) || 'electric-candy';
    return chromaDimensionPalettes[vibeMode] || chromaDimensionPalettes['electric-candy'];
  }
  
  // 4. 使用内置配色方案映射
  return builtinColorSchemes[themeName] || defaultColorScheme;
}
