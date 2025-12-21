// Aether Bloom 主题 - 以太花语：有机感博客，自然呼吸的排版体验
import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '../../components/ThemeToggle';
import { SearchBox } from '../../components/SearchBox';
import { DesktopNavMenu, MobileNavMenu } from '../../components/NavMenu';
import { formatDate, truncate } from '../../lib/utils';
import { useSiteSettingsContext } from '../../contexts/site-settings-context';
import {
  Wind,
  Sparkles,
  Heart,
  Feather,
  CloudSun,
  ChevronRight,
  Flower2,
  Bird,
  Eye,
  Clock,
  Folder,
  Tag,
  Search,
  Layers,
  Hash,
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
    key: 'lightingMode',
    label: '环境光调色板',
    type: 'select',
    options: [
      { value: 'morning', label: '晨曦 (Soft Morning)' },
      { value: 'afternoon', label: '午后 (Golden Hour)' },
      { value: 'sunset', label: '晚霞 (Honey Glow)' },
      { value: 'mint', label: '薄荷 (Fresh Mint)' },
    ],
    default: 'morning',
    description: '整体色调氛围',
  },
  {
    key: 'maxWidth',
    label: '全局最大宽度',
    type: 'select',
    options: [
      { value: 'narrow', label: '标准 (窄)' },
      { value: 'medium', label: '宽绰 (中)' },
      { value: 'wide', label: '全屏视角 (宽)' },
    ],
    default: 'medium',
    description: '页面内容区域的最大宽度',
  },
  {
    key: 'articleCardLayout',
    label: '列表卡片布局',
    type: 'select',
    options: [
      { value: 'organic', label: '有机交错 (叙事感)' },
      { value: 'classic', label: '经典对齐 (结构感)' },
    ],
    default: 'organic',
    description: '文章列表的展示方式',
  },
  {
    key: 'articleDetailLayout',
    label: '详情页排版',
    type: 'select',
    options: [
      { value: 'manuscript', label: '手稿模式 (居中聚焦)' },
      { value: 'immersive', label: '沉浸模式 (全屏画卷)' },
    ],
    default: 'manuscript',
    description: '文章详情页的排版风格',
  },
  {
    key: 'showFeaturedImage',
    label: '显示特色图片',
    type: 'boolean',
    default: true,
    description: '在文章卡片和详情页显示特色图',
  },
  {
    key: 'paperTextureEnabled',
    label: '开启纸张触感',
    type: 'boolean',
    default: true,
    description: '添加微妙的纸张纹理效果',
  },
  {
    key: 'showAiSpirit',
    label: '显示精灵助手',
    type: 'boolean',
    default: true,
    description: '在页面右下角显示AI精灵',
  },
  {
    key: 'excerptLength',
    label: '摘要长度',
    type: 'number',
    default: 150,
    description: '文章摘要显示的字符数',
  },
  {
    key: 'readMoreText',
    label: '阅读全文按钮',
    type: 'text',
    default: '拾起花语',
    description: '阅读更多按钮的文字',
  },
  {
    key: 'categoryLabel',
    label: '分类标签前缀',
    type: 'text',
    default: '归于',
    description: '分类名称前的文字',
  },
  {
    key: 'aiSpiritGreeting',
    label: '精灵问候语',
    type: 'text',
    default: '你好，旅人。我是此地的灵。需要我为你解读这朵花语吗？',
    description: 'AI精灵的问候文字',
  },
  {
    key: 'heroTagline',
    label: 'Hero 标签',
    type: 'text',
    default: 'Natural Protocol',
    description: '首页标签文字',
  },
];

const defaultConfig: ThemeConfig = {
  lightingMode: 'morning',
  maxWidth: 'medium',
  articleCardLayout: 'organic',
  articleDetailLayout: 'manuscript',
  showFeaturedImage: true,
  paperTextureEnabled: true,
  showAiSpirit: true,
  excerptLength: 150,
  readMoreText: '拾起花语',
  categoryLabel: '归于',
  aiSpiritGreeting: '你好，旅人。我是此地的灵。需要我为你解读这朵花语吗？',
  heroTagline: 'Natural Protocol',
};

// 增强的色调定义系统 - 支持明暗模式
const vibeStyles: Record<string, {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  darkBg: string;
  text: string;
  darkText: string;
  title: string;
  darkTitle: string;
  cardBg: string;
  darkCardBg: string;
}> = {
  morning: {
    primary: '#60a5fa',
    secondary: '#fef3c7',
    accent: '#34d399',
    bg: 'bg-[#f8fafc]',
    darkBg: 'dark:bg-slate-950',
    text: 'text-stone-600',
    darkText: 'dark:text-stone-300',
    title: 'text-stone-800',
    darkTitle: 'dark:text-stone-100',
    cardBg: 'bg-white/40',
    darkCardBg: 'dark:bg-slate-900/40',
  },
  afternoon: {
    primary: '#fb923c',
    secondary: '#fff7ed',
    accent: '#facc15',
    bg: 'bg-[#fffbeb]',
    darkBg: 'dark:bg-amber-950',
    text: 'text-stone-700',
    darkText: 'dark:text-amber-100',
    title: 'text-amber-950',
    darkTitle: 'dark:text-amber-50',
    cardBg: 'bg-white/50',
    darkCardBg: 'dark:bg-amber-900/30',
  },
  sunset: {
    primary: '#f472b6',
    secondary: '#fff1f2',
    accent: '#fb923c',
    bg: 'bg-[#fff1f2]',
    darkBg: 'dark:bg-rose-950',
    text: 'text-rose-900/70',
    darkText: 'dark:text-rose-100',
    title: 'text-rose-950',
    darkTitle: 'dark:text-rose-50',
    cardBg: 'bg-white/50',
    darkCardBg: 'dark:bg-rose-900/30',
  },
  mint: {
    primary: '#2dd4bf',
    secondary: '#f0fdfa',
    accent: '#4ade80',
    bg: 'bg-[#f0fdfa]',
    darkBg: 'dark:bg-teal-950',
    text: 'text-teal-900/70',
    darkText: 'dark:text-teal-100',
    title: 'text-teal-950',
    darkTitle: 'dark:text-teal-50',
    cardBg: 'bg-white/50',
    darkCardBg: 'dark:bg-teal-900/30',
  },
};

// 宽度映射
const widthClasses: Record<string, string> = {
  narrow: 'max-w-4xl',
  medium: 'max-w-6xl',
  wide: 'max-w-7xl',
};


// ============ 背景组件 ============
function OrganicBackground({ config }: { config: ThemeConfig }) {
  const style = vibeStyles[config.lightingMode as string] || vibeStyles.morning;

  return (
    <div className={`fixed inset-0 -z-10 ${style.bg} ${style.darkBg} transition-colors duration-1000`}>
      {/* 动态光晕 */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-30 dark:opacity-20 animate-pulse"
        style={{ backgroundColor: style.secondary }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full blur-[100px] opacity-20 dark:opacity-15 animate-pulse"
        style={{ backgroundColor: style.accent, animationDelay: '2s' }}
      />
      {/* 纸张纹理 */}
      {config.paperTextureEnabled && (
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none mix-blend-multiply dark:mix-blend-screen"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      )}
    </div>
  );
}

// ============ 精灵助手 ============
function AiSpirit({ config }: { config: ThemeConfig }) {
  const style = vibeStyles[config.lightingMode as string] || vibeStyles.morning;
  const greeting = config.aiSpiritGreeting || defaultConfig.aiSpiritGreeting;

  if (!config.showAiSpirit) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] group">
      <div
        className="absolute inset-0 blur-2xl scale-150 animate-pulse opacity-30"
        style={{ backgroundColor: style.primary }}
      />
      <button
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110"
        style={{ backgroundColor: style.secondary }}
        aria-label="AI 精灵助手"
      >
        <Sparkles style={{ color: style.primary }} size={24} />
      </button>
      <div className="absolute bottom-full right-0 mb-6 w-64 p-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/60 dark:border-slate-700 rounded-[2rem] shadow-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all pointer-events-none group-hover:pointer-events-auto">
        <p className="text-xs font-medium leading-relaxed italic text-stone-600 dark:text-stone-300">
          "{greeting}"
        </p>
      </div>
    </div>
  );
}

// ============ 核心布局组件 ============
function BlogLayout({ children, config = defaultConfig }: { children: ReactNode; config?: ThemeConfig }) {
  const style = vibeStyles[config.lightingMode as string] || vibeStyles.morning;
  const maxWidth = widthClasses[config.maxWidth as string] || widthClasses.medium;
  const { settings, navMenu } = useSiteSettingsContext();
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const siteName = settings.siteName || '以太花语';
  const siteSlogan = settings.siteDescription || '在这里，打破像素的桎梏。每一段文字都是一颗种子。';
  const heroTagline = config.heroTagline || 'Natural Protocol';
  const footerText = settings.footerText?.replace('{year}', new Date().getFullYear().toString())
    || `© ${new Date().getFullYear()} ${siteName}`;

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const defaultNavItems = [
    { id: '1', label: '时光动态', url: '/', type: 'internal' as const, sortOrder: 0 },
    { id: '2', label: '林间归档', url: '/categories', type: 'internal' as const, sortOrder: 1 },
    { id: '3', label: '标签花园', url: '/tags', type: 'internal' as const, sortOrder: 2 },
    { id: '4', label: '关于', url: '/about', type: 'internal' as const, sortOrder: 3 },
  ];

  const navItems = navMenu.length > 0 ? navMenu : defaultNavItems;

  return (
    <div className={`min-h-screen ${style.text} ${style.darkText} transition-all duration-700 font-serif selection:bg-stone-200 dark:selection:bg-stone-700`}>
      <OrganicBackground config={config} />

      {/* 动态导航 */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 h-20 md:h-24 px-6 md:px-16 flex items-center justify-between transition-all ${
          scrollY > 50
            ? 'backdrop-blur-xl bg-white/40 dark:bg-slate-900/60 shadow-sm border-b border-white/20 dark:border-slate-700/50'
            : ''
        }`}
      >
        <Link href="/" className="flex items-center gap-4 group cursor-pointer">
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-transform group-hover:rotate-12"
            style={{ backgroundColor: style.secondary }}
          >
            <Bird style={{ color: style.primary }} size={24} />
          </div>
          <span className={`text-xl md:text-2xl font-black tracking-tighter ${style.title} ${style.darkTitle}`}>
            {siteName}
          </span>
        </Link>

        {/* 桌面导航 - 使用支持多级菜单的组件 */}
        <DesktopNavMenu
          items={navItems}
          className="hidden md:flex items-center gap-10"
          itemClassName="text-sm font-black uppercase tracking-[0.2em] hover:opacity-100 opacity-50 transition-all relative"
        />
        <div className="hidden md:flex items-center gap-4">
          <SearchBox />
          <ThemeToggle />
        </div>

        {/* 移动端菜单按钮 */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
            style={{ backgroundColor: style.secondary }}
            aria-label="菜单"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* 移动端菜单 - 使用支持多级菜单的组件 */}
      {mobileMenuOpen && (
        <MobileNavMenu items={navItems} onClose={() => setMobileMenuOpen(false)} />
      )}

      {/* 网站 Hero */}
      <header className="pt-40 md:pt-56 pb-24 text-center px-6">
        <div
          className={`inline-flex items-center gap-4 px-5 py-2 rounded-full ${style.cardBg} ${style.darkCardBg} border border-white/60 dark:border-slate-700/60 text-[10px] font-black uppercase tracking-[0.5em] mb-12`}
        >
          <CloudSun size={16} style={{ color: style.primary }} /> {heroTagline}
        </div>
        <h1 className={`text-5xl md:text-[10rem] font-black leading-[0.8] tracking-tighter uppercase mb-8 ${style.title} ${style.darkTitle}`}>
          {siteName.split('').map((char, i) => (
            <span key={i} className={i % 2 !== 0 ? 'font-light italic opacity-40' : ''}>
              {char}
            </span>
          ))}
        </h1>
        <p className="max-w-xl mx-auto text-lg md:text-xl opacity-50 font-medium italic leading-relaxed">
          "{siteSlogan}"
        </p>
      </header>

      {/* 主体内容区 */}
      <main className={`${maxWidth} mx-auto px-6 pb-32`}>{children}</main>

      {/* 页脚 */}
      <footer className="py-20 flex flex-col items-center gap-6 border-t border-stone-200/50 dark:border-slate-700/50">
        <div className="flex gap-8 opacity-30">
          <Heart size={18} />
          <Wind size={18} />
          <Feather size={18} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-30">{footerText}</p>
      </footer>

      {/* 精灵助手 */}
      <AiSpirit config={config} />
    </div>
  );
}


// ============ 文章卡片组件 ============
function ArticleCard({ article, config = defaultConfig }: ArticleCardProps & { config?: ThemeConfig }) {
  const style = vibeStyles[config.lightingMode as string] || vibeStyles.morning;
  const layout = config.articleCardLayout || 'organic';
  const showFeaturedImage = config.showFeaturedImage !== false;
  const excerptLength = config.excerptLength || 150;
  const readMoreText = config.readMoreText || '拾起花语';
  const categoryLabel = config.categoryLabel || '归于';

  // 经典布局
  if (layout === 'classic') {
    return (
      <article className="group mb-20 md:mb-32 flex flex-col gap-8">
        {showFeaturedImage && article.featuredImage && (
          <div className="relative aspect-[21/9] overflow-hidden rounded-[2.5rem] border border-white/40 dark:border-slate-700/40 shadow-sm">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
        )}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatDate(article.publishedAt || article.createdAt)}
            </span>
            <span className="w-4 h-px bg-current" />
            <span>
              {categoryLabel} {article.category?.name || '未分类'}
            </span>
          </div>
          <Link href={`/article/${article.slug}`}>
            <h2 className={`text-3xl md:text-5xl font-black tracking-tighter ${style.title} ${style.darkTitle} hover:opacity-70 transition-opacity`}>
              {article.title}
            </h2>
          </Link>
          <p className="text-lg opacity-60 leading-relaxed italic">
            {truncate(article.excerpt || article.content, excerptLength)}
          </p>
          <Link
            href={`/article/${article.slug}`}
            className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest pt-4 hover:opacity-70 transition-opacity"
          >
            <span className="border-b-2 border-current pb-1">{readMoreText}</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </article>
    );
  }

  // 有机交错布局 (默认) - 图片在上方
  return (
    <article className="group relative flex flex-col gap-6 md:gap-8 mb-20 md:mb-32 last:mb-0">
      {showFeaturedImage && article.featuredImage && (
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-2xl md:rounded-[3rem] shadow-lg">
          <div
            className={`absolute inset-0 ${style.cardBg} ${style.darkCardBg} transition-all duration-700`}
          />
          <img
            src={article.featuredImage}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex-1 space-y-4 md:space-y-6 py-2 md:py-4">
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDate(article.publishedAt || article.createdAt)}
          </span>
          <span className="w-8 h-px" style={{ backgroundColor: style.primary }} />
          <span>
            {categoryLabel} {article.category?.name || '未分类'}
          </span>
        </div>
        <Link href={`/article/${article.slug}`}>
          <h2
            className={`text-2xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tighter ${style.title} ${style.darkTitle} hover:opacity-70 transition-opacity cursor-pointer`}
          >
            {article.title}
          </h2>
        </Link>
        <p className="text-base md:text-lg leading-relaxed opacity-60 italic font-medium max-w-3xl">
          {truncate(article.excerpt || article.content, excerptLength)}
        </p>
        {/* 标签 */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.id}`}
                className="text-[9px] font-bold px-3 py-1 rounded-full opacity-50 hover:opacity-100 transition-opacity"
                style={{ backgroundColor: `${style.primary}20`, color: style.primary }}
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
        <div className="flex items-center gap-6">
          <Link
            href={`/article/${article.slug}`}
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all group/btn"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover/btn:translate-x-2"
              style={{ backgroundColor: style.secondary }}
            >
              <ChevronRight size={18} style={{ color: style.primary }} />
            </div>
            <span>{readMoreText}</span>
          </Link>
          <span className="flex items-center gap-1 text-[10px] opacity-40">
            <Eye size={12} /> {article.viewCount || 0}
          </span>
        </div>
      </div>
    </article>
  );
}


// ============ 文章详情组件 ============
function ArticleDetail({ article, config = defaultConfig }: ArticleDetailProps & { config?: ThemeConfig }) {
  const style = vibeStyles[config.lightingMode as string] || vibeStyles.morning;
  const layout = config.articleDetailLayout || 'manuscript';
  const showFeaturedImage = config.showFeaturedImage !== false;

  return (
    <article className={`animate-in fade-in duration-1000 ${layout === 'manuscript' ? 'max-w-4xl mx-auto' : 'w-full'}`}>
      <header className={`mb-16 md:mb-24 space-y-8 ${layout === 'manuscript' ? 'text-center' : 'text-left'}`}>
        <div
          className={`flex items-center gap-4 opacity-30 text-[10px] font-black uppercase tracking-[0.6em] ${
            layout === 'manuscript' ? 'justify-center' : ''
          }`}
        >
          <Feather size={14} /> {layout === 'manuscript' ? 'Manuscript Mode' : 'Immersive Mode'}
        </div>
        <h1 className={`text-4xl md:text-7xl font-black tracking-tighter leading-[0.9] ${style.title} ${style.darkTitle}`}>
          {article.title}
        </h1>
        <div
          className={`flex items-center gap-6 text-xs font-bold opacity-40 italic ${
            layout === 'manuscript' ? 'justify-center' : ''
          }`}
        >
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {formatDate(article.publishedAt || article.createdAt)}
          </span>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.primary }} />
          <span>{article.author?.username || '匿名'}</span>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.primary }} />
          <span className="flex items-center gap-1">
            <Eye size={14} /> {article.viewCount || 0}
          </span>
        </div>
        {article.category && (
          <Link
            href={`/category/${article.category.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
            style={{ backgroundColor: `${style.primary}15`, color: style.primary }}
          >
            <Folder size={14} /> {article.category.name}
          </Link>
        )}
      </header>

      {/* 沉浸模式特色图 */}
      {showFeaturedImage && layout === 'immersive' && article.featuredImage && (
        <div className="w-full aspect-[21/9] mb-16 md:mb-24 overflow-hidden rounded-[3rem] md:rounded-[4rem] shadow-2xl">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 手稿模式特色图 */}
      {showFeaturedImage && layout === 'manuscript' && article.featuredImage && (
        <div className="w-full aspect-video mb-16 overflow-hidden rounded-[2rem] shadow-xl">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="relative">
        {layout === 'manuscript' && (
          <div
            className={`absolute -inset-4 md:-inset-8 ${style.cardBg} ${style.darkCardBg} -z-10 rounded-2xl md:rounded-[3rem] shadow-xl backdrop-blur-sm border border-white/40 dark:border-slate-700/40`}
          />
        )}
        <div
          className={`prose prose-lg md:prose-xl max-w-none overflow-hidden
            prose-p:leading-[2] prose-p:font-serif prose-p:mb-8
            prose-p:text-stone-600 dark:prose-p:text-stone-300
            prose-headings:font-black prose-headings:tracking-tighter 
            prose-headings:text-stone-800 dark:prose-headings:text-stone-100
            prose-blockquote:border-l-0 prose-blockquote:bg-stone-50/50 dark:prose-blockquote:bg-slate-800/50
            prose-blockquote:px-6 md:prose-blockquote:px-8 prose-blockquote:py-6 
            prose-blockquote:rounded-xl md:prose-blockquote:rounded-2xl prose-blockquote:italic prose-blockquote:my-8
            prose-blockquote:text-stone-600 dark:prose-blockquote:text-stone-300
            prose-img:rounded-xl md:prose-img:rounded-2xl prose-img:max-w-full
            prose-strong:text-stone-900 dark:prose-strong:text-stone-100
            prose-a:text-blue-600 dark:prose-a:text-blue-400
            prose-code:text-rose-600 dark:prose-code:text-rose-400 prose-code:break-words
            prose-pre:bg-stone-100 dark:prose-pre:bg-slate-800 prose-pre:rounded-xl prose-pre:overflow-x-auto prose-pre:max-w-full
            prose-li:text-stone-600 dark:prose-li:text-stone-300`}
          dangerouslySetInnerHTML={{ __html: article.htmlContent || article.content }}
        />
      </div>

      {/* 标签 */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-16 flex flex-wrap gap-3 justify-center">
          {article.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.id}`}
              className="px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105"
              style={{ backgroundColor: `${style.primary}15`, color: style.primary }}
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* 文章尾部 */}
      <footer
        className={`mt-24 md:mt-32 p-12 md:p-20 rounded-[3rem] md:rounded-[5rem] text-center space-y-8 border border-white/60 dark:border-slate-700/60 ${style.cardBg} ${style.darkCardBg} backdrop-blur-md shadow-inner`}
      >
        <Flower2 className="mx-auto animate-pulse" style={{ color: style.primary }} size={48} />
        <div className="space-y-4">
          <h4 className={`text-2xl md:text-4xl font-black tracking-tighter italic ${style.title} ${style.darkTitle}`}>
            "文字，是思想留下的花粉。"
          </h4>
        </div>
        <div className="flex justify-center gap-4 pt-4">
          <button
            className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-transform hover:scale-105 active:scale-95 text-white"
            style={{ backgroundColor: style.primary }}
          >
            分享这份花语
          </button>
        </div>
      </footer>
    </article>
  );
}


// ============ 分类列表 ============
function CategoryList({ categories, config = defaultConfig }: CategoryListProps & { config?: ThemeConfig }) {
  const style = vibeStyles[config.lightingMode as string] || vibeStyles.morning;

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
      {/* 页面标题 */}
      <div className="text-center mb-16 md:mb-24">
        <div
          className={`inline-flex items-center gap-4 px-5 py-2 rounded-full ${style.cardBg} ${style.darkCardBg} border border-white/60 dark:border-slate-700/60 text-[10px] font-black uppercase tracking-[0.5em] mb-8`}
        >
          <Folder size={16} style={{ color: style.primary }} /> Category Archive
        </div>
        <h1 className={`text-5xl md:text-8xl font-black tracking-tighter ${style.title} ${style.darkTitle}`}>
          林间归档
        </h1>
        <p className="mt-6 text-lg opacity-50 italic">探索所有文章分类</p>
      </div>

      {/* 分类网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {flatCategories.map(({ category, isChild }, index) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className={`group relative p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] ${style.cardBg} ${style.darkCardBg} border border-white/60 dark:border-slate-700/60 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-xl ${
              isChild ? 'ml-4' : ''
            }`}
          >
            <div
              className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"
              style={{ backgroundColor: style.accent }}
            />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${style.primary}20` }}
              >
                <Layers style={{ color: style.primary }} size={24} />
              </div>
              <span className="text-4xl font-black opacity-20 font-mono">
                {String(category._count?.articles || 0).padStart(2, '0')}
              </span>
            </div>
            <h2 className={`text-xl md:text-2xl font-black tracking-tight mb-2 ${style.title} ${style.darkTitle}`}>
              {isChild && <span className="opacity-30 mr-2">└</span>}
              {category.name}
            </h2>
            {category.description && (
              <p className="text-sm opacity-50 line-clamp-2 mb-4">{category.description}</p>
            )}
            <p className="text-xs font-bold uppercase tracking-wider opacity-40">
              {category._count?.articles || 0} 篇文章
            </p>
          </Link>
        ))}
      </div>

      {flatCategories.length === 0 && (
        <div className="p-24 text-center">
          <Layers size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-xl font-bold opacity-30 italic">分类正在林间呼吸...</p>
        </div>
      )}
    </div>
  );
}

// ============ 标签列表 ============
function TagList({ tags, config = defaultConfig }: TagListProps & { config?: ThemeConfig }) {
  const style = vibeStyles[config.lightingMode as string] || vibeStyles.morning;

  return (
    <div>
      {/* 页面标题 */}
      <div className="text-center mb-16 md:mb-24">
        <div
          className={`inline-flex items-center gap-4 px-5 py-2 rounded-full ${style.cardBg} ${style.darkCardBg} border border-white/60 dark:border-slate-700/60 text-[10px] font-black uppercase tracking-[0.5em] mb-8`}
        >
          <Tag size={16} style={{ color: style.primary }} /> Tag Garden
        </div>
        <h1 className={`text-5xl md:text-8xl font-black tracking-tighter ${style.title} ${style.darkTitle}`}>
          标签花园
        </h1>
        <p className="mt-6 text-lg opacity-50 italic">如落英缤纷的话题标签</p>
      </div>

      {/* 标签云 */}
      <div
        className={`p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] ${style.cardBg} ${style.darkCardBg} border border-white/60 dark:border-slate-700/60 backdrop-blur-sm`}
      >
        <div className="flex flex-wrap gap-4 justify-center">
          {tags.map((tag, index) => {
            const count = tag._count?.articles || 0;
            const size =
              count > 10
                ? 'text-xl px-8 py-4'
                : count > 5
                ? 'text-lg px-6 py-3'
                : 'text-base px-5 py-2.5';
            const isHot = index < 3;

            return (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className={`${size} rounded-full font-bold transition-all hover:scale-105 flex items-center gap-2`}
                style={{
                  backgroundColor: isHot ? style.primary : `${style.primary}15`,
                  color: isHot ? 'white' : style.primary,
                }}
              >
                #{tag.name}
                <span className={`text-xs ${isHot ? 'opacity-70' : 'opacity-50'}`}>({count})</span>
              </Link>
            );
          })}
        </div>
      </div>

      {tags.length === 0 && (
        <div className="p-24 text-center">
          <Hash size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-xl font-bold opacity-30 italic">标签如落英缤纷...</p>
        </div>
      )}
    </div>
  );
}

// ============ 搜索结果 ============
function SearchResults({ articles, total, query, config = defaultConfig }: SearchResultProps & { config?: ThemeConfig }) {
  const style = vibeStyles[config.lightingMode as string] || vibeStyles.morning;

  if (!query) return null;

  return (
    <div>
      {/* 搜索标题 */}
      <div className="text-center py-16 md:py-24 mb-16 border-b border-stone-200/50 dark:border-slate-700/50">
        <div
          className={`inline-flex items-center gap-4 px-5 py-2 rounded-full ${style.cardBg} ${style.darkCardBg} border border-white/60 dark:border-slate-700/60 text-[10px] font-black uppercase tracking-[0.5em] mb-8`}
        >
          <Search size={16} style={{ color: style.primary }} /> Resonance Filter
        </div>
        <h2 className={`text-4xl md:text-7xl font-black tracking-tighter ${style.title} ${style.darkTitle}`}>
          探索: <span style={{ color: style.primary }}>{query}</span>
        </h2>
        <p className="mt-6 text-lg opacity-50">
          找到 <span className="font-bold" style={{ color: style.primary }}>{total}</span> 篇相关文章
        </p>
      </div>

      {/* 结果列表 */}
      <div className="space-y-0">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={{
              ...article,
              featuredImage: null,
              category: null,
              viewCount: 0,
            }}
            config={config}
          />
        ))}
      </div>

      {articles.length === 0 && (
        <div className="p-24 text-center">
          <Search size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-xl font-bold opacity-30 italic">未找到相关文章</p>
          <p className="text-sm opacity-30 mt-2">尝试使用其他关键词搜索</p>
        </div>
      )}
    </div>
  );
}

// ============ 导出主题 ============
export const AetherBloomTheme: ThemeComponents = {
  name: 'aether-bloom',
  displayName: '以太花语',
  description: '有机感博客主题：自然呼吸的排版体验，支持多种卡片布局、详情页排版与响应式宽度定义',
  configOptions,
  defaultConfig,
  BlogLayout,
  ArticleCard,
  ArticleDetail,
  CategoryList,
  TagList,
  SearchResults,
};
