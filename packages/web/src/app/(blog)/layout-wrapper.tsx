'use client';

import { useEffect } from 'react';
import { useSiteSettingsStore } from '@/stores/site-settings.store';
import { useBlogThemeStore } from '@/stores/blog-theme.store';
import { getTheme } from '@/themes';
import { ThemeProvider } from '@/contexts/theme-context';
import { SiteSettingsProvider } from '@/contexts/site-settings-context';

interface BlogLayoutWrapperProps {
  children: React.ReactNode;
  settings: Record<string, string>;
  theme: string;
  themeConfig: Record<string, any>;
}

export function BlogLayoutWrapper({ 
  children, 
  settings, 
  theme,
  themeConfig,
}: BlogLayoutWrapperProps) {
  const { setSettings } = useSiteSettingsStore();
  const { setTheme, setConfig, setHydrated } = useBlogThemeStore();

  useEffect(() => {
    setSettings(settings);
    setTheme(theme);
    setConfig(themeConfig);
    setHydrated();
  }, [settings, theme, themeConfig, setSettings, setTheme, setConfig, setHydrated]);

  // 始终使用服务器传来的主题，确保 SSR 和客户端一致
  const themeComponents = getTheme(theme);
  const { BlogLayout } = themeComponents;

  return (
    <SiteSettingsProvider settings={settings}>
      <ThemeProvider themeName={theme} themeConfig={themeConfig}>
        <BlogLayout config={themeConfig}>{children}</BlogLayout>
      </ThemeProvider>
    </SiteSettingsProvider>
  );
}
