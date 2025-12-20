import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Tag } from '../../types';
import { useBlogThemeStore } from '../../stores/blog-theme.store';
import { getTheme } from '../../themes';

export function TagsPage() {
  const { currentTheme, fetchActiveTheme, getConfig } = useBlogThemeStore();
  const theme = getTheme(currentTheme);
  const { BlogLayout, TagList } = theme;
  const config = getConfig();

  useEffect(() => {
    fetchActiveTheme();
  }, [fetchActiveTheme]);

  const { data: tags, isLoading } = useQuery({
    queryKey: ['public-tags'],
    queryFn: () => api.get<Tag[]>('/tags'),
  });

  return (
    <BlogLayout config={config}>
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : !tags?.length ? (
        <div className="text-center py-12 text-gray-500">暂无标签</div>
      ) : (
        <TagList tags={tags} config={config} />
      )}
    </BlogLayout>
  );
}
