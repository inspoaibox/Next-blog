'use client';

import { useThemeContext } from '@/contexts/theme-context';
import { Pagination } from '@/components/ui/Pagination';

interface TagClientProps {
  tag: any;
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

export function TagClient({ tag, articles, total, page }: TagClientProps) {
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        标签：{tag.name}
        <span className="text-gray-500 text-lg ml-2">({total} 篇文章)</span>
      </h1>

      <div className={`grid ${gridClass} gap-6`}>
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} config={themeConfig} />
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          该标签下暂无文章
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={`/tag/${tag.slug}`}
          />
        </div>
      )}
    </div>
  );
}
