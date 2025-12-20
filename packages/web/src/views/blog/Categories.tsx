import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Category } from '../../types';
import { useBlogThemeStore } from '../../stores/blog-theme.store';
import { getTheme } from '../../themes';

export function CategoriesPage() {
  const { currentTheme, fetchActiveTheme, getConfig } = useBlogThemeStore();
  const theme = getTheme(currentTheme);
  const { BlogLayout, CategoryList } = theme;
  const config = getConfig();

  useEffect(() => {
    fetchActiveTheme();
  }, [fetchActiveTheme]);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['public-categories'],
    queryFn: () => api.get<Category[]>('/categories'),
  });

  return (
    <BlogLayout config={config}>
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : !categories?.length ? (
        <div className="text-center py-12 text-gray-500">暂无分类</div>
      ) : (
        <CategoryList categories={categories} config={config} />
      )}
    </BlogLayout>
  );
}
