// Aura Nexus 主题 - 多维排版增强版：支持社论、网格、极简等多种风格
import { ReactNode, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '../../components/ThemeToggle';
import { SearchBox } from '../../components/SearchBox';
import { DesktopNavMenu, MobileNavMenu } from '../../components/NavMenu';
import { formatDate, truncate } from '../../lib/utils';
import { useSiteSettingsContext } from '../../contexts/site-settings-context';
import {
  Aperture,
  ArrowUpRight,
  Radio,
  Globe,
  Fingerprint,
  Clock,
  Eye,
  Tag,
  Folder,
  Search,
  Layers,
  Zap,
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
    key: 'vibeMode',
    label: '色彩氛围',
    type: 'select',
    options: [
      { value: 'hyper-pop', label: '极Pop (高亮)' },
      { value: 'dreamy-soft', label: '梦幻柔和' },
      { value: 'midnight-acid', label: '深夜迷幻' },
      { value: 'monochrome', label: '纯粹单色' },
    ],
    default: 'hyper-pop',
    description: '整体色彩风格',
  },
  {
    key: 'articleCardStyle',
    label: '文章卡片排版',
    type: 'select',
    options: [
      { value: 'editorial', label: '社论式 (非对称)' },
      { value: 'visual-grid', label: '视觉网格 (大图)' },
      { value: 'minimal-list', label: '极简列表' },
    ],
    default: 'editorial',
    description: '首页文章列表的展示风格',
  },
  {
    key: 'articleDetailStyle',
    label: '详情页排版',
    type: 'select',
    options: [
      { value: 'immersive', label: '沉浸式 (宽屏)' },
      { value: 'classic-zen', label: '禅意阅读 (居中)' },
      { value: 'split-vision', label: '分割视野' },
    ],
    default: 'immersive',
    description: '文章详情页的布局风格',
  },
  {
    key: 'typographyProfile',
    label: '字体性格',
    type: 'select',
    options: [
      { value: 'serif-focus', label: '典雅衬线' },
      { value: 'sans-modern', label: '现代无衬线' },
    ],
    default: 'serif-focus',
    description: '整体字体风格',
  },
  {
    key: 'spacingDensity',
    label: '间距密度',
    type: 'select',
    options: [
      { value: 'airy', label: '疏朗 (Airy)' },
      { value: 'compact', label: '紧凑 (Compact)' },
    ],
    default: 'airy',
    description: '页面元素间距',
  },
  {
    key: 'showAgent',
    label: '显示智能体',
    type: 'boolean',
    default: true,
    description: '显示跟随鼠标的智能体光效',
  },
  {
    key: 'agentBehavior',
    label: '智能体行为',
    type: 'select',
    options: [
      { value: 'passive', label: '静默观察' },
      { value: 'active', label: '实时共生' },
      { value: 'chaotic', label: '不可预测' },
    ],
    default: 'active',
    description: '智能体的跟随速度和行为模式',
  },
  {
    key: 'showFeaturedImage',
    label: '显示特色图',
    type: 'boolean',
    default: true,
    description: '在文章卡片中显示特色图片',
  },
  {
    key: 'excerptLength',
    label: '摘要长度',
    type: 'number',
    default: 120,
    description: '文章摘要显示的字符数',
  },
  {
    key: 'heroTitle',
    label: 'Hero 标题',
    type: 'text',
    default: 'Aura',
    description: '首页大标题主文字',
  },
  {
    key: 'heroSubtitle',
    label: 'Hero 副标题',
    type: 'text',
    default: 'Nexus',
    description: '首页大标题副文字',
  },
  {
    key: 'heroDescription',
    label: 'Hero 描述',
    type: 'text',
    default: 'Pro Version 5.0 // Multiform Layout',
    description: '首页标题下方的描述文字',
  },
  {
    key: 'navBrandText',
    label: '导航品牌文字',
    type: 'text',
    default: 'Aura.Nexus',
    description: '导航栏显示的品牌名称',
  },
];

const defaultConfig: ThemeConfig = {
  vibeMode: 'hyper-pop',
  articleCardStyle: 'editorial',
  articleDetailStyle: 'immersive',
  typographyProfile: 'serif-focus',
  spacingDensity: 'airy',
  showAgent: true,
  agentBehavior: 'active',
  showFeaturedImage: true,
  excerptLength: 120,
  heroTitle: 'Aura',
  heroSubtitle: 'Nexus',
  heroDescription: 'Pro Version 5.0 // Multiform Layout',
  navBrandText: 'Aura.Nexus',
};

// 配色方案
const vibeThemes: Record<string, { primary: string; secondary: string; bg: string; darkBg: string; text: string; accent: string }> = {
  'hyper-pop': {
    primary: '#ff3d00',
    secondary: '#00e5ff',
    bg: 'bg-white',
    darkBg: 'dark:bg-slate-950',
    text: 'text-slate-900 dark:text-slate-100',
    accent: 'text-red-500',
  },
  'dreamy-soft': {
    primary: '#f472b6',
    secondary: '#818cf8',
    bg: 'bg-indigo-50/20',
    darkBg: 'dark:bg-indigo-950',
    text: 'text-indigo-900 dark:text-indigo-100',
    accent: 'text-indigo-500 dark:text-indigo-400',
  },
  'midnight-acid': {
    primary: '#a855f7',
    secondary: '#22d3ee',
    bg: 'bg-slate-900',
    darkBg: 'dark:bg-black',
    text: 'text-slate-100',
    accent: 'text-purple-400',
  },
  'monochrome': {
    primary: '#000000',
    secondary: '#ffffff',
    bg: 'bg-white',
    darkBg: 'dark:bg-black',
    text: 'text-slate-900 dark:text-slate-100',
    accent: 'text-slate-500 dark:text-slate-400',
  },
};

// 间距映射
const spacingClasses: Record<string, { section: string; card: string }> = {
  airy: { section: 'py-16 md:py-32', card: 'py-20' },
  compact: { section: 'py-8 md:py-16', card: 'py-10' },
};

// 字体映射
const fontClasses: Record<string, string> = {
  'serif-focus': 'font-serif',
  'sans-modern': 'font-sans',
};


// ============ 智能体组件 (Symbiotic Agent) ============
function SymbioticAgent({ config }: { config: ThemeConfig }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const theme = vibeThemes[config.vibeMode] || vibeThemes['hyper-pop'];
  const behavior = config.agentBehavior || 'active';

  useEffect(() => {
    if (!config.showAgent) return;

    const handleMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMove);

    let animationId: number;
    const animate = () => {
      const lerp = behavior === 'chaotic' ? 0.02 : behavior === 'active' ? 0.1 : 0.05;
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * lerp;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * lerp;
      setPosition({ x: currentRef.current.x, y: currentRef.current.y });
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(animationId);
    };
  }, [config.showAgent, behavior]);

  if (!config.showAgent) return null;

  return (
    <div
      className="fixed pointer-events-none z-[999] hidden lg:block"
      style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }}
    >
      <div className="relative">
        <div
          className={`w-12 h-12 rounded-full blur-2xl opacity-40 animate-pulse transition-all duration-1000 ${behavior === 'chaotic' ? 'scale-150' : ''}`}
          style={{ backgroundColor: theme.secondary }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,1)]" />
        </div>
        {behavior !== 'passive' && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 whitespace-nowrap">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">
              Status: {behavior}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ 背景：参数化背景层 ============
function AuraBackground({ config }: { config: ThemeConfig }) {
  const theme = vibeThemes[config.vibeMode] || vibeThemes['hyper-pop'];
  const spacing = spacingClasses[config.spacingDensity] || spacingClasses.airy;
  const dotSize = config.spacingDensity === 'airy' ? '80px 80px' : '40px 40px';

  return (
    <div className={`fixed inset-0 -z-10 transition-colors duration-1000 ${theme.bg} ${theme.darkBg}`}>
      {/* 点阵背景 */}
      <div
        className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle, ${theme.primary} 1px, transparent 1px)`,
          backgroundSize: dotSize,
        }}
      />
      {/* 主色光晕 */}
      <div
        className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full filter blur-[120px] opacity-10 animate-pulse"
        style={{ backgroundColor: theme.primary }}
      />
      {/* 副色光晕 */}
      <div
        className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full filter blur-[100px] opacity-10 animate-pulse"
        style={{ backgroundColor: theme.secondary, animationDelay: '2s' }}
      />
    </div>
  );
}

// ============ 核心布局 ============
function BlogLayout({ children, config = defaultConfig }: { children: ReactNode; config?: ThemeConfig }) {
  const theme = vibeThemes[config.vibeMode] || vibeThemes['hyper-pop'];
  const fontClass = fontClasses[config.typographyProfile] || fontClasses['serif-focus'];
  const spacing = spacingClasses[config.spacingDensity] || spacingClasses.airy;
  const { settings, navMenu } = useSiteSettingsContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const siteName = settings.siteName || 'NextBlog';
  const navBrandText = config.navBrandText || 'Aura.Nexus';
  const footerText = settings.footerText?.replace('{year}', new Date().getFullYear().toString())
    || `© ${new Date().getFullYear()} ${siteName}`;

  // 深夜迷幻模式强制暗色
  const isDarkOnly = config.vibeMode === 'midnight-acid';

  return (
    <div className={`min-h-screen ${theme.text} ${fontClass} selection:bg-black selection:text-white transition-all duration-500`}>
      <AuraBackground config={config} />
      <SymbioticAgent config={config} />

      {/* 导航栏 */}
      <nav className="relative z-50 flex items-center justify-between px-4 md:px-8 lg:px-16 py-8 md:py-12">
        <Link href="/" className="group cursor-pointer flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 border border-current flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
            <Aperture size={20} />
          </div>
          <span className="text-lg md:text-xl font-black uppercase tracking-tighter">{navBrandText}</span>
        </Link>

        <DesktopNavMenu
          items={navMenu}
          itemClassName="px-3 md:px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-400 hover:text-current transition-all relative group whitespace-nowrap"
        />

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-4">
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
            <Radio size={14} className={`${theme.accent} animate-pulse`} />
          </div>
          <SearchBox />
          {!isDarkOnly && <ThemeToggle />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="菜单"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <MobileNavMenu items={navMenu} onClose={() => setMobileMenuOpen(false)} />
      )}

      <main className={`max-w-7xl mx-auto px-4 md:px-8 lg:px-16 ${spacing.section}`}>
        {children}
      </main>

      <footer className="px-4 md:px-8 lg:px-16 py-16 md:py-24 flex flex-col md:flex-row justify-between items-center gap-8 opacity-20 hover:opacity-100 transition-opacity duration-500">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-center md:text-left">
          {footerText} // Parametric Design
        </p>
        <div className="flex gap-6 md:gap-8 text-[9px] font-bold uppercase tracking-widest">
          <Link href="/categories" className="hover:underline">分类</Link>
          <Link href="/tags" className="hover:underline">标签</Link>
          <Link href="/about" className="hover:underline">关于</Link>
        </div>
      </footer>
    </div>
  );
}


// ============ 文章卡片：多排版支持 ============
function ArticleCard({ article, config = defaultConfig }: ArticleCardProps & { config?: ThemeConfig }) {
  const theme = vibeThemes[config.vibeMode] || vibeThemes['hyper-pop'];
  const style = config.articleCardStyle || 'editorial';
  const spacing = spacingClasses[config.spacingDensity] || spacingClasses.airy;
  const excerptLength = config.excerptLength || 120;
  const showFeaturedImage = config.showFeaturedImage !== false;

  // 1. 社论式 (Editorial) - 非对称布局
  if (style === 'editorial') {
    return (
      <div className={`group relative ${spacing.card} flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-12 border-b border-slate-100 dark:border-slate-900 last:border-0`}>
        {/* 背景序号 */}
        <div className="absolute top-4 md:top-8 left-0 text-[8rem] md:text-[12rem] font-black text-slate-100 dark:text-slate-900/30 -z-10 select-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          {article.id.slice(-2).padStart(2, '0')}
        </div>

        {/* 图片区域 */}
        {showFeaturedImage && (
          <div className="md:col-span-5 aspect-[4/5] overflow-hidden rounded-[2rem] md:rounded-[3rem] group-hover:rounded-2xl transition-all duration-700">
            {article.featuredImage ? (
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-110 group-hover:scale-100 transition-all duration-1000"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: `${theme.primary}10` }}
              >
                <Layers size={64} className="opacity-20" />
              </div>
            )}
          </div>
        )}

        {/* 内容区域 */}
        <div className={`${showFeaturedImage ? 'md:col-span-7' : 'md:col-span-12'} flex flex-col justify-center space-y-4 md:space-y-6`}>
          <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme.accent}`}>
            {article.category?.name || 'Article'}
          </span>
          <Link href={`/article/${article.slug}`}>
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-black leading-tight tracking-tighter uppercase group-hover:italic transition-all">
              {article.title}
            </h2>
          </Link>
          <p className="text-base md:text-lg opacity-60 leading-relaxed max-w-xl line-clamp-3">
            {truncate(article.excerpt || article.content, excerptLength)}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-400 uppercase">
            <span className="flex items-center gap-1">
              <Clock size={12} /> {formatDate(article.publishedAt || article.createdAt).split(' ')[0]}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} /> {article.viewCount || 0}
            </span>
          </div>
          <Link
            href={`/article/${article.slug}`}
            className="flex items-center gap-4 group/btn mt-4"
          >
            <span className="text-xs font-black uppercase tracking-widest group-hover/btn:tracking-[0.3em] transition-all">
              Explore Entity
            </span>
            <ArrowUpRight size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  // 2. 视觉网格 (Visual Grid) - 适合大图瀑布流
  if (style === 'visual-grid') {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group relative aspect-[3/4] overflow-hidden rounded-[2rem] border border-slate-100 dark:border-slate-800 block"
      >
        {showFeaturedImage && article.featuredImage ? (
          <img
            src={article.featuredImage}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <div
            className="absolute inset-0 w-full h-full flex items-center justify-center"
            style={{ backgroundColor: `${theme.primary}10` }}
          >
            <Layers size={64} className="opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
        <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white">
          <span className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60">
            {article.category?.name || 'Article'}
          </span>
          <h2 className="text-xl md:text-2xl font-bold leading-tight mb-4 line-clamp-2">
            {article.title}
          </h2>
          <div className="flex items-center gap-4 text-[10px] font-mono opacity-60">
            <span>{formatDate(article.publishedAt || article.createdAt).split(' ')[0]}</span>
            <span className="flex items-center gap-1">
              <Eye size={10} /> {article.viewCount || 0}
            </span>
          </div>
          <div className="h-px w-0 group-hover:w-full bg-white/30 transition-all duration-700 mt-4" />
        </div>
      </Link>
    );
  }

  // 3. 极简列表 (Minimal List) - 纯文字，高信息密度
  return (
    <Link
      href={`/article/${article.slug}`}
      className="group py-6 md:py-8 border-b border-slate-100 dark:border-slate-900 flex flex-col md:flex-row md:items-baseline justify-between hover:px-4 transition-all duration-300 gap-2"
    >
      <div className="flex gap-4 md:gap-12 items-baseline">
        <span className="text-xs font-black opacity-20 hidden md:block">
          {article.id.slice(-2).padStart(2, '0')}
        </span>
        <h2 className="text-xl md:text-2xl lg:text-4xl font-black uppercase tracking-tight group-hover:text-red-500 transition-colors line-clamp-2">
          {article.title}
        </h2>
      </div>
      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest opacity-40">
        <span className="hidden sm:block">/ {article.category?.name || 'Article'}</span>
        <span>{formatDate(article.publishedAt || article.createdAt).split(' ')[0]}</span>
      </div>
    </Link>
  );
}


// ============ 文章详情：多详情排版 ============
function ArticleDetail({ article, config = defaultConfig }: ArticleDetailProps & { config?: ThemeConfig }) {
  const theme = vibeThemes[config.vibeMode] || vibeThemes['hyper-pop'];
  const style = config.articleDetailStyle || 'immersive';

  // 1. 沉浸式 (Immersive) - 默认全屏视觉
  if (style === 'immersive') {
    return (
      <article className="space-y-16 md:space-y-24">
        <header className="space-y-8 md:space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-px bg-current opacity-20" />
            <span className="text-[11px] font-black uppercase tracking-[0.5em] opacity-40">Entry Node</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-9xl font-black leading-[0.85] tracking-tighter uppercase text-slate-900 dark:text-white">
            {article.title}
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 py-8 md:py-12 border-y border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Views</p>
              <p className="font-black text-slate-800 dark:text-slate-200">{article.viewCount || 0}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Category</p>
              <p className="font-black text-slate-800 dark:text-slate-200">{article.category?.name || 'Uncategorized'}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Date</p>
              <p className="font-black text-slate-800 dark:text-slate-200">{formatDate(article.publishedAt || article.createdAt).split(' ')[0]}</p>
            </div>
            <div className="text-right">
              <Globe size={20} className="ml-auto text-slate-300 dark:text-slate-600" />
            </div>
          </div>
        </header>

        <div
          className="prose prose-lg md:prose-2xl max-w-none 
            prose-headings:font-black prose-headings:tracking-tight
            prose-h1:text-slate-900 prose-h2:text-slate-900 prose-h3:text-slate-900 prose-h4:text-slate-900
            dark:prose-h1:text-white dark:prose-h2:text-white dark:prose-h3:text-white dark:prose-h4:text-white
            prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed 
            prose-strong:text-slate-900 dark:prose-strong:text-white
            prose-a:text-red-500 dark:prose-a:text-red-400
            prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400
            prose-blockquote:border-l-[10px] prose-blockquote:border-red-500
            prose-code:text-red-600 dark:prose-code:text-red-400
            prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800
            prose-li:text-slate-700 dark:prose-li:text-slate-300
            prose-img:rounded-[2rem] md:prose-img:rounded-[3rem]"
          dangerouslySetInnerHTML={{ __html: article.htmlContent || article.content }}
        />

        {/* 标签 */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-8 border-t border-slate-100 dark:border-slate-900">
            {article.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.id}`}
                className="px-4 py-2 border border-current/20 text-sm font-mono uppercase hover:bg-current/5 transition-colors"
              >
                # {tag.name}
              </Link>
            ))}
          </div>
        )}
      </article>
    );
  }

  // 2. 禅意阅读 (Classic Zen) - 经典居中排版，聚焦文字
  if (style === 'classic-zen') {
    return (
      <article className="max-w-3xl mx-auto py-8 md:py-12">
        <header className="text-center space-y-6 md:space-y-8 mb-16 md:mb-24">
          <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme.accent}`}>
            {article.category?.name || 'Article'}
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
            {article.title}
          </h1>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
            {article.author && <span>by {article.author.username}</span>}
          </div>
        </header>

        <div
          className="prose prose-lg md:prose-xl max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h1:text-slate-900 prose-h2:text-slate-900 prose-h3:text-slate-900 prose-h4:text-slate-900
            dark:prose-h1:text-white dark:prose-h2:text-white dark:prose-h3:text-white dark:prose-h4:text-white
            prose-p:font-serif prose-p:italic prose-p:text-slate-600 dark:prose-p:text-slate-300
            prose-strong:text-slate-900 dark:prose-strong:text-white
            prose-a:text-indigo-600 dark:prose-a:text-indigo-400
            prose-blockquote:text-slate-500 dark:prose-blockquote:text-slate-400
            prose-code:text-rose-600 dark:prose-code:text-rose-400
            prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800
            prose-li:text-slate-600 dark:prose-li:text-slate-300"
          dangerouslySetInnerHTML={{ __html: article.htmlContent || article.content }}
        />

        {/* 标签 */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center mt-16 pt-8 border-t border-slate-100 dark:border-slate-900">
            {article.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.id}`}
                className="px-4 py-2 border border-current/20 text-sm font-mono uppercase hover:bg-current/5 transition-colors"
              >
                # {tag.name}
              </Link>
            ))}
          </div>
        )}
      </article>
    );
  }

  // 3. 分割视野 (Split Vision) - 左固定标题，右滚动内容
  return (
    <div className="flex flex-col lg:flex-row gap-8 md:gap-16">
      <header className="lg:w-1/3 lg:sticky lg:top-32 h-fit space-y-6 md:space-y-8">
        <h1 className="text-3xl md:text-4xl lg:text-6xl font-black uppercase leading-none tracking-tighter text-slate-900 dark:text-white">
          {article.title}
        </h1>
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center animate-spin" style={{ animationDuration: '20s' }}>
          <Fingerprint size={32} className="text-slate-300 dark:text-slate-600" />
        </div>
        <div className="space-y-2 text-slate-500 dark:text-slate-400">
          <p className="text-[9px] font-black uppercase">Meta Info</p>
          <div className="text-sm space-y-1">
            <p>{article.category?.name || 'Uncategorized'}</p>
            <p>{formatDate(article.publishedAt || article.createdAt)}</p>
            {article.author && <p>by {article.author.username}</p>}
            <p>{article.viewCount || 0} views</p>
          </div>
        </div>
        {/* 标签 */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.id}`}
                className="px-3 py-1 border border-current/20 text-xs font-mono uppercase hover:bg-current/5 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div
        className="lg:w-2/3 prose prose-lg md:prose-2xl max-w-none
          prose-headings:font-black prose-headings:tracking-tight
          prose-h1:text-slate-900 prose-h2:text-slate-900 prose-h3:text-slate-900 prose-h4:text-slate-900
          dark:prose-h1:text-white dark:prose-h2:text-white dark:prose-h3:text-white dark:prose-h4:text-white
          prose-p:text-slate-700 dark:prose-p:text-slate-300
          prose-strong:text-slate-900 dark:prose-strong:text-white
          prose-a:text-purple-600 dark:prose-a:text-purple-400
          prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400
          prose-code:text-cyan-600 dark:prose-code:text-cyan-400
          prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800
          prose-li:text-slate-700 dark:prose-li:text-slate-300"
        dangerouslySetInnerHTML={{ __html: article.htmlContent || article.content }}
      />
    </div>
  );
}


// ============ 分类列表 ============
function CategoryList({ categories, config = defaultConfig }: CategoryListProps & { config?: ThemeConfig }) {
  const theme = vibeThemes[config.vibeMode] || vibeThemes['hyper-pop'];

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
      <div className="mb-12 md:mb-16">
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <div className="w-12 h-px bg-current opacity-20" />
          <span className={`text-[11px] font-black uppercase tracking-[0.5em] ${theme.accent}`}>Category Index</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter uppercase">
          分类目录
        </h1>
      </div>

      {/* 分类列表 */}
      <div className="grid grid-cols-1 gap-1">
        {flatCategories.map(({ category, isChild }, i) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className={`group cursor-pointer py-10 md:py-16 border-b border-slate-100 dark:border-slate-900 flex flex-col md:flex-row md:items-center justify-between hover:px-4 md:hover:px-8 transition-all duration-500 ${isChild ? 'pl-4 md:pl-8' : ''}`}
          >
            <div className="flex items-center gap-4 md:gap-8 lg:gap-16 mb-4 md:mb-0">
              <span className="text-lg md:text-xl font-black opacity-10">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-3xl md:text-5xl lg:text-8xl font-black uppercase tracking-tighter group-hover:italic transition-all">
                {isChild && <span className="text-slate-300 dark:text-slate-700 mr-2">└</span>}
                {category.name}
              </h3>
            </div>
            <span className="text-2xl md:text-4xl font-black italic opacity-20">
              {category._count?.articles || 0}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ============ 标签列表 ============
function TagList({ tags, config = defaultConfig }: TagListProps & { config?: ThemeConfig }) {
  const theme = vibeThemes[config.vibeMode] || vibeThemes['hyper-pop'];

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-12 md:mb-16">
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <div className="w-12 h-px bg-current opacity-20" />
          <span className={`text-[11px] font-black uppercase tracking-[0.5em] ${theme.accent}`}>Tag Registry</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter uppercase">
          标签索引
        </h1>
      </div>

      {/* 标签云 */}
      <div className="flex flex-wrap gap-4 md:gap-8 py-12 md:py-24 border-y border-slate-100 dark:border-slate-900">
        {tags.map((tag) => {
          const count = tag._count?.articles || 0;
          const sizeClass = count > 10 ? 'text-3xl md:text-5xl' : count > 5 ? 'text-2xl md:text-4xl' : 'text-xl md:text-3xl';
          return (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className={`${sizeClass} font-black uppercase tracking-tighter hover:text-red-500 hover:scale-105 transition-all`}
            >
              #{tag.name}
              <sup className="text-xs opacity-30 ml-1">{count}</sup>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ============ 搜索结果 ============
function SearchResults({ articles, total, query, config = defaultConfig }: SearchResultProps & { config?: ThemeConfig }) {
  const theme = vibeThemes[config.vibeMode] || vibeThemes['hyper-pop'];
  const style = config.articleCardStyle || 'editorial';

  if (!query) return null;

  return (
    <div className="space-y-16 md:space-y-24">
      {/* 搜索标题 */}
      <div className="py-12 md:py-24 border-b border-current">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 opacity-40">Resonance Match</p>
        <h2 className="text-4xl md:text-7xl lg:text-9xl font-black tracking-tighter uppercase break-all">
          {query}
        </h2>
        <p className="mt-4 text-lg opacity-60">
          找到 <span className={theme.accent}>{total}</span> 篇相关文章
        </p>
      </div>

      {/* 结果列表 */}
      <div className={style === 'visual-grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8' : 'space-y-0'}>
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
    </div>
  );
}

// ============ 导出主题 ============
export const AuraNexusTheme: ThemeComponents = {
  name: 'aura-nexus',
  displayName: '灵气枢纽 Pro',
  description: '多维排版增强版：支持社论、网格、极简等多种风格，所有参数均可自定义',
  configOptions,
  defaultConfig,
  BlogLayout,
  ArticleCard,
  ArticleDetail,
  CategoryList,
  TagList,
  SearchResults,
};
