'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeContext } from '@/contexts/theme-context';
import { Pagination } from '@/components/ui/Pagination';

interface SearchClientProps {
  initialQuery: string;
  articles: any[];
  total: number;
  page: number;
}

// 网格列数映射 (Magazine 主题)
const gridClasses: Record<string, string> = {
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

// 每行文章数映射 (Classic 主题)
const articlesPerRowClasses: Record<string, string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-1 md:grid-cols-2',
};

export function SearchClient({ initialQuery, articles, total, page }: SearchClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const { theme, themeConfig, themeName } = useThemeContext();
  const { ArticleCard } = theme;

  const totalPages = Math.ceil(total / 10);

  // 根据主题获取网格类
  let gridClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  if (themeName === 'magazine') {
    gridClass = gridClasses[themeConfig.gridColumns] || gridClasses['3'];
  } else if (themeName === 'classic') {
    gridClass = articlesPerRowClasses[themeConfig.articlesPerRow] || articlesPerRowClasses['1'];
  } else if (themeName === 'minimal') {
    gridClass = 'grid-cols-1';
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">搜索文章</h1>

      {/* 搜索框 */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="请输入关键词搜索..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            搜索
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">请输入至少 2 个字符进行搜索</p>
      </form>

      {/* 搜索结果 */}
      {initialQuery && (
        <>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            搜索 "{initialQuery}" 找到 {total} 篇文章
          </p>

          <div className={`grid ${gridClass} gap-6`}>
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} config={themeConfig} />
            ))}
          </div>

          {articles.length === 0 && initialQuery.length >= 2 && (
            <div className="text-center py-12 text-gray-500">
              未找到相关文章
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl={`/search?q=${encodeURIComponent(initialQuery)}`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
