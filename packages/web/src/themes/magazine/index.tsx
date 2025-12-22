// 杂志主题 - 大图卡片网格，紫粉渐变，现代视觉
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
    key: 'layoutWidth',
    label: '布局宽度',
    type: 'select',
    options: [
      { value: 'normal', label: '标准宽度 (1280px)' },
      { value: 'wide', label: '宽屏 (1536px)' },
      { value: 'full', label: '全屏' },
    ],
    default: 'normal',
    description: '页面内容区域的最大宽度',
  },
  {
    key: 'customMaxWidth',
    label: '自定义最大宽度',
    type: 'text',
    default: '',
    description: '自定义最大宽度（如 1400px），留空使用预设宽度',
  },
  {
    key: 'showSidebar',
    label: '显示侧边栏',
    type: 'boolean',
    default: false,
    description: '在首页和文章列表页显示侧边栏',
  },
  {
    key: 'gridColumns',
    label: '网格列数',
    type: 'select',
    options: [
      { value: '1', label: '1列' },
      { value: '2', label: '2列' },
      { value: '3', label: '3列' },
      { value: '4', label: '4列' },
    ],
    default: '3',
    description: '文章卡片的列数',
  },
  {
    key: 'cardStyle',
    label: '卡片样式',
    type: 'select',
    options: [
      { value: 'gradient', label: '渐变背景' },
      { value: 'image', label: '图片背景' },
      { value: 'simple', label: '简洁白底' },
    ],
    default: 'gradient',
    description: '文章卡片的视觉样式',
  },
  {
    key: 'showFeaturedImage',
    label: '显示特色图',
    type: 'boolean',
    default: true,
    description: '在文章卡片顶部显示特色图或渐变背景',
  },
  {
    key: 'showArticleDetailFeaturedImage',
    label: '文章页显示特色图',
    type: 'boolean',
    default: true,
    description: '在文章详情页显示特色图片',
  },
  {
    key: 'colorScheme',
    label: '配色方案',
    type: 'select',
    options: [
      { value: 'purple', label: '紫粉渐变' },
      { value: 'blue', label: '蓝青渐变' },
      { value: 'warm', label: '暖色渐变' },
    ],
    default: 'purple',
    description: '主题的整体配色',
  },
  {
    key: 'showHeroHeader',
    label: '显示大图头部',
    type: 'boolean',
    default: true,
    description: '文章详情页显示渐变大图头部',
  },
  {
    key: 'roundedCorners',
    label: '圆角大小',
    type: 'select',
    options: [
      { value: 'small', label: '小圆角' },
      { value: 'medium', label: '中等圆角' },
      { value: 'large', label: '大圆角' },
    ],
    default: 'large',
    description: '卡片和按钮的圆角大小',
  },
];

const defaultConfig: ThemeConfig = {
  layoutWidth: 'normal',
  customMaxWidth: '',
  showSidebar: false,
  gridColumns: '3',
  cardStyle: 'gradient',
  showFeaturedImage: true,
  showArticleDetailFeaturedImage: true,
  colorScheme: 'purple',
  showHeroHeader: true,
  roundedCorners: 'large',
};

// 配色方案
const colorSchemes: Record<string, { primary: string; gradient: string; text: string; bg: string }> = {
  purple: {
    primary: 'violet',
    gradient: 'from-violet-500 to-fuchsia-500',
    text: 'text-violet-600',
    bg: 'bg-violet-100',
  },
  blue: {
    primary: 'blue',
    gradient: 'from-cyan-500 to-blue-500',
    text: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  warm: {
    primary: 'orange',
    gradient: 'from-orange-500 to-rose-500',
    text: 'text-orange-600',
    bg: 'bg-orange-100',
  },
};

// 圆角映射
const roundedClasses: Record<string, { card: string; button: string }> = {
  small: { card: 'rounded-lg', button: 'rounded-lg' },
  medium: { card: 'rounded-xl', button: 'rounded-xl' },
  large: { card: 'rounded-2xl', button: 'rounded-full' },
};

// 网格列数映射
const gridClasses: Record<string, string> = {
  '1': 'grid-cols-1',
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-2 lg:grid-cols-3',
  '4': 'md:grid-cols-2 lg:grid-cols-4',
};

// 布局宽度映射
const layoutWidthClasses: Record<string, string> = {
  normal: 'max-w-7xl',
  wide: 'max-w-[1536px]',
  full: 'max-w-full px-4 md:px-8',
};

// ============ 布局 - 宽屏现代 ============
function BlogLayout({ children, config = defaultConfig }: { children: ReactNode; config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme] || colorSchemes.purple;
  const rounded = roundedClasses[config.roundedCorners] || roundedClasses.large;
  const { settings, navMenu } = useSiteSettingsContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const siteName = settings.siteName || 'NextBlog';
  const siteLogo = settings.siteLogo;
  const footerText = settings.footerText?.replace('{year}', new Date().getFullYear().toString()) 
    || `© ${new Date().getFullYear()} ${siteName}`;

  // 计算布局宽度
  const getContainerStyle = () => {
    if (config.customMaxWidth) {
      return { maxWidth: config.customMaxWidth };
    }
    return {};
  };

  const layoutWidthClass = config.customMaxWidth 
    ? 'w-full' 
    : (layoutWidthClasses[config.layoutWidth] || layoutWidthClasses.normal);

  const isFullWidth = config.layoutWidth === 'full';
  const showSidebar = config.showSidebar;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className={`${layoutWidthClass} mx-auto px-4 md:px-6 py-4 flex items-center justify-between`} style={getContainerStyle()}>
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="h-8 md:h-10 w-auto" />
            ) : (
              <div className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br ${colors.gradient} ${rounded.button} flex items-center justify-center text-white font-bold text-sm md:text-lg`}>{siteName[0]}</div>
            )}
            <span className={`text-lg md:text-xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>{siteName}</span>
          </Link>
          <DesktopNavMenu 
            items={navMenu} 
            itemClassName={`px-4 py-2 ${rounded.button} text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all`}
          />
          <div className="flex items-center gap-2">
            <SearchBox />
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400"
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
          </div>
        </div>
        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <MobileNavMenu items={navMenu} onClose={() => setMobileMenuOpen(false)} />
        )}
      </header>

      <main className={`${layoutWidthClass} mx-auto ${isFullWidth ? '' : 'px-4 md:px-6'} py-8 md:py-12`} style={getContainerStyle()}>
        {showSidebar ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0">{children}</div>
            <MagazineSidebar config={config} colors={colors} rounded={rounded} />
          </div>
        ) : (
          children
        )}
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 md:py-12">
        <div className={`${layoutWidthClass} mx-auto px-4 md:px-6 text-center`} style={getContainerStyle()}>
          <div className="flex items-center justify-center gap-3 mb-4">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="h-8 w-auto" />
            ) : (
              <div className={`w-8 h-8 bg-gradient-to-br ${colors.gradient} ${rounded.button} flex items-center justify-center text-white font-bold text-sm`}>{siteName[0]}</div>
            )}
            <span className="font-bold text-white">{siteName}</span>
          </div>
          <p className="text-sm inline-flex items-center gap-2">
            {footerText}
            <a
              href="https://github.com/inspoaibox/Next-blog"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

// ============ 侧边栏组件 ============
function MagazineSidebar({ 
  config, 
  colors, 
  rounded 
}: { 
  config: ThemeConfig; 
  colors: { primary: string; gradient: string; text: string; bg: string };
  rounded: { card: string; button: string };
}) {
  const { settings } = useSiteSettingsContext();
  const stats = (config as any)._stats;

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
      {/* 作者卡片 */}
      <div className={`bg-white dark:bg-gray-900 ${rounded.card} p-6 shadow-sm`}>
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${colors.gradient} ${rounded.button} flex items-center justify-center text-white text-2xl font-bold`}>
            {(settings.siteName || 'N')[0]}
          </div>
          <h3 className="font-bold text-lg">{settings.siteName || 'NextBlog'}</h3>
          <p className="text-gray-500 text-sm mt-2">{settings.siteDescription || '一个现代化的博客'}</p>
        </div>
      </div>

      {/* 站点统计 */}
      {stats && (
        <div className={`bg-white dark:bg-gray-900 ${rounded.card} p-6 shadow-sm`}>
          <h4 className={`font-bold mb-4 ${colors.text}`}>📊 站点统计</h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className={`text-xl font-bold ${colors.text}`}>{stats.totalArticles}</p>
              <p className="text-xs text-gray-500">文章</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className={`text-xl font-bold ${colors.text}`}>{stats.totalCategories}</p>
              <p className="text-xs text-gray-500">分类</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className={`text-xl font-bold ${colors.text}`}>{stats.totalTags}</p>
              <p className="text-xs text-gray-500">标签</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className={`text-xl font-bold ${colors.text}`}>{(stats.totalViews || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">访问</p>
            </div>
          </div>
          {stats.runningDays > 0 && (
            <p className="text-xs text-gray-400 text-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
              🎂 已运行 {stats.runningDays} 天
            </p>
          )}
        </div>
      )}

      {/* 快捷导航 */}
      <div className={`bg-white dark:bg-gray-900 ${rounded.card} p-6 shadow-sm`}>
        <h4 className={`font-bold mb-4 ${colors.text}`}>快捷导航</h4>
        <div className="space-y-2">
          <Link href="/categories" className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            📂 分类
          </Link>
          <Link href="/tags" className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            🏷️ 标签
          </Link>
          <Link href="/about" className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            👤 关于
          </Link>
          <Link href="/friends" className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            🔗 友链
          </Link>
        </div>
      </div>
    </aside>
  );
}

// ============ 文章卡片 - 大图卡片 ============
function ArticleCard({ article, config = defaultConfig }: ArticleCardProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme] || colorSchemes.purple;
  const rounded = roundedClasses[config.roundedCorners] || roundedClasses.large;

  // 基于文章 ID 生成稳定的随机渐变
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-fuchsia-500 to-pink-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-indigo-500 to-violet-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-lime-500 to-green-600',
    'from-sky-500 to-indigo-600',
  ];
  
  // 使用文章 ID 的哈希值来选择渐变，确保同一文章始终显示相同渐变
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };
  const gradient = gradients[hashCode(article.id) % gradients.length];

  const isSimple = config.cardStyle === 'simple';
  const showFeaturedImage = config.showFeaturedImage !== false;
  const hasFeaturedImage = !!article.featuredImage;

  return (
    <article className={`group bg-white dark:bg-gray-900 ${rounded.card} overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2`}>
      {!isSimple && showFeaturedImage && (
        <div className={`aspect-[16/10] relative overflow-hidden`}>
          {hasFeaturedImage ? (
            <img 
              src={article.featuredImage!} 
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient}`}>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-tl-full" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <time>{formatDate(article.publishedAt || article.createdAt)}</time>
          {article.category && (
            <>
              <span>·</span>
              <Link href={`/?category=${article.category.id}`} className={`${colors.text} hover:underline`}>
                {article.category.name}
              </Link>
            </>
          )}
        </div>
        <Link href={`/article/${article.slug}`}>
          <h2 className={`text-lg font-bold mt-2 mb-3 text-gray-900 dark:text-white group-hover:${colors.text} transition-colors line-clamp-2`}>{article.title}</h2>
        </Link>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{truncate(article.excerpt || article.content, 100)}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {article.tags?.slice(0, 2).map((tag) => (
              <Link key={tag.id} href={`/?tag=${tag.id}`}
                className={`px-2 py-1 bg-gray-100 dark:bg-gray-800 ${rounded.button} text-xs hover:${colors.bg} hover:${colors.text} transition-colors`}>
                {tag.name}
              </Link>
            ))}
          </div>
          <Link href={`/article/${article.slug}`} className={`${colors.text} text-sm font-medium`}>阅读 →</Link>
        </div>
      </div>
    </article>
  );
}

// ============ 文章详情 - Hero头部 ============
function ArticleDetail({ article, config = defaultConfig }: ArticleDetailProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme] || colorSchemes.purple;
  const rounded = roundedClasses[config.roundedCorners] || roundedClasses.large;
  const showHero = config.showHeroHeader;
  const showArticleDetailFeaturedImage = config.showArticleDetailFeaturedImage !== false;

  const gradients = ['from-violet-500 to-purple-600', 'from-fuchsia-500 to-pink-600', 'from-cyan-500 to-blue-600'];
  const gradient = gradients[article.title.length % gradients.length];

  return (
    <article>
      {showHero ? (
        <header className={`bg-gradient-to-br ${gradient} ${rounded.card} p-8 md:p-12 mb-8 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {article.category && (
                <span className={`px-4 py-1.5 bg-white/20 backdrop-blur-sm ${rounded.button} text-sm font-medium`}>{article.category.name}</span>
              )}
              <span className="text-white/70 text-sm">{formatDate(article.publishedAt || article.createdAt)}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-6 leading-tight">{article.title}</h1>
            <div className="flex items-center gap-6 text-white/80">
              {article.author && (
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-white/20 ${rounded.button} flex items-center justify-center font-bold`}>
                    {article.author.username[0].toUpperCase()}
                  </div>
                  <span className="font-medium">{article.author.username}</span>
                </div>
              )}
              <span>👁️ {article.viewCount || 0}</span>
            </div>
          </div>
        </header>
      ) : (
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-500">
            {article.category && (
              <span className={`px-3 py-1 ${colors.bg} ${colors.text} ${rounded.button} font-medium`}>{article.category.name}</span>
            )}
            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
            {article.author && <span>by {article.author.username}</span>}
            <span>👁️ {article.viewCount || 0}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black leading-tight">{article.title}</h1>
        </header>
      )}

      {showArticleDetailFeaturedImage && article.featuredImage && (
        <div className={`mb-8 ${rounded.card} overflow-hidden`}>
          <img src={article.featuredImage} alt={article.title} className="w-full aspect-video object-cover" />
        </div>
      )}

      <div className={`bg-white dark:bg-gray-900 ${rounded.card} p-8 md:p-12 shadow-sm`}>
        <div className={`prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:${colors.text}`}
          dangerouslySetInnerHTML={{ __html: article.htmlContent || article.content }} />
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3">
          {article.tags.map((tag) => (
            <Link key={tag.id} href={`/?tag=${tag.id}`}
              className={`px-5 py-2.5 bg-white dark:bg-gray-900 ${rounded.card} text-sm font-medium hover:${colors.bg} hover:${colors.text} shadow-sm transition-all`}>
              # {tag.name}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}

// ============ 分类列表 - 彩色卡片网格 ============
function CategoryList({ categories, config = defaultConfig }: CategoryListProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme] || colorSchemes.purple;
  const rounded = roundedClasses[config.roundedCorners] || roundedClasses.large;
  const gridClass = gridClasses[config.gridColumns] || gridClasses['3'];

  const gradients = [
    'from-violet-500 to-purple-600',
    'from-fuchsia-500 to-pink-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-indigo-500 to-violet-600',
  ];

  // 展平分类（包含子分类）
  const flatCategories: { category: any; isChild: boolean; parentIndex: number }[] = [];
  categories.forEach((category, index) => {
    flatCategories.push({ category, isChild: false, parentIndex: index });
    category.children?.forEach((child: any) => {
      flatCategories.push({ category: child, isChild: true, parentIndex: index });
    });
  });

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className={`text-4xl font-black bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>分类</h1>
        <p className="text-gray-500 mt-2">探索不同领域的精彩内容</p>
      </div>
      <div className={`grid grid-cols-1 ${gridClass} gap-6`}>
        {flatCategories.map(({ category, isChild, parentIndex }) => (
          <Link
            key={category.id}
            href={`/?category=${category.id}`}
            className={`bg-gradient-to-br ${gradients[parentIndex % gradients.length]} ${rounded.card} ${isChild ? 'p-4 opacity-90' : 'p-6'} text-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className={`${isChild ? 'text-base' : 'text-xl'} font-bold`}>
                {isChild && <span className="opacity-60 mr-1">└</span>}
                {category.name}
              </h2>
              <span className={`${isChild ? 'text-xl' : 'text-3xl'} font-black opacity-50`}>{category._count?.articles || 0}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ============ 标签列表 - 彩色标签云 ============
function TagList({ tags, config = defaultConfig }: TagListProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme] || colorSchemes.purple;
  const rounded = roundedClasses[config.roundedCorners] || roundedClasses.large;

  const tagColors = [
    'bg-violet-100 text-violet-700 hover:bg-violet-200',
    'bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200',
    'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
    'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    'bg-orange-100 text-orange-700 hover:bg-orange-200',
    'bg-pink-100 text-pink-700 hover:bg-pink-200',
  ];

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className={`text-4xl font-black bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>标签</h1>
        <p className="text-gray-500 mt-2">通过标签快速找到感兴趣的内容</p>
      </div>
      <div className={`bg-white dark:bg-gray-900 ${rounded.card} p-8 shadow-sm`}>
        <div className="flex flex-wrap gap-3 justify-center">
          {tags.map((tag, index) => {
            const count = tag._count?.articles || 0;
            const size = count > 10 ? 'text-lg px-5 py-2.5' : count > 5 ? 'text-base px-4 py-2' : 'text-sm px-3 py-1.5';
            return (
              <Link key={tag.id} href={`/?tag=${tag.id}`}
                className={`${tagColors[index % tagColors.length]} ${size} ${rounded.button} font-medium transition-all dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-violet-900/30`}>
                #{tag.name}
                <span className="ml-1 opacity-60">({count})</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ 搜索结果 - 卡片列表 ============
function SearchResults({ articles, total, query, config = defaultConfig }: SearchResultProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme] || colorSchemes.purple;
  const rounded = roundedClasses[config.roundedCorners] || roundedClasses.large;
  const gridClass = gridClasses[config.gridColumns] || gridClasses['3'];

  if (!query) return null;
  return (
    <div>
      <div className="text-center mb-8">
        <p className="text-gray-500">
          找到 <span className={`${colors.text} font-bold`}>{total}</span> 篇关于 
          "<span className={`${colors.text} font-medium`}>{query}</span>" 的文章
        </p>
      </div>
      <div className={`grid grid-cols-1 ${gridClass} gap-6`}>
        {articles.map((article) => (
          <div key={article.id} className={`bg-white dark:bg-gray-900 ${rounded.card} p-6 shadow-sm hover:shadow-lg transition-shadow`}>
            <Link href={`/article/${article.slug}`}>
              <h2 className={`font-bold text-lg hover:${colors.text} transition-colors`}>{article.title}</h2>
            </Link>
            <p className="text-gray-500 text-sm mt-2 line-clamp-2">{truncate(article.excerpt || article.content, 100)}</p>
            <div className="flex items-center gap-3 mt-4">
              <time className="text-xs text-gray-400">{formatDate(article.publishedAt || article.createdAt)}</time>
              {article.tags?.slice(0, 2).map((tag) => (
                <span key={tag.id} className={`px-2 py-1 ${colors.bg} ${colors.text} text-xs ${rounded.button}`}>
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const MagazineTheme: ThemeComponents = {
  name: 'magazine',
  displayName: '杂志主题',
  description: '大图卡片网格布局，紫粉渐变，现代视觉风格',
  configOptions,
  defaultConfig,
  BlogLayout,
  ArticleCard,
  ArticleDetail,
  CategoryList,
  TagList,
  SearchResults,
};
