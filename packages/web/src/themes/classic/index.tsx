// 经典主题 - 传统两栏博客布局，温暖琥珀色调
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
    key: 'layout',
    label: '布局模式',
    type: 'select',
    options: [
      { value: 'sidebar', label: '带侧边栏' },
      { value: 'full', label: '全宽布局' },
    ],
    default: 'sidebar',
    description: '选择页面布局方式',
  },
  {
    key: 'showAuthorCard',
    label: '显示作者卡片',
    type: 'boolean',
    default: true,
    description: '在侧边栏显示作者信息',
  },
  {
    key: 'showQuickLinks',
    label: '显示快速链接',
    type: 'boolean',
    default: true,
    description: '在侧边栏显示快速链接',
  },
  {
    key: 'articlesPerRow',
    label: '每行文章数',
    type: 'select',
    options: [
      { value: '1', label: '1篇（列表）' },
      { value: '2', label: '2篇（网格）' },
    ],
    default: '1',
    description: '文章列表的显示方式',
  },
  {
    key: 'primaryColor',
    label: '主题色',
    type: 'select',
    options: [
      { value: 'amber', label: '琥珀色' },
      { value: 'blue', label: '蓝色' },
      { value: 'green', label: '绿色' },
      { value: 'purple', label: '紫色' },
    ],
    default: 'amber',
    description: '主题的主要颜色',
  },
];

const defaultConfig: ThemeConfig = {
  layout: 'sidebar',
  showAuthorCard: true,
  showQuickLinks: true,
  articlesPerRow: '1',
  primaryColor: 'amber',
};

// 颜色映射
const colorClasses: Record<string, { gradient: string; text: string; bg: string; hover: string }> = {
  amber: { gradient: 'from-amber-700 to-amber-900', text: 'text-amber-600', bg: 'bg-amber-100', hover: 'hover:text-amber-700' },
  blue: { gradient: 'from-blue-700 to-blue-900', text: 'text-blue-600', bg: 'bg-blue-100', hover: 'hover:text-blue-700' },
  green: { gradient: 'from-green-700 to-green-900', text: 'text-green-600', bg: 'bg-green-100', hover: 'hover:text-green-700' },
  purple: { gradient: 'from-purple-700 to-purple-900', text: 'text-purple-600', bg: 'bg-purple-100', hover: 'hover:text-purple-700' },
};

// ============ 布局 ============
function BlogLayout({ children, config = defaultConfig }: { children: ReactNode; config?: ThemeConfig }) {
  const colors = colorClasses[config.primaryColor] || colorClasses.amber;
  const isSidebar = config.layout === 'sidebar';
  const { settings, fetchSettings, getNavMenu } = useSiteSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const siteName = settings.siteName || 'NextBlog';
  const siteDescription = settings.siteDescription || '下一个博客，记录精彩生活';
  const footerText = settings.footerText?.replace('{year}', new Date().getFullYear().toString()) 
    || `© ${new Date().getFullYear()} ${siteName}`;
  const navMenu = getNavMenu();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* 顶部横幅 */}
      <div className={`bg-gradient-to-r ${colors.gradient} text-white`}>
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <Link to="/" className="text-3xl font-serif font-bold tracking-wide">
            📚 {siteName}
          </Link>
          <p className="mt-2 text-white/70 text-sm">{siteDescription}</p>
        </div>
      </div>

      {/* 导航栏 */}
      <nav className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            {navMenu.map((item) => (
              item.type === 'external' ? (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                  className={`text-stone-600 dark:text-stone-300 ${colors.hover} font-medium`}>
                  {item.label}
                </a>
              ) : (
                <Link key={item.id} to={item.url}
                  className={`text-stone-600 dark:text-stone-300 ${colors.hover} font-medium`}>
                  {item.label}
                </Link>
              )
            ))}
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* 内容区域 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isSidebar ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <main className="lg:col-span-2">{children}</main>
            <aside className="space-y-6">
              {config.showAuthorCard && (
                <div className="bg-white dark:bg-stone-800 rounded-lg p-6 shadow-sm border border-stone-200 dark:border-stone-700">
                  <h3 className="font-serif font-bold text-lg mb-4 pb-2 border-b border-stone-200 dark:border-stone-700">👤 关于博主</h3>
                  <div className="text-center">
                    <div className={`w-20 h-20 bg-gradient-to-br ${colors.gradient} rounded-full mx-auto mb-3 flex items-center justify-center text-3xl text-white`}>🧑‍💻</div>
                    <p className="text-sm text-stone-600 dark:text-stone-400">热爱技术，热爱生活</p>
                  </div>
                </div>
              )}
              {config.showQuickLinks && (
                <div className="bg-white dark:bg-stone-800 rounded-lg p-6 shadow-sm border border-stone-200 dark:border-stone-700">
                  <h3 className="font-serif font-bold text-lg mb-4 pb-2 border-b border-stone-200 dark:border-stone-700">🔗 快速链接</h3>
                  <div className="space-y-2 text-sm">
                    <Link to="/categories" className={`block text-stone-600 dark:text-stone-400 ${colors.hover}`}>→ 所有分类</Link>
                    <Link to="/tags" className={`block text-stone-600 dark:text-stone-400 ${colors.hover}`}>→ 标签云</Link>
                    <Link to="/knowledge" className={`block text-stone-600 dark:text-stone-400 ${colors.hover}`}>→ 知识库</Link>
                  </div>
                </div>
              )}
            </aside>
          </div>
        ) : (
          <main className="max-w-4xl mx-auto">{children}</main>
        )}
      </div>

      <footer className="bg-stone-800 text-stone-400 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p>{footerText}</p>
        </div>
      </footer>
    </div>
  );
}

// ============ 文章卡片 ============
function ArticleCard({ article, config = defaultConfig }: ArticleCardProps & { config?: ThemeConfig }) {
  const colors = colorClasses[config.primaryColor] || colorClasses.amber;

  return (
    <article className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />
      <div className="p-6">
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-3">
          <span>📅 {formatDate(article.publishedAt || article.createdAt)}</span>
          {article.category && (
            <Link to={`/?category=${article.category.id}`} className={`${colors.text} hover:underline`}>
              📂 {article.category.name}
            </Link>
          )}
        </div>
        <Link to={`/article/${article.slug}`}>
          <h2 className={`text-xl font-serif font-bold mb-3 ${colors.hover} transition-colors`}>{article.title}</h2>
        </Link>
        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-4">
          {truncate(article.excerpt || article.content, 180)}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {article.tags?.slice(0, 3).map((tag) => (
              <Link key={tag.id} to={`/?tag=${tag.id}`} className={`px-2 py-1 bg-stone-100 dark:bg-stone-700 text-xs rounded hover:${colors.bg}`}>
                #{tag.name}
              </Link>
            ))}
          </div>
          <Link to={`/article/${article.slug}`} className={`${colors.text} text-sm font-medium hover:underline`}>阅读全文 →</Link>
        </div>
      </div>
    </article>
  );
}

// ============ 文章详情 ============
function ArticleDetail({ article, config = defaultConfig }: ArticleDetailProps & { config?: ThemeConfig }) {
  const colors = colorClasses[config.primaryColor] || colorClasses.amber;

  return (
    <article className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />
      <div className="p-8">
        <header className="mb-8 pb-6 border-b border-stone-200 dark:border-stone-700">
          <h1 className="text-3xl font-serif font-bold mb-4">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
            <span>📅 {formatDate(article.publishedAt || article.createdAt)}</span>
            {article.author && <span>✍️ {article.author.username}</span>}
            {article.category && (
              <Link to={`/?category=${article.category.id}`} className={`${colors.text} hover:underline`}>📂 {article.category.name}</Link>
            )}
            <span>👁️ {article.viewCount || 0} 次阅读</span>
          </div>
        </header>
        <div className={`prose prose-stone dark:prose-invert max-w-none prose-headings:font-serif prose-a:${colors.text}`}
          dangerouslySetInnerHTML={{ __html: article.htmlContent || article.content }} />
        {article.tags && article.tags.length > 0 && (
          <footer className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-700">
            <div className="flex flex-wrap gap-2">
              <span className="text-stone-500 text-sm">🏷️ 标签：</span>
              {article.tags.map((tag) => (
                <Link key={tag.id} to={`/?tag=${tag.id}`} className={`px-3 py-1 bg-stone-100 dark:bg-stone-700 text-sm rounded-full hover:${colors.bg}`}>
                  {tag.name}
                </Link>
              ))}
            </div>
          </footer>
        )}
      </div>
    </article>
  );
}

// ============ 分类列表 ============
function CategoryList({ categories, config = defaultConfig }: CategoryListProps & { config?: ThemeConfig }) {
  const colors = colorClasses[config.primaryColor] || colorClasses.amber;

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold mb-6 pb-4 border-b border-stone-200 dark:border-stone-700">📂 文章分类</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <Link key={category.id} to={`/?category=${category.id}`}
            className={`bg-white dark:bg-stone-800 rounded-lg p-5 border border-stone-200 dark:border-stone-700 hover:border-${config.primaryColor}-500 hover:shadow-md transition-all group`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`font-serif font-bold text-lg group-hover:${colors.text} transition-colors`}>{category.name}</h2>
                {category.description && <p className="text-stone-500 text-sm mt-1">{category.description}</p>}
              </div>
              <div className={`text-2xl font-bold ${colors.text}`}>{category._count?.articles || 0}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ============ 标签列表 ============
function TagList({ tags, config = defaultConfig }: TagListProps & { config?: ThemeConfig }) {
  const colors = colorClasses[config.primaryColor] || colorClasses.amber;

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold mb-6 pb-4 border-b border-stone-200 dark:border-stone-700">🏷️ 标签云</h1>
      <div className="bg-white dark:bg-stone-800 rounded-lg p-6 border border-stone-200 dark:border-stone-700">
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => {
            const count = tag._count?.articles || 0;
            const size = count > 10 ? 'text-xl' : count > 5 ? 'text-lg' : 'text-base';
            return (
              <Link key={tag.id} to={`/?tag=${tag.id}`}
                className={`${size} px-4 py-2 bg-stone-100 dark:bg-stone-700 rounded-full hover:${colors.bg} ${colors.hover} transition-all`}>
                #{tag.name}
                <span className="ml-2 text-xs text-stone-400">({count})</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ 搜索结果 ============
function SearchResults({ articles, total, query, config = defaultConfig }: SearchResultProps & { config?: ThemeConfig }) {
  const colors = colorClasses[config.primaryColor] || colorClasses.amber;

  if (!query) return null;
  return (
    <div>
      <p className="text-stone-500 mb-6">找到 <span className={`${colors.text} font-bold`}>{total}</span> 篇关于 "<span className={colors.text}>{query}</span>" 的文章</p>
      <div className="space-y-4">
        {articles.map((article) => (
          <div key={article.id} className={`bg-white dark:bg-stone-800 rounded-lg p-5 border border-stone-200 dark:border-stone-700 hover:border-${config.primaryColor}-500 transition-colors`}>
            <Link to={`/article/${article.slug}`}>
              <h2 className={`font-serif font-bold text-lg ${colors.hover} transition-colors`}>{article.title}</h2>
            </Link>
            <p className="text-stone-500 text-sm mt-2">{truncate(article.excerpt || article.content, 150)}</p>
            <div className="flex items-center gap-3 mt-3 text-xs text-stone-400">
              <span>{formatDate(article.publishedAt || article.createdAt)}</span>
              {article.tags?.slice(0, 2).map((tag) => (
                <span key={tag.id} className="px-2 py-1 bg-stone-100 dark:bg-stone-700 rounded">#{tag.name}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const ClassicTheme: ThemeComponents = {
  name: 'classic',
  displayName: '经典主题',
  description: '传统两栏博客布局，温暖琥珀色调，带侧边栏',
  configOptions,
  defaultConfig,
  BlogLayout,
  ArticleCard,
  ArticleDetail,
  CategoryList,
  TagList,
  SearchResults,
};
