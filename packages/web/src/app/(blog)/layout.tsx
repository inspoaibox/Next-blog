import { getPublicSettings, getActiveTheme, getPublicStats } from '@/lib/api-server';
import { BlogLayoutWrapper } from './layout-wrapper';

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, theme, stats] = await Promise.all([
    getPublicSettings(),
    getActiveTheme(),
    getPublicStats(),
  ]);

  return (
    <BlogLayoutWrapper 
      settings={settings || {}} 
      theme={theme?.name || 'classic'}
      themeConfig={theme?.config ? JSON.parse(theme.config) : {}}
      stats={stats || undefined}
    >
      {children}
    </BlogLayoutWrapper>
  );
}
