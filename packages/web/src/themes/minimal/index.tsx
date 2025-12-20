// 极简主题 - 纯净简约，大量留白，专注阅读
import { ReactNode, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../../components/ThemeToggle';
import { formatDate, truncate } from '../../lib/utils';
import { useSiteSettingsStore } from '../../stores/site-settings.store';
import type {
  ThemeComponents,
  ThemeConfig,
  ThemeConfigOption,
  ArticleCardProps,
  ArticleDetailProps,
  CategoryListProps,
  TagListProps,
  SearchResultProps,
} from '../index';

// 主题配置选项
const configOptions: ThemeConfigOption[] = [
  {
    key: 'contentWidth',
    label: '内容宽度',
    type: 'select',
    options: [
      { value: 'narrow', label: '窄（阅读优化）' },
      { value: 'medium', label: '中等' },
      { value: 'wide', label: '宽' },
    ],
    default: 'narrow',
    description: '文章内容区域的宽度',
  },
  {
    key: 'showDividers',
    label: '显示分隔线',
    type: 'boolean',
    default: true,
    description: '在文章之间显示分隔线',
  },
  {
    key: 'headerStyle',
    label: '头部样式',
    type: 'select',
    options: [
      { value: 'minimal', label: '极简' },
      { value: 'centered', label: '居中大标题' },
    ],
    default: 'minimal',
    description: '页面头部的显示样式',
  },
  {
    key: 'fontWeight',
    label: '字体粗细',
    type: 'select',
    options: [
      { value: 'light', label: '细体' },
      { value: 'normal', label: '常规' },
    ],
    default: 'light',
    description: '正文字体的粗细',
  },
  {
    key: 'showReadingTime',
    label: '显示阅读时间',
    type: 'boolean',
    default: false,
    description: '在文章卡片显示预计阅读时间',
  },
];

const defaultConfig: ThemeConfig = {
  contentWidth: 'narrow',
  showDividers: true,
  headerStyle: 'minimal',
  fontWeight: 'light',
  showReadingTime: false,
};

// 宽度映射
const widthClasses: Record<string, string> = {
  narrow: 'max-w-xl',
  medium: 'max-w-2xl',
  wide: 'max-w-3xl',
};

// ============ 布局 - 窄宽度居中 ============
function BlogLayout({ children, config = defaultConfig }: { children: ReactNode; config?: ThemeConfig }) {
  const widthClass = widthClasses[config.contentWidth] || widthClasses.narrow;
  const isLargeHeader = config.headerStyle === 'centered';
  const { settings, fetchSettings, getNavMenu } = useSiteSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const siteName = settings.siteName || 'NextBlog';
  const footerText = settings.footerText?.replace('{year}', new Date().getFullYear().toString()) 
    || `© ${new Date().getFullYear()} ${siteName}`;
  const navMenu = getNavMenu();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      <header className={`${isLargeHeader ? 'py-20' : 'py-16'} px-4`}>
        <div className={`${widthClass} mx-auto text-center`}>
          <Link to="/" className={`${isLargeHeader ? 'text-5xl' : 'text-4xl'} font-extralight tracking-[0.2em] uppercase`}>
            {siteName}
          </Link>
          <div className={`w-12 h-px bg-gray-300 dark:bg-gray-700 mx-auto ${isLargeHeader ? 'mt-8' : 'mt-6'}`} />
        </div>
      </header>

      <nav className={`${widthClass} mx-auto px-4 mb-16`}>
        <div className="flex items-center justify-center gap-4 text-xs tracking-[0.1em] uppercase flex-wrap">
          {navMenu.map((item, index) => (
            <span key={item.id} className="flex items-center gap-4">
              {index > 0 && <span className="text-gray-300 dark:text-gray-700">·</span>}
              {item.type === 'external' ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap">
                  {item.label}
                </a>
              ) : (
                <Link to={item.url}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap">
                  {item.label}
                </Link>
              )}
            </span>
          ))}
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <ThemeToggle />
        </div>
      </nav>

      <main className={`${widthClass} mx-auto px-4 pb-24`}>{children}</main>

      <footer className="py-16 text-center">
        <div className="w-8 h-px bg-gray-200 dark:bg-gray-800 mx-auto mb-6" />
        <p className="text-xs text-gray-400 tracking-[0.1em]">{footerText}</p>
      </footer>
    </div>
  );
}

// 计算阅读时间
function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').length;
  return Math.ceil(words / wordsPerMinute);
}

// ============ 文章卡片 - 极简列表 ============
function ArticleCard({ article, config = defaultConfig }: ArticleCardProps & { config?: ThemeConfig }) {
  const fontClass = config.fontWeight === 'light' ? 'font-light' : 'font-normal';
  const showDivider = config.showDividers;

  return (
    <article className={`py-10 ${showDivider ? 'border-b border-gray-100 dark:border-gray-900 last:border-0' : ''}`}>
      <time className="text-xs text-gray-400 tracking-wide uppercase">
        {formatDate(article.publishedAt || article.createdAt)}
        {config.showReadingTime && (
          <span className="ml-3">· {getReadingTime(article.content)} 分钟阅读</span>
        )}
      </time>
      <Link to={`/article/${article.slug}`}>
        <h2 className={`text-xl ${fontClass} mt-3 mb-4 hover:text-gray-500 transition-colors leading-relaxed`}>
          {article.title}
        </h2>
      </Link>
      <p className={`text-gray-500 text-sm leading-loose ${fontClass}`}>
        {truncate(article.excerpt || article.content, 180)}
      </p>
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
        {article.category && (
          <Link to={`/?category=${article.category.id}`} className="hover:text-gray-600 transition-colors">
            {article.category.name}
          </Link>
        )}
        {article.tags?.slice(0, 2).map((tag) => (
          <Link key={tag.id} to={`/?tag=${tag.id}`} className="hover:text-gray-600 transition-colors">
            #{tag.name}
          </Link>
        ))}
      </div>
    </article>
  );
}

// ============ 文章详情 - 居中大标题 ============
function ArticleDetail({ article, config = defaultConfig }: ArticleDetailProps & { config?: ThemeConfig }) {
  const fontClass = config.fontWeight === 'light' ? 'font-light' : 'font-normal';

  return (
    <article>
      <header className="text-center mb-16">
        <time className="text-xs text-gray-400 tracking-[0.15em] uppercase">
          {formatDate(article.publishedAt || article.createdAt)}
          {config.showReadingTime && (
            <span className="ml-3">· {getReadingTime(article.content)} 分钟阅读</span>
          )}
        </time>
        <h1 className="text-3xl font-extralight mt-6 mb-8 leading-relaxed">{article.title}</h1>
        <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
          {article.author && <span>{article.author.username}</span>}
          {article.category && (
            <Link to={`/?category=${article.category.id}`} className="hover:text-gray-600">{article.category.name}</Link>
          )}
          <span>{article.viewCount || 0} 阅读</span>
        </div>
        <div className="w-16 h-px bg-gray-200 dark:bg-gray-800 mx-auto mt-8" />
      </header>

      <div className={`prose prose-sm dark:prose-invert max-w-none 
        prose-headings:${fontClass} prose-headings:tracking-wide
        prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-p:leading-loose prose-p:${fontClass}
        prose-a:text-gray-900 dark:prose-a:text-gray-100 prose-a:no-underline prose-a:border-b prose-a:border-gray-300`}
        dangerouslySetInnerHTML={{ __html: article.htmlContent || article.content }} />

      {article.tags && article.tags.length > 0 && (
        <footer className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-900">
          <div className="flex flex-wrap justify-center gap-4">
            {article.tags.map((tag) => (
              <Link key={tag.id} to={`/?tag=${tag.id}`} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                #{tag.name}
              </Link>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
}

// ============ 分类列表 - 简洁列表 ============
function CategoryList({ categories, config = defaultConfig }: CategoryListProps & { config?: ThemeConfig }) {
  const fontClass = config.fontWeight === 'light' ? 'font-light' : 'font-normal';

  return (
    <div>
      <h1 className="text-2xl font-extralight tracking-wide text-center mb-12">分类</h1>
      <div className="space-y-4">
        {categories.map((category) => (
          <Link key={category.id} to={`/?category=${category.id}`}
            className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-900 hover:text-gray-500 transition-colors group">
            <span className={fontClass}>{category.name}</span>
            <span className="text-xs text-gray-400 group-hover:text-gray-600">{category._count?.articles || 0}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ============ 标签列表 - 简洁标签 ============
function TagList({ tags }: TagListProps & { config?: ThemeConfig }) {
  return (
    <div>
      <h1 className="text-2xl font-extralight tracking-wide text-center mb-12">标签</h1>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
        {tags.map((tag) => (
          <Link key={tag.id} to={`/?tag=${tag.id}`}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
            #{tag.name}
            <span className="text-xs ml-1 text-gray-300">({tag._count?.articles || 0})</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ============ 搜索结果 - 简洁列表 ============
function SearchResults({ articles, total, query, config = defaultConfig }: SearchResultProps & { config?: ThemeConfig }) {
  const fontClass = config.fontWeight === 'light' ? 'font-light' : 'font-normal';
  const showDivider = config.showDividers;

  if (!query) return null;
  return (
    <div>
      <p className="text-center text-gray-400 text-sm mb-12">
        找到 {total} 篇关于 "{query}" 的文章
      </p>
      <div className="space-y-8">
        {articles.map((article) => (
          <div key={article.id} className={`py-6 ${showDivider ? 'border-b border-gray-100 dark:border-gray-900' : ''}`}>
            <Link to={`/article/${article.slug}`}>
              <h2 className={`${fontClass} text-lg hover:text-gray-500 transition-colors`}>{article.title}</h2>
            </Link>
            <p className={`text-gray-500 text-sm mt-2 ${fontClass} leading-relaxed`}>
              {truncate(article.excerpt || article.content, 120)}
            </p>
            <time className="text-xs text-gray-400 mt-3 block">
              {formatDate(article.publishedAt || article.createdAt)}
            </time>
          </div>
        ))}
      </div>
    </div>
  );
}

export const MinimalTheme: ThemeComponents = {
  name: 'minimal',
  displayName: '极简主题',
  description: '纯净简约，大量留白，专注阅读体验',
  configOptions,
  defaultConfig,
  BlogLayout,
  ArticleCard,
  ArticleDetail,
  CategoryList,
  TagList,
  SearchResults,
};
