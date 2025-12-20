'use client';

import { useThemeContext } from '@/contexts/theme-context';
import { Pagination } from '@/components/ui/Pagination';
import { Slider } from '@/components/Slider';
import { useSiteSettingsContext } from '@/contexts/site-settings-context';

interface HomeClientProps {
  articles: any[];
  total: number;
  page: number;
  categoryId?: string;
  tagId?: string;
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

export function HomeClient({ articles, total, page, categoryId, tagId }: HomeClientProps) {
  const { theme, themeConfig, themeName } = useThemeContext();
  const { sliderItems, isSliderEnabled, sliderStyle } = useSiteSettingsContext();
  const { ArticleCard } = theme;

  const totalPages = Math.ceil(total / 10);

  // 只在首页第一页且没有筛选条件时显示幻灯片
  const showSlider = isSliderEnabled && sliderItems.length > 0 && page === 1 && !categoryId && !tagId;

  // 根据主题获取网格类
  let gridClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  if (themeName === 'magazine') {
    gridClass = gridClasses[themeConfig.gridColumns] || gridClasses['3'];
  } else if (themeName === 'classic') {
    gridClass = articlesPerRowClasses[themeConfig.articlesPerRow] || articlesPerRowClasses['1'];
  } else if (themeName === 'minimal') {
    // 极简主题使用单列列表
    gridClass = 'grid-cols-1';
  }

  // 构建分页的基础 URL，保留筛选参数
  let baseUrl = '/';
  const params = new URLSearchParams();
  if (categoryId) params.set('category', categoryId);
  if (tagId) params.set('tag', tagId);
  const queryString = params.toString();
  if (queryString) {
    baseUrl = `/?${queryString}&`;
  }

  return (
    <div>
      {/* 幻灯片 */}
      {showSlider && <Slider items={sliderItems} style={sliderStyle} />}

      {/* 文章列表 */}
      <div className={`grid ${gridClass} gap-6`}>
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} config={themeConfig} />
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          暂无文章
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={baseUrl}
          />
        </div>
      )}
    </div>
  );
}
