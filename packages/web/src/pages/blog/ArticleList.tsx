import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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

  const { currentTheme, fetchActiveTheme, getConfig } = useBlogThemeStore();
  const theme = getTheme(currentTheme);
  const { BlogLayout, ArticleCard } = theme;
  const config = getConfig();

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

  // 根据主题配置决定布局
  const gridColumns = config.gridColumns || '3';
  const articlesPerRow = config.articlesPerRow || '1';
  
  // 网格列数映射
  const gridColsMap: Record<string, string> = {
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-2 lg:grid-cols-3',
    '4': 'md:grid-cols-2 lg:grid-cols-4',
  };
  
  const gridClass = currentTheme === 'magazine' 
    ? `grid grid-cols-1 ${gridColsMap[gridColumns] || gridColsMap['3']} gap-6`
    : articlesPerRow === '2' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6';

  return (
    <BlogLayout config={config}>
      <div className={currentTheme === 'magazine' ? '' : ''}>
        <h1 className="text-3xl font-bold mb-8">文章列表</h1>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : !data?.items.length ? (
          <div className="text-center py-12 text-gray-500">暂无文章</div>
        ) : (
          <div className={gridClass}>
            {data.items.map((article) => (
              <ArticleCard key={article.id} article={article} config={config} />
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
