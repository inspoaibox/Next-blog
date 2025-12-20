import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Article, PaginatedResponse } from '../../types';
import { Card, CardContent, Badge, Pagination } from '../../components/ui';
import { formatDate, truncate } from '../../lib/utils';
import { BlogLayout } from '../../layouts/BlogLayout';

export function ArticleListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const categoryId = searchParams.get('category') || '';
  const tagId = searchParams.get('tag') || '';

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', '10');
  params.set('status', 'published');
  if (categoryId) params.set('categoryId', categoryId);
  if (tagId) params.set('tagId', tagId);

  const { data, isLoading } = useQuery({
    queryKey: ['public-articles', { page, categoryId, tagId }],
    queryFn: () => api.get<PaginatedResponse<Article>>(`/articles/public?${params}`),
  });

  const handlePageChange = (newPage: number) => {
    searchParams.set('page', String(newPage));
    setSearchParams(searchParams);
  };

  return (
    <BlogLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">文章列表</h1>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : !data?.items.length ? (
          <div className="text-center py-12 text-gray-500">暂无文章</div>
        ) : (
          <div className="space-y-6">
            {data.items.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <Link to={`/article/${article.slug}`}>
                    <h2 className="text-xl font-semibold mb-2 hover:text-primary-600 transition-colors">
                      {article.title}
                    </h2>
                  </Link>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {truncate(article.excerpt || article.content, 200)}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">{formatDate(article.publishedAt || article.createdAt)}</span>
                      {article.category && (
                        <Link
                          to={`/?category=${article.category.id}`}
                          className="text-primary-600 hover:underline"
                        >
                          {article.category.name}
                        </Link>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {article.tags?.slice(0, 3).map((tag) => (
                        <Link key={tag.id} to={`/?tag=${tag.id}`}>
                          <Badge variant="default">{tag.name}</Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
