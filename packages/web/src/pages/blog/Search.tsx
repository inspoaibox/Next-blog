import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Article, PaginatedResponse } from '../../types';
import { Input } from '../../components/ui';
import { useBlogThemeStore } from '../../stores/blog-theme.store';
import { getTheme } from '../../themes';

export function SearchPage() {
  const { currentTheme, fetchActiveTheme, getConfig } = useBlogThemeStore();
  const theme = getTheme(currentTheme);
  const { BlogLayout, SearchResults } = theme;
  const config = getConfig();

  useEffect(() => {
    fetchActiveTheme();
  }, [fetchActiveTheme]);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const handleSearch = (value: string) => {
    setQuery(value);
    setTimeout(() => setDebouncedQuery(value), 300);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () =>
      api.get<PaginatedResponse<Article>>(
        `/articles/published?search=${encodeURIComponent(debouncedQuery)}`
      ),
    enabled: debouncedQuery.length >= 2,
  });

  return (
    <BlogLayout config={config}>
      <div className="mb-8">
        <Input
          placeholder="输入关键词搜索文章..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="text-lg py-3"
        />
      </div>

      {debouncedQuery.length < 2 ? (
        <div className="text-center py-12 text-gray-500">请输入至少 2 个字符进行搜索</div>
      ) : isLoading ? (
        <div className="text-center py-12 text-gray-500">搜索中...</div>
      ) : !data?.items.length ? (
        <div className="text-center py-12 text-gray-500">未找到相关文章</div>
      ) : (
        <SearchResults articles={data.items} total={data.total} query={debouncedQuery} config={config} />
      )}
    </BlogLayout>
  );
}
