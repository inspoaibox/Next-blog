import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Article, PaginatedResponse } from '../../types';
import { Pagination } from '../../components/ui';
import { useBlogThemeStore } from '../../stores/blog-theme.store';
import { getTheme } from '../../themes';

export function ArticleListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const categoryId = searchParams.get('category') || '';
  const tagId = searchParams.get('tag') || '';

  const { currentTheme, fetchActiveTheme } = useBlogThemeStore();
  const theme = getTheme(currentTheme);
  const { BlogLayout, ArticleCard } = theme;

  useEffect(() => {
    fetchActiveTheme();
  }, [fetchActiveTheme]);

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', '10');
  if (categoryId) params.set('categoryId', categoryId);
  if (tagId) params.set('tagId', tagId);

  const { data, isLoading } = useQuery({
    queryKey: ['public-articles', { page, categoryId, tagId }],
    queryFn: () => api.get<PaginatedResponse<Article>>(`/articles/published?${params}`),
  });

  const handlePageChange = (newPage: number) => {
    searchParams.set('page', String(newPage));
    setSearchParams(searchParams);
  };

  // 杂志主题使用网格布局
  const isGridLayout = currentTheme === 'magazine';

  return (
    <BlogLayout>
      <div className={isGridLayout ? 'max-w-7xl mx-auto' : 'max-w-4xl mx-auto'}>
        <h1 className="text-3xl font-bold mb-8">文章列表</h1>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : !data?.items.length ? (
          <div className="text-center py-12 text-gray-500">暂无文章</div>
        ) : (
          <div className={isGridLayout ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
            {data.items.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </BlogLayout>
  );
}
