// 活力主题 - 幻彩流体背景，明亮色调，圆润卡片，充满活力
import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '../../components/ThemeToggle';
import { SearchBox } from '../../components/SearchBox';
import { DesktopNavMenu, MobileNavMenu } from '../../components/NavMenu';
import { formatDate, truncate } from '../../lib/utils';
import { useSiteSettingsContext } from '../../contexts/site-settings-context';
import {
  Clock,
  Sparkles,
  ChevronRight,
  Heart,
  Rocket,
  Command,
  Eye,
  Tag,
  Folder,
  Search,
  Smile,
} from 'lucide-react';
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
    key: 'colorScheme',
    label: '配色方案',
    type: 'select',
    options: [
      { value: 'rainbow', label: '彩虹渐变' },
      { value: 'sunset', label: '日落暖色' },
      { value: 'ocean', label: '海洋清新' },
      { value: 'forest', label: '森林自然' },
    ],
    default: 'rainbow',
    description: '整体配色风格',
  },
  {
    key: 'showBlobs',
    label: '显示流体背景',
    type: 'boolean',
    default: true,
    description: '显示动态漂浮的彩色团块',
  },
  {
    key: 'showDots',
    label: '显示点阵背景',
    type: 'boolean',
    default: true,
    description: '显示装饰性点阵图案',
  },
  {
    key: 'showFeaturedImage',
    label: '显示特色图',
    type: 'boolean',
    default: true,
    description: '在文章卡片中显示特色图片',
  },
  {
    key: 'showArticleDetailFeaturedImage',
    label: '文章页显示特色图',
    type: 'boolean',
    default: true,
    description: '在文章详情页显示特色图片',
  },
  {
    key: 'showEmoji',
    label: '显示表情装饰',
    type: 'boolean',
    default: true,
    description: '在文章卡片中显示随机表情',
  },
  {
    key: 'cardStyle',
    label: '卡片样式',
    type: 'select',
    options: [
      { value: 'glass', label: '玻璃磨砂' },
      { value: 'solid', label: '纯白卡片' },
      { value: 'gradient', label: '渐变边框' },
    ],
    default: 'glass',
    description: '文章卡片的视觉样式',
  },
  {
    key: 'cardRadius',
    label: '卡片圆角',
    type: 'select',
    options: [
      { value: 'medium', label: '中等圆角' },
      { value: 'large', label: '大圆角' },
      { value: 'pill', label: '胶囊圆角' },
    ],
    default: 'large',
    description: '卡片的圆角大小',
  },
  {
    key: 'gridColumns',
    label: '网格列数',
    type: 'select',
    options: [
      { value: '1', label: '1列' },
      { value: '2', label: '2列' },
      { value: '3', label: '3列' },
    ],
    default: '3',
    description: '文章卡片的列数',
  },
  {
    key: 'excerptLength',
    label: '摘要长度',
    type: 'number',
    default: 120,
    description: '文章摘要显示的字符数',
  },
  {
    key: 'showClock',
    label: '显示时钟',
    type: 'boolean',
    default: true,
    description: '在导航栏显示实时时钟',
  },
  {
    key: 'heroEmoji',
    label: 'Hero 表情',
    type: 'text',
    default: '✨',
    description: '首页欢迎标签的表情符号',
  },
  {
    key: 'heroTitle',
    label: 'Hero 标题',
    type: 'text',
    default: 'Bright Thinking.',
    description: '首页大标题文字',
  },
  {
    key: 'heroSubtitle',
    label: 'Hero 副标题',
    type: 'text',
    default: '我们不仅仅是在构建软件，而是在创造有温度的交互。告别沉闷，拥抱一个充满活力的数字世界。',
    description: '首页副标题文字',
  },
];

const defaultConfig: ThemeConfig = {
  colorScheme: 'rainbow',
  showBlobs: true,
  showDots: true,
  showFeaturedImage: true,
  showArticleDetailFeaturedImage: true,
  showEmoji: true,
  cardStyle: 'glass',
  cardRadius: 'large',
  gridColumns: '3',
  excerptLength: 120,
  showClock: true,
  heroEmoji: '✨',
  heroTitle: 'Bright Thinking.',
  heroSubtitle: '我们不仅仅是在构建软件，而是在创造有温度的交互。告别沉闷，拥抱一个充满活力的数字世界。',
};

// 配色方案
const colorSchemes: Record<string, { primary: string; secondary: string; accent: string; gradient: string }> = {
  rainbow: {
    primary: '#6366f1', // indigo
    secondary: '#ec4899', // pink
    accent: '#84cc16', // lime
    gradient: 'from-indigo-500 via-pink-500 to-lime-400',
  },
  sunset: {
    primary: '#f97316', // orange
    secondary: '#ef4444', // red
    accent: '#eab308', // yellow
    gradient: 'from-orange-500 via-red-500 to-yellow-400',
  },
  ocean: {
    primary: '#0ea5e9', // sky
    secondary: '#06b6d4', // cyan
    accent: '#8b5cf6', // violet
    gradient: 'from-sky-500 via-cyan-500 to-violet-400',
  },
  forest: {
    primary: '#22c55e', // green
    secondary: '#14b8a6', // teal
    accent: '#84cc16', // lime
    gradient: 'from-green-500 via-teal-500 to-lime-400',
  },
};

// 圆角映射
const radiusClasses: Record<string, { card: string; button: string; tag: string }> = {
  medium: { card: 'rounded-2xl', button: 'rounded-xl', tag: 'rounded-lg' },
  large: { card: 'rounded-[32px]', button: 'rounded-2xl', tag: 'rounded-full' },
  pill: { card: 'rounded-[40px]', button: 'rounded-full', tag: 'rounded-full' },
};

// 网格列数映射
const gridClasses: Record<string, string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

// 卡片颜色数组
const cardColors = ['#bef264', '#f472b6', '#60a5fa', '#fbbf24', '#a78bfa', '#34d399'];
const cardEmojis = ['🌈', '⚡', '🌊', '🔥', '💜', '🌿', '✨', '🚀', '💡', '🎯'];


// ============ 幻彩流体背景 ============
function ChromaticBackground({ config }: { config: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme] || colorSchemes.rainbow;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#fafafa] dark:bg-slate-950">
      {/* 动态漂浮的彩色团块 */}
      {config.showBlobs && (
        <>
          <div
            className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] animate-pulse"
            style={{ backgroundColor: `${colors.accent}30` }}
          />
          <div
            className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] animate-pulse"
            style={{ backgroundColor: `${colors.secondary}20`, animationDelay: '2s' }}
          />
          <div
            className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full blur-[120px] animate-pulse"
            style={{ backgroundColor: `${colors.primary}30`, animationDelay: '4s' }}
          />
        </>
      )}
      {/* 装饰性的点阵网格 */}
      {config.showDots && (
        <div className="absolute inset-0 opacity-[0.1] dark:opacity-[0.05] bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:30px_30px]" />
      )}
    </div>
  );
}

// ============ 实时时钟 ============
function ClockDisplay({ config }: { config: ThemeConfig }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!config.showClock) return null;

  return (
    <div className="hidden sm:flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
      <Clock size={14} className="text-slate-400" />
      <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">{time}</span>
    </div>
  );
}

// ============ 布局 ============
function BlogLayout({ children, config = defaultConfig }: { children: ReactNode; config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme] || colorSchemes.rainbow;
  const radius = radiusClasses[config.cardRadius] || radiusClasses.large;
  const { settings, navMenu } = useSiteSettingsContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const siteName = settings.siteName || 'NextBlog';
  const siteLogo = settings.siteLogo;
  const footerText = settings.footerText?.replace('{year}', new Date().getFullYear().toString())
    || `© ${new Date().getFullYear()} ${siteName}`;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans selection:bg-pink-100 dark:selection:bg-pink-900/30 overflow-x-hidden relative pb-24">
      <ChromaticBackground config={config} />

      {/* 浮动导航栏 */}
      <header className="sticky top-4 md:top-6 mx-auto max-w-6xl z-50 px-4">
        <div className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white dark:border-slate-800 ${radius.card} shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] h-16 flex items-center justify-between px-4 md:px-6`}>
          <Link href="/" className="flex items-center gap-3 group cursor-pointer shrink-0">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="h-10 w-auto" />
            ) : (
              <div
                className={`w-10 h-10 bg-gradient-to-br ${colors.gradient} ${radius.button} flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform`}
              >
                <Command size={20} className="text-white" />
              </div>
            )}
            <span className="font-black text-xl tracking-tighter leading-none hidden sm:block">
              {siteName}<span style={{ color: colors.secondary }}>.</span>
            </span>
          </Link>

          <DesktopNavMenu
            items={navMenu}
            itemClassName="px-3 py-2 text-sm font-bold uppercase tracking-wider text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
          />

          <div className="flex items-center gap-2 md:gap-4">
            <ClockDisplay config={config} />
            <SearchBox />
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden w-10 h-10 ${radius.button} bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center`}
              aria-label="菜单"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <MobileNavMenu items={navMenu} onClose={() => setMobileMenuOpen(false)} />
        )}
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-24">
        {children}
      </main>

      <footer className="relative z-10 mt-24 py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`w-8 h-8 bg-gradient-to-br ${colors.gradient} ${radius.button} flex items-center justify-center`}>
              <Heart size={14} className="text-white" />
            </div>
            <span className="font-black text-slate-400 dark:text-slate-500 text-sm uppercase tracking-widest">
              {footerText}
            </span>
          </div>
          <div className="flex justify-center gap-6 text-[11px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-600">
            <Link href="/categories" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">分类</Link>
            <Link href="/tags" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">标签</Link>
            <Link href="/about" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">关于</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


// ============ 文章卡片 - 弹性活力卡片 ============
function ArticleCard({ article, config = defaultConfig }: ArticleCardProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme] || colorSchemes.rainbow;
  const radius = radiusClasses[config.cardRadius] || radiusClasses.large;
  const excerptLength = config.excerptLength || 120;
  const showEmoji = config.showEmoji !== false;
  const showFeaturedImage = config.showFeaturedImage !== false;

  // 基于文章 ID 生成稳定的颜色和表情
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };
  const cardColor = cardColors[hashCode(article.id) % cardColors.length];
  const cardEmoji = cardEmojis[hashCode(article.id) % cardEmojis.length];

  const cardClasses = {
    glass: 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-2 border-white dark:border-slate-700 hover:bg-white/90 dark:hover:bg-slate-900/90',
    solid: 'bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600',
    gradient: 'bg-white dark:bg-slate-900 border-2 border-transparent bg-clip-padding hover:shadow-xl',
  };

  return (
    <article
      className={`group relative ${radius.card} overflow-hidden flex flex-col transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.02] hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.4)] ${cardClasses[config.cardStyle as keyof typeof cardClasses] || cardClasses.glass}`}
    >
      {/* 特色图片 */}
      {showFeaturedImage && article.featuredImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 dark:from-slate-900/90 to-transparent" />
        </div>
      )}

      <div className={`p-6 md:p-8 flex flex-col flex-1 ${showFeaturedImage && article.featuredImage ? '' : ''}`}>
        {/* 卡片内部色彩点缀 */}
        <div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity duration-500"
          style={{ backgroundColor: cardColor }}
        />

        <div className="flex justify-between items-center mb-6 md:mb-8 relative z-10">
          <div className="flex items-center gap-3">
            {showEmoji && (
              <div
                className={`w-12 h-12 ${radius.button} flex items-center justify-center text-2xl shadow-inner`}
                style={{ backgroundColor: `${cardColor}20` }}
              >
                {cardEmoji}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase leading-none mb-1">
                Article
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tighter">
                {article.category?.name || 'Blog'}
              </span>
            </div>
          </div>
          <div className={`w-10 h-10 ${radius.button} bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-600 group-hover:rotate-12 transition-transform`}>
            <Sparkles size={16} className="text-slate-300 dark:text-slate-500 group-hover:text-amber-400" />
          </div>
        </div>

        <Link href={`/article/${article.slug}`}>
          <h3
            className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 line-clamp-2 transition-colors duration-300"
            style={{ 
              color: undefined 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = cardColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '';
            }}
          >
            {article.title}
          </h3>
        </Link>

        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 md:mb-10 font-medium flex-1 line-clamp-3">
          {truncate(article.excerpt || article.content, excerptLength)}
        </p>

        <div className="mt-auto flex flex-col gap-4 md:gap-6">
          <div className="flex flex-wrap gap-2">
            {article.tags?.slice(0, 3).map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.id}`}
                className={`text-[9px] font-black px-3 py-1 bg-slate-100/50 dark:bg-slate-800/70 ${radius.tag} text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-200 transition-colors`}
              >
                {tag.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Eye size={12} /> {article.viewCount || 0}
              </span>
              <span>{formatDate(article.publishedAt || article.createdAt).split(' ')[0]}</span>
            </div>

            <Link
              href={`/article/${article.slug}`}
              className={`px-4 py-2 ${radius.button} flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden group/btn`}
              style={{ backgroundColor: `${cardColor}15`, color: cardColor }}
            >
              <span className="relative z-10">Read</span>
              <ChevronRight size={14} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

// ============ 文章详情 ============
function ArticleDetail({ article, config = defaultConfig }: ArticleDetailProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme] || colorSchemes.rainbow;
  const radius = radiusClasses[config.cardRadius] || radiusClasses.large;
  const showArticleDetailFeaturedImage = config.showArticleDetailFeaturedImage !== false;

  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };
  const cardColor = cardColors[hashCode(article.id) % cardColors.length];

  return (
    <article>
      {/* Hero Header */}
      <header className="text-center mb-12 md:mb-16">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 ${radius.tag} shadow-sm border border-slate-100 dark:border-slate-800 text-[10px] font-black mb-8 uppercase tracking-[0.3em]`}
          style={{ color: colors.primary }}
        >
          <Smile size={14} /> {article.category?.name || 'Article'}
        </div>

        <h1
          className={`text-4xl md:text-6xl font-black tracking-tight mb-8 leading-tight text-transparent bg-clip-text bg-gradient-to-r ${colors.gradient}`}
        >
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <Clock size={14} /> {formatDate(article.publishedAt || article.createdAt)}
          </span>
          {article.author && (
            <span className="flex items-center gap-2">
              <Rocket size={14} /> {article.author.username}
            </span>
          )}
          <span className="flex items-center gap-2">
            <Eye size={14} /> {article.viewCount || 0} views
          </span>
        </div>
      </header>

      {/* 特色图片 */}
      {showArticleDetailFeaturedImage && article.featuredImage && (
        <div className={`mb-12 ${radius.card} overflow-hidden shadow-xl`}>
          <img src={article.featuredImage} alt={article.title} className="w-full aspect-video object-cover" />
        </div>
      )}

      {/* 内容区域 */}
      <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ${radius.card} p-6 md:p-12 shadow-xl border border-white dark:border-slate-800`}>
        <div
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-code:text-indigo-500 prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800 prose-pre:rounded-2xl"
          style={{ 
            ['--tw-prose-links' as string]: colors.primary,
          }}
          dangerouslySetInnerHTML={{ __html: article.htmlContent || article.content }}
        />
      </div>

      {/* 标签 */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          {article.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.id}`}
              className={`px-5 py-2.5 bg-white dark:bg-slate-900 ${radius.tag} text-sm font-bold uppercase shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all`}
              style={{ color: cardColor }}
            >
              # {tag.name}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}


// ============ 分类列表 ============
function CategoryList({ categories, config = defaultConfig }: CategoryListProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme] || colorSchemes.rainbow;
  const radius = radiusClasses[config.cardRadius] || radiusClasses.large;

  // 展平分类
  const flatCategories: { category: CategoryListProps['categories'][0]; isChild: boolean }[] = [];
  categories.forEach((category) => {
    flatCategories.push({ category, isChild: false });
    category.children?.forEach((child) => {
      flatCategories.push({ category: child as CategoryListProps['categories'][0], isChild: true });
    });
  });

  return (
    <div>
      <div className="text-center mb-12 md:mb-16">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 ${radius.tag} shadow-sm border border-slate-100 dark:border-slate-700 text-[10px] font-black mb-8 uppercase tracking-[0.3em]`}
          style={{ color: colors.primary }}
        >
          <Folder size={14} /> Categories
        </div>
        <h1 className={`text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${colors.gradient}`}>
          分类目录
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flatCategories.map(({ category, isChild }, index) => {
          const cardColor = cardColors[index % cardColors.length];
          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={`group relative ${radius.card} bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-2 border-white dark:border-slate-700 p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl ${isChild ? 'ml-4' : ''}`}
            >
              <div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20 dark:opacity-30 group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: cardColor }}
              />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div
                  className={`w-14 h-14 ${radius.button} flex items-center justify-center text-2xl`}
                  style={{ backgroundColor: `${cardColor}20` }}
                >
                  📁
                </div>
                <span className="text-4xl font-black text-slate-200 dark:text-slate-600 font-mono">
                  {String(category._count?.articles || 0).padStart(2, '0')}
                </span>
              </div>
              <h2
                className={`text-xl font-black text-slate-800 dark:text-slate-100 mb-2 group-hover:text-transparent group-hover:bg-clip-text transition-all`}
                style={{ backgroundImage: `linear-gradient(to right, ${cardColor}, ${colors.secondary})` }}
              >
                {isChild && <span className="text-slate-300 dark:text-slate-600 mr-2">└</span>}
                {category.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                {category._count?.articles || 0} 篇文章
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ============ 标签列表 ============
function TagList({ tags, config = defaultConfig }: TagListProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme] || colorSchemes.rainbow;
  const radius = radiusClasses[config.cardRadius] || radiusClasses.large;

  return (
    <div>
      <div className="text-center mb-12 md:mb-16">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 ${radius.tag} shadow-sm border border-slate-100 dark:border-slate-700 text-[10px] font-black mb-8 uppercase tracking-[0.3em]`}
          style={{ color: colors.primary }}
        >
          <Tag size={14} /> Tags
        </div>
        <h1 className={`text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${colors.gradient}`}>
          标签云
        </h1>
      </div>

      <div className={`bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl ${radius.card} p-8 md:p-12 border-2 border-white dark:border-slate-700`}>
        <div className="flex flex-wrap gap-4 justify-center">
          {tags.map((tag, index) => {
            const count = tag._count?.articles || 0;
            const size = count > 10 ? 'text-lg px-6 py-3' : count > 5 ? 'text-base px-5 py-2.5' : 'text-sm px-4 py-2';
            const cardColor = cardColors[index % cardColors.length];
            return (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className={`${size} ${radius.tag} font-black uppercase bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-600 hover:shadow-md hover:scale-105 transition-all`}
                style={{ color: cardColor }}
              >
                #{tag.name}
                <span className="ml-2 text-slate-400 dark:text-slate-500">({count})</span>
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
  const colors = colorSchemes[config.colorScheme] || colorSchemes.rainbow;
  const radius = radiusClasses[config.cardRadius] || radiusClasses.large;
  const gridClass = gridClasses[config.gridColumns] || gridClasses['3'];

  if (!query) return null;

  return (
    <div>
      <div className="text-center mb-12">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 ${radius.tag} shadow-sm border border-slate-100 dark:border-slate-700 text-[10px] font-black mb-8 uppercase tracking-[0.3em]`}
          style={{ color: colors.primary }}
        >
          <Search size={14} /> Search Results
        </div>
        <p className="text-lg font-bold text-slate-600 dark:text-slate-400">
          找到 <span style={{ color: colors.primary }}>{total}</span> 篇关于
          "<span style={{ color: colors.secondary }}>{query}</span>" 的文章
        </p>
      </div>

      <div className={`grid ${gridClass} gap-6`}>
        {articles.map((article, index) => {
          const cardColor = cardColors[index % cardColors.length];
          return (
            <Link
              key={article.id}
              href={`/article/${article.slug}`}
              className={`group ${radius.card} bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-2 border-white dark:border-slate-700 p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl`}
            >
              <h2
                className="font-black text-lg text-slate-800 dark:text-slate-100 mb-3 group-hover:text-transparent group-hover:bg-clip-text transition-all line-clamp-2"
                style={{ backgroundImage: `linear-gradient(to right, ${cardColor}, ${colors.secondary})` }}
              >
                {article.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4">
                {truncate(article.excerpt || article.content, 100)}
              </p>
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                <span>{formatDate(article.publishedAt || article.createdAt).split(' ')[0]}</span>
                {article.tags?.slice(0, 2).map((tag) => (
                  <span key={tag.id} className={`px-2 py-0.5 ${radius.tag}`} style={{ backgroundColor: `${cardColor}20`, color: cardColor }}>
                    {tag.name}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export const VibrantTheme: ThemeComponents = {
  name: 'vibrant',
  displayName: '活力主题',
  description: '幻彩流体背景，明亮色调，圆润卡片，充满活力与创意',
  configOptions,
  defaultConfig,
  BlogLayout,
  ArticleCard,
  ArticleDetail,
  CategoryList,
  TagList,
  SearchResults,
};
