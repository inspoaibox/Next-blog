// 杂志主题 - 大图卡片网格，紫粉渐变，现代视觉
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
    key: 'gridColumns',
    label: '网格列数',
    type: 'select',
    options: [
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
  gridColumns: '3',
  cardStyle: 'gradient',
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
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-2 lg:grid-cols-3',
  '4': 'md:grid-cols-2 lg:grid-cols-4',
};

// ============ 布局 - 宽屏现代 ============
function BlogLayout({ children, config = defaultConfig }: { children: ReactNode; config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme] || colorSchemes.purple;
  const rounded = roundedClasses[config.roundedCorners] || roundedClasses.large;
  const { settings, fetchSettings, getNavMenu } = useSiteSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const siteName = settings.siteName || 'NextBlog';
  const footerText = settings.footerText?.replace('{year}', new Date().getFullYear().toString()) 
    || `© ${new Date().getFullYear()} ${siteName}`;
  const navMenu = getNavMenu();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${colors.gradient} ${rounded.button} flex items-center justify-center text-white font-bold text-lg`}>{siteName[0]}</div>
            <span className={`text-xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>{siteName}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navMenu.map((item) => (
              item.type === 'external' ? (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                  className={`px-4 py-2 ${rounded.button} text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all`}>
                  {item.label}
                </a>
              ) : (
                <Link key={item.id} to={item.url}
                  className={`px-4 py-2 ${rounded.button} text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all`}>
                  {item.label}
                </Link>
              )
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">{children}</main>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`w-8 h-8 bg-gradient-to-br ${colors.gradient} ${rounded.button} flex items-center justify-center text-white font-bold text-sm`}>{siteName[0]}</div>
            <span className="font-bold text-white">{siteName}</span>
          </div>
          <p className="text-sm">{footerText}</p>
        </div>
      </footer>
    </div>
  );
}

// ============ 文章卡片 - 大图卡片 ============
function ArticleCard({ article, config = defaultConfig }: ArticleCardProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme] || colorSchemes.purple;
  const rounded = roundedClasses[config.roundedCorners] || roundedClasses.large;

  const gradients = [
    'from-violet-500 to-purple-600',
    'from-fuchsia-500 to-pink-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
  ];
  const gradient = gradients[article.title.length % gradients.length];

  const isSimple = config.cardStyle === 'simple';

  return (
    <article className={`group bg-white dark:bg-gray-900 ${rounded.card} overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2`}>
      {!isSimple && (
        <div className={`aspect-[16/10] bg-gradient-to-br ${gradient} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
          {article.category && (
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm ${rounded.button} text-xs font-semibold`}>
                {article.category.name}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-tl-full" />
        </div>
      )}
      <div className="p-6">
        <time className="text-xs text-gray-500">{formatDate(article.publishedAt || article.createdAt)}</time>
        <Link to={`/article/${article.slug}`}>
          <h2 className={`text-lg font-bold mt-2 mb-3 group-hover:${colors.text} transition-colors line-clamp-2`}>{article.title}</h2>
        </Link>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{truncate(article.excerpt || article.content, 100)}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {article.tags?.slice(0, 2).map((tag) => (
              <Link key={tag.id} to={`/?tag=${tag.id}`}
                className={`px-2 py-1 bg-gray-100 dark:bg-gray-800 ${rounded.button} text-xs hover:${colors.bg} hover:${colors.text} transition-colors`}>
                {tag.name}
              </Link>
            ))}
          </div>
          <Link to={`/article/${article.slug}`} className={`${colors.text} text-sm font-medium`}>阅读 →</Link>
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

      <div className={`bg-white dark:bg-gray-900 ${rounded.card} p-8 md:p-12 shadow-sm`}>
        <div className={`prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:${colors.text}`}
          dangerouslySetInnerHTML={{ __html: article.htmlContent || article.content }} />
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3">
          {article.tags.map((tag) => (
            <Link key={tag.id} to={`/?tag=${tag.id}`}
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

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className={`text-4xl font-black bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>分类</h1>
        <p className="text-gray-500 mt-2">探索不同领域的精彩内容</p>
      </div>
      <div className={`grid grid-cols-1 ${gridClass} gap-6`}>
        {categories.map((category, index) => (
          <Link key={category.id} to={`/?category=${category.id}`}
            className={`bg-gradient-to-br ${gradients[index % gradients.length]} ${rounded.card} p-6 text-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{category.name}</h2>
              <span className="text-3xl font-black opacity-50">{category._count?.articles || 0}</span>
            </div>
            {category.description && <p className="text-white/80 text-sm">{category.description}</p>}
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
              <Link key={tag.id} to={`/?tag=${tag.id}`}
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
            <Link to={`/article/${article.slug}`}>
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
