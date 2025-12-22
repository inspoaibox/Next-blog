import { getPublicSettings, getActiveTheme, getPublicStats, getTags, getArticles } from '@/lib/api-server';
import { BlogLayoutWrapper } from './layout-wrapper';

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, theme, stats, tags, recentArticlesData] = await Promise.all([
    getPublicSettings(),
    getActiveTheme(),
    getPublicStats(),
    getTags(),
    getArticles({ limit: 5 }),
  ]);

  const recentArticles = recentArticlesData?.items || [];

  return (
    <BlogLayoutWrapper 
      settings={settings || {}} 
      theme={theme?.name || 'classic'}
      themeConfig={theme?.config ? JSON.parse(theme.config) : {}}
      stats={stats || undefined}
      tags={tags || []}
      recentArticles={recentArticles}
    >
      {children}
    </BlogLayoutWrapper>
  );
}
