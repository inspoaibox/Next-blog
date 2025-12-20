import { getPublicSettings, getActiveTheme } from '@/lib/api-server';
import { BlogLayoutWrapper } from './layout-wrapper';

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, theme] = await Promise.all([
    getPublicSettings(),
    getActiveTheme(),
  ]);

  return (
    <BlogLayoutWrapper 
      settings={settings || {}} 
      theme={theme?.name || 'classic'}
      themeConfig={theme?.config ? JSON.parse(theme.config) : {}}
    >
      {children}
    </BlogLayoutWrapper>
  );
}
