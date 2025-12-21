// 经典主题 - 传统两栏博客布局，温暖琥珀色调
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '../../components/ThemeToggle';
import { SearchBox } from '../../components/SearchBox';
import { DesktopNavMenu, MobileNavMenu } from '../../components/NavMenu';
import { formatDate, truncate } from '../../lib/utils';
import { useSiteSettingsContext } from '../../contexts/site-settings-context';
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
    key: 'authorName',
    label: '作者名称',
    type: 'text',
    default: '博主',
    description: '显示在作者卡片的名称',
  },
  {
    key: 'authorAvatar',
    label: '作者头像',
    type: 'text',
    default: '',
    description: '头像图片URL，留空使用默认头像',
  },
  {
    key: 'authorBio',
    label: '作者简介',
    type: 'text',
    default: '热爱技术，热爱生活',
    description: '显示在作者卡片的简介',
  },
  {
    key: 'showQuickLinks',
    label: '显示快速链接',
    type: 'boolean',
    default: true,
    description: '在侧边栏显示快速链接',
  },
  {
    key: 'quickLinks',
    label: '快速链接',
    type: 'json',
    default: JSON.stringify([
      { label: '所有分类', url: '/categories' },
      { label: '标签云', url: '/tags' },
      { label: '知识库', url: '/knowledge' },
    ]),
    description: '自定义快速链接，JSON格式：[{"label":"名称","url":"链接"}]',
  },
  {
    key: 'showFeaturedImage',
    label: '显示特色图',
    type: 'boolean',
    default: false,
    description: '在文章卡片顶部显示特色图',
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
  authorName: '博主',
  authorAvatar: '',
  authorBio: '热爱技术，热爱生活',
  showQuickLinks: true,
  quickLinks: JSON.stringify([
    { label: '所有分类', url: '/categories' },
    { label: '标签云', url: '/tags' },
    { label: '知识库', url: '/knowledge' },
  ]),
  showFeaturedImage: false,
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
  const { settings, navMenu } = useSiteSettingsContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const siteName = settings.siteName || 'NextBlog';
  const siteDescription = settings.siteDescription || '下一个博客，记录精彩生活';
  const footerText = settings.footerText?.replace('{year}', new Date().getFullYear().toString()) 
    || `© ${new Date().getFullYear()} ${siteName}`;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* 顶部横幅 */}
      <div className={`bg-gradient-to-r ${colors.gradient} text-white`}>
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 text-center">
          <Link href="/" className="text-2xl md:text-3xl font-serif font-bold tracking-wide">
            📚 {siteName}
          </Link>
          <p className="mt-2 text-white/70 text-sm hidden md:block">{siteDescription}</p>
        </div>
      </div>

      {/* 导航栏 */}
      <nav className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <DesktopNavMenu 
            items={navMenu} 
            itemClassName={`text-stone-600 dark:text-stone-300 ${colors.hover} font-medium px-3 py-2`}
          />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-600 dark:text-stone-300"
            aria-label="菜单"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <SearchBox />
          <ThemeToggle />
        </div>
        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <MobileNavMenu items={navMenu} onClose={() => setMobileMenuOpen(false)} />
        )}
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
                    {config.authorAvatar ? (
                      <img src={config.authorAvatar} alt={config.authorName || '博主'} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover" />
                    ) : (
                      <div className={`w-20 h-20 bg-gradient-to-br ${colors.gradient} rounded-full mx-auto mb-3 flex items-center justify-center text-3xl text-white`}>🧑‍💻</div>
                    )}
                    {config.authorName && <p className="font-medium text-stone-800 dark:text-stone-200 mb-1">{config.authorName}</p>}
                    <p className="text-sm text-stone-600 dark:text-stone-400">{config.authorBio || '热爱技术，热爱生活'}</p>
                  </div>
                </div>
              )}
              {config.showQuickLinks && (
                <div className="bg-white dark:bg-stone-800 rounded-lg p-6 shadow-sm border border-stone-200 dark:border-stone-700">
                  <h3 className="font-serif font-bold text-lg mb-4 pb-2 border-b border-stone-200 dark:border-stone-700">🔗 快速链接</h3>
                  <div className="space-y-2 text-sm">
                    {(() => {
                      try {
                        const links = typeof config.quickLinks === 'string' ? JSON.parse(config.quickLinks) : config.quickLinks;
                        if (Array.isArray(links) && links.length > 0) {
                          return links.map((link: { label: string; url: string }, index: number) => (
                            <Link key={index} href={link.url} className={`block text-stone-600 dark:text-stone-400 ${colors.hover}`}>→ {link.label}</Link>
                          ));
                        }
                      } catch {
                        // JSON parse failed, use default links
                      }
                      // 默认链接
                      return (
                        <>
                          <Link href="/categories" className={`block text-stone-600 dark:text-stone-400 ${colors.hover}`}>→ 所有分类</Link>
                          <Link href="/tags" className={`block text-stone-600 dark:text-stone-400 ${colors.hover}`}>→ 标签云</Link>
                          <Link href="/knowledge" className={`block text-stone-600 dark:text-stone-400 ${colors.hover}`}>→ 知识库</Link>
                        </>
                      );
                    })()}
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
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-3 text-sm">
          <p>{footerText}</p>
          <a
            href="https://github.com/inspoaibox/Next-blog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-500 hover:text-stone-300 transition-colors"
            aria-label="GitHub"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

// ============ 文章卡片 ============
function ArticleCard({ article, config = defaultConfig }: ArticleCardProps & { config?: ThemeConfig }) {
  const colors = colorClasses[config.primaryColor] || colorClasses.amber;
  const showFeaturedImage = config.showFeaturedImage && article.featuredImage;

  return (
    <article className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />
      {showFeaturedImage && (
        <Link href={`/article/${article.slug}`}>
          <img 
            src={article.featuredImage!} 
            alt={article.title}
            className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
          />
        </Link>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-3">
          <span>📅 {formatDate(article.publishedAt || article.createdAt)}</span>
          {article.category && (
            <Link href={`/?category=${article.category.id}`} className={`${colors.text} hover:underline`}>
              📂 {article.category.name}
            </Link>
          )}
        </div>
        <Link href={`/article/${article.slug}`}>
          <h2 className={`text-xl font-serif font-bold mb-3 ${colors.hover} transition-colors`}>{article.title}</h2>
        </Link>
        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-4">
          {truncate(article.excerpt || article.content, 180)}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {article.tags?.slice(0, 3).map((tag) => (
              <Link key={tag.id} href={`/?tag=${tag.id}`} className={`px-2 py-1 bg-stone-100 dark:bg-stone-700 text-xs rounded hover:${colors.bg}`}>
                #{tag.name}
              </Link>
            ))}
          </div>
          <Link href={`/article/${article.slug}`} className={`${colors.text} text-sm font-medium hover:underline`}>阅读全文 →</Link>
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
              <Link href={`/?category=${article.category.id}`} className={`${colors.text} hover:underline`}>📂 {article.category.name}</Link>
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
                <Link key={tag.id} href={`/?tag=${tag.id}`} className={`px-3 py-1 bg-stone-100 dark:bg-stone-700 text-sm rounded-full hover:${colors.bg}`}>
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

  const renderCategory = (category: any, isChild = false) => (
    <Link
      key={category.id}
      href={`/?category=${category.id}`}
      className={`bg-white dark:bg-stone-800 rounded-lg p-5 border border-stone-200 dark:border-stone-700 hover:shadow-md transition-all group ${isChild ? 'ml-4' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`font-serif font-bold ${isChild ? 'text-base' : 'text-lg'} group-hover:${colors.text} transition-colors`}>
            {isChild && <span className="text-stone-400 mr-1">└</span>}
            {category.name}
          </h2>
        </div>
        <div className={`text-xl font-bold ${colors.text}`}>{category._count?.articles || 0}</div>
      </div>
    </Link>
  );

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold mb-6 pb-4 border-b border-stone-200 dark:border-stone-700">📂 文章分类</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="space-y-2">
            {renderCategory(category)}
            {category.children?.map((child: any) => renderCategory(child, true))}
          </div>
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
              <Link key={tag.id} href={`/?tag=${tag.id}`}
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
            <Link href={`/article/${article.slug}`}>
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
