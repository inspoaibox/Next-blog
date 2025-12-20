import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Article, PaginatedResponse } from '../../types';
import { Input, Card, CardContent, Badge } from '../../components/ui';
import { formatDate, truncate } from '../../lib/utils';
import { BlogLayout } from '../../layouts/BlogLayout';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 简单的防抖
  const handleSearch = (value: string) => {
    setQuery(value);
    setTimeout(() => setDebouncedQuery(value), 300);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => api.get<PaginatedResponse<Article>>(`/articles/public?search=${encodeURIComponent(debouncedQuery)}&status=published`),
    enabled: debouncedQuery.length >= 2,
  });

  return (
    <BlogLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">搜索</h1>

        <div className="mb-8">
          <Input
            placeholder="输入关键词搜索文章..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="text-lg py-3"
          />
        </div>

        {debouncedQuery.length < 2 ? (
          <div className="text-center py-12 text-gray-500">
            请输入至少 2 个字符进行搜索
          </div>
        ) : isLoading ? (
          <div className="text-center py-12 text-gray-500">搜索中...</div>
        ) : !data?.items.length ? (
          <div className="text-center py-12 text-gray-500">
            未找到相关文章
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-500 mb-4">
              找到 {data.total} 篇相关文章
            </p>
            
            {data.items.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <Link to={`/article/${article.slug}`}>
                    <h2 className="text-lg font-semibold mb-2 hover:text-primary-600 transition-colors">
                      {article.title}
                    </h2>
                  </Link>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {truncate(article.excerpt || article.content, 150)}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                    {article.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag.id} variant="default">{tag.name}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </BlogLayout>
  );
}
