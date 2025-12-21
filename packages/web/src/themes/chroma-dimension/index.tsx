// Chroma Dimension 主题 - 幻彩维度：极致多巴胺美学，未来波普排版
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '../../components/ThemeToggle';
import { SearchBox } from '../../components/SearchBox';
import { formatDate, truncate } from '../../lib/utils';
import { useSiteSettingsContext } from '../../contexts/site-settings-context';
import {
  Zap,
  Orbit,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Eye,
  Box,
  Cpu,
  Share2,
  Activity,
  Radio,
  Dna,
  Layers,
  Smile,
  Globe,
  Clock,
  Folder,
  Tag,
  Search,
  Hash,
  Menu,
  X,
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
    label: '多巴胺光谱',
    type: 'select',
    options: [
      { value: 'electric-candy', label: '电感糖果 (粉/蓝/紫)' },
      { value: 'acid-sun', label: '酸性烈日 (黄/橙/绿)' },
      { value: 'holographic', label: '全息极光 (炫彩明亮)' },
      { value: 'hyper-white', label: '超维白感 (白/荧光)' },
    ],
    default: 'electric-candy',
    description: '整体色彩风格',
  },
  {
    key: 'liquidMotion',
    label: '背景流动强度',
    type: 'select',
    options: [
      { value: 'gentle', label: '平静' },
      { value: 'vibrant', label: '跃动' },
      { value: 'insane', label: '狂乱' },
    ],
    default: 'vibrant',
    description: '液态背景的动画强度',
  },
  {
    key: 'glassMorphism',
    label: '玻璃拟态效果',
    type: 'boolean',
    default: true,
    description: '启用毛玻璃效果',
  },
  {
    key: 'showAiSpirit',
    label: '显示AI精灵',
    type: 'boolean',
    default: true,
    description: '显示左下角的AI助手精灵',
  },
  {
    key: 'showFeaturedImage',
    label: '显示特色图片',
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
    key: 'siteMood',
    label: '核心情绪标签',
    type: 'text',
    default: 'PURE_ENERGY',
    description: '站点情绪标识',
  },
  {
    key: 'exploreBtn',
    label: '探索按钮文字',
    type: 'text',
    default: 'SYNC DIMENSION',
    description: '文章卡片的探索按钮',
  },
  {
    key: 'noImageTag',
    label: '无图标识',
    type: 'text',
    default: 'RAW_CORE_DATA',
    description: '无特色图时显示的标签',
  },
  {
    key: 'viewMetric',
    label: '阅读量标签',
    type: 'text',
    default: 'ENERGY',
    description: '阅读量的显示标签',
  },
  {
    key: 'aiSpiritMsg',
    label: 'AI精灵问候语',
    type: 'text',
    default: '正在同步你的多巴胺频率，建立高维链接...',
    description: 'AI精灵的问候文字',
  },
  {
    key: 'heroTagline',
    label: 'Hero副标题',
    type: 'text',
    default: 'HIGH_FREQUENCY_MODE',
    description: '首页Hero区域的标签',
  },
];

const defaultConfig: ThemeConfig = {
  vibeMode: 'electric-candy',
  liquidMotion: 'vibrant',
  glassMorphism: true,
  showAiSpirit: true,
  showFeaturedImage: true,
  excerptLength: 120,
  siteMood: 'PURE_ENERGY',
  exploreBtn: 'SYNC DIMENSION',
  noImageTag: 'RAW_CORE_DATA',
  viewMetric: 'ENERGY',
  aiSpiritMsg: '正在同步你的多巴胺频率，建立高维链接...',
  heroTagline: 'HIGH_FREQUENCY_MODE',
};

// 配色方案 - 包含明暗模式
const palettes: Record<string, {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  darkBg: string;
  text: string;
  darkText: string;
  title: string;
  darkTitle: string;
  glass: string;
  darkGlass: string;
  gradient: string;
  isLightTheme: boolean;
}> = {
  'electric-candy': {
    primary: '#FF00FF',
    secondary: '#00FFFF',
    accent: '#7000FF',
    bg: 'bg-[#0f001c]',
    darkBg: 'dark:bg-black',
    text: 'text-cyan-300',
    darkText: 'dark:text-cyan-200',
    title: 'text-white',
    darkTitle: 'dark:text-white',
    glass: 'bg-white/10',
    darkGlass: 'dark:bg-white/5',
    gradient: 'from-[#FF00FF] via-[#7000FF] to-[#00FFFF]',
    isLightTheme: false,
  },
  'acid-sun': {
    primary: '#CCFF00',
    secondary: '#FF5E00',
    accent: '#00E5FF',
    bg: 'bg-[#1a1c00]',
    darkBg: 'dark:bg-[#0a0b00]',
    text: 'text-lime-300',
    darkText: 'dark:text-lime-200',
    title: 'text-white',
    darkTitle: 'dark:text-white',
    glass: 'bg-white/10',
    darkGlass: 'dark:bg-white/5',
    gradient: 'from-[#CCFF00] via-[#FF5E00] to-[#00E5FF]',
    isLightTheme: false,
  },
  'holographic': {
    primary: '#60a5fa',
    secondary: '#f472b6',
    accent: '#fbbf24',
    bg: 'bg-slate-50',
    darkBg: 'dark:bg-slate-950',
    text: 'text-slate-600',
    darkText: 'dark:text-slate-300',
    title: 'text-slate-900',
    darkTitle: 'dark:text-white',
    glass: 'bg-white/60',
    darkGlass: 'dark:bg-slate-900/60',
    gradient: 'from-blue-400 via-pink-400 to-yellow-400',
    isLightTheme: true,
  },
  'hyper-white': {
    primary: '#000000',
    secondary: '#333333',
    accent: '#00FF41',
    bg: 'bg-white',
    darkBg: 'dark:bg-slate-950',
    text: 'text-slate-600',
    darkText: 'dark:text-slate-300',
    title: 'text-slate-900',
    darkTitle: 'dark:text-white',
    glass: 'bg-slate-100/80',
    darkGlass: 'dark:bg-slate-900/80',
    gradient: 'from-[#00FF41] via-slate-900 to-[#00FF41]',
    isLightTheme: true,
  },
};

// ============ 液态流动背景 ============
function LiquidBackground({ config }: { config: ThemeConfig }) {
  const p = palettes[config.vibeMode as string] || palettes['electric-candy'];
  const motion = config.liquidMotion || 'vibrant';
  const animationDuration = motion === 'gentle' ? '20s' : motion === 'insane' ? '5s' : '10s';

  return (
    <div className={`fixed inset-0 -z-10 ${p.bg} ${p.darkBg} transition-colors duration-1000 overflow-hidden`}>
      {/* 动态流体光斑 */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] rounded-full blur-[120px] opacity-40 animate-pulse"
        style={{ backgroundColor: p.primary, animationDuration }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-30 animate-pulse"
        style={{ backgroundColor: p.secondary, animationDuration, animationDelay: '2s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full blur-[150px] opacity-20"
        style={{ backgroundColor: p.accent }}
      />
      {/* 网格装饰 */}
      <div
        className={`absolute inset-0 opacity-[0.03] ${
          p.isLightTheme
            ? 'bg-[radial-gradient(#000_1px,transparent_1px)]'
            : 'bg-[radial-gradient(#fff_1px,transparent_1px)]'
        } [background-size:40px_40px]`}
      />
    </div>
  );
}

// ============ AI精灵助手 ============
function AiSpirit({ config }: { config: ThemeConfig }) {
  const p = palettes[config.vibeMode as string] || palettes['electric-candy'];
  const aiMsg = config.aiSpiritMsg || defaultConfig.aiSpiritMsg;

  if (!config.showAiSpirit) return null;

  return (
    <div className="fixed bottom-8 left-8 z-[100] group">
      <div
        className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center cursor-pointer shadow-2xl group-hover:rotate-12 transition-transform`}
      >
        <Smile className="text-white" size={28} />
        <div className="absolute inset-0 rounded-2xl bg-white animate-ping opacity-20" />
      </div>
      <div
        className={`absolute bottom-0 left-full ml-4 w-64 p-5 ${p.glass} ${p.darkGlass} backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all pointer-events-none group-hover:pointer-events-auto`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-pink-500" />
          <span className={`text-[10px] font-black uppercase tracking-widest ${p.text} ${p.darkText} opacity-60`}>
            Spirit Sync
          </span>
        </div>
        <p className={`text-xs font-bold leading-relaxed italic ${p.title} ${p.darkTitle}`}>
          "{aiMsg}"
        </p>
      </div>
    </div>
  );
}

// ============ 核心布局组件 ============
function BlogLayout({ children, config = defaultConfig }: { children: ReactNode; config?: ThemeConfig }) {
  const p = palettes[config.vibeMode as string] || palettes['electric-candy'];
  const { settings, navMenu } = useSiteSettingsContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const siteName = settings.siteName || 'CHROMA';
  const siteMood = config.siteMood || 'PURE_ENERGY';
  const heroTagline = config.heroTagline || 'HIGH_FREQUENCY_MODE';
  const footerText = settings.footerText?.replace('{year}', new Date().getFullYear().toString())
    || `© ${new Date().getFullYear()} ${siteName}`;

  const defaultNavItems = [
    { label: 'SPECTRUM', url: '/' },
    { label: 'ARCHIVE', url: '/categories' },
    { label: 'FRAGMENTS', url: '/tags' },
    { label: 'ABOUT', url: '/about' },
  ];
  const navItems = navMenu.length > 0 ? navMenu : defaultNavItems;

  return (
    <div className={`min-h-screen ${p.text} ${p.darkText} font-sans transition-all duration-700`}>
      <LiquidBackground config={config} />

      {/* 导航栏 */}
      <nav
        className={`fixed top-0 left-0 w-full z-[100] h-20 md:h-24 px-4 md:px-8 lg:px-16 flex items-center justify-between border-b border-white/10 dark:border-white/5 backdrop-blur-xl ${p.glass} ${p.darkGlass}`}
      >
        <Link href="/" className="flex items-center gap-3 md:gap-4 group cursor-pointer">
          <div
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${p.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
          >
            <Zap className="text-white" size={20} fill="white" />
          </div>
          <div className="flex flex-col">
            <span className={`text-lg md:text-2xl font-black tracking-widest ${p.title} ${p.darkTitle}`}>
              {siteName}
            </span>
            <span className={`text-[8px] md:text-[10px] font-bold opacity-40 tracking-[0.3em] uppercase ${p.text} ${p.darkText}`}>
              {siteMood}
            </span>
          </div>
        </Link>

        {/* 桌面导航 */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-10">
          {navItems.map((item, i) => (
            <Link
              key={i}
              href={item.url}
              className={`text-[10px] font-black uppercase tracking-[0.2em] xl:tracking-[0.3em] hover:opacity-100 opacity-50 transition-all relative group ${p.text} ${p.darkText}`}
            >
              {item.label}
              <span
                className={`absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r ${p.gradient} group-hover:w-full transition-all duration-500`}
              />
            </Link>
          ))}
          <SearchBox />
          <ThemeToggle />
        </div>

        {/* 移动端菜单按钮 */}
        <div className="flex lg:hidden items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`w-10 h-10 rounded-xl ${p.glass} ${p.darkGlass} border border-white/20 flex items-center justify-center`}
            aria-label="菜单"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className={`fixed inset-0 z-[90] pt-24 px-6 ${p.bg} ${p.darkBg} backdrop-blur-xl lg:hidden`}>
          <div className="flex flex-col gap-4">
            {navItems.map((item, i) => (
              <Link
                key={i}
                href={item.url}
                className={`text-lg font-black py-4 border-b border-white/10 ${p.title} ${p.darkTitle}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4">
              <SearchBox />
            </div>
          </div>
        </div>
      )}

      {/* Hero 区域 */}
      <header className="pt-32 md:pt-48 pb-16 md:pb-20 px-4 md:px-8 lg:px-16 text-center md:text-left relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 max-w-7xl mx-auto">
          <div className="space-y-6">
            <div
              className={`inline-flex items-center gap-3 px-4 md:px-6 py-2 rounded-full border border-white/20 ${p.glass} ${p.darkGlass} text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em]`}
            >
              <Radio size={14} className="animate-pulse" style={{ color: p.primary }} />
              <span className={p.text}>{heroTagline}</span>
            </div>
            <h1
              className={`text-5xl md:text-7xl lg:text-[10rem] font-black leading-[0.8] tracking-tighter ${p.title} ${p.darkTitle} uppercase`}
            >
              {siteName}
              <br />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${p.gradient}`}>
                NEXT.
              </span>
            </h1>
            <p className={`text-sm md:text-base max-w-md opacity-50 ${p.text} ${p.darkText}`}>
              {settings.siteDescription || '探索数字现实的脉动频率'}
            </p>
          </div>
          <div className="hidden xl:block opacity-10">
            <Globe size={200} strokeWidth={0.5} className={p.title} />
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-32">{children}</main>

      {/* AI精灵 */}
      <AiSpirit config={config} />

      {/* 页脚 */}
      <footer className="py-16 md:py-20 border-t border-white/5 flex flex-col items-center gap-6 md:gap-8">
        <div className={`flex gap-12 md:gap-16 opacity-20 ${p.text} ${p.darkText}`}>
          <Cpu size={20} />
          <Layers size={20} />
          <Dna size={20} />
        </div>
        <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] opacity-20 ${p.text} ${p.darkText}`}>
          {footerText}
        </p>
      </footer>
    </div>
  );
}


// ============ 文章卡片：海报/全息双态 ============
function ArticleCard({ article, config = defaultConfig }: ArticleCardProps & { config?: ThemeConfig }) {
  const p = palettes[config.vibeMode as string] || palettes['electric-candy'];
  const showFeaturedImage = config.showFeaturedImage !== false;
  const excerptLength = config.excerptLength || 120;
  const exploreBtn = config.exploreBtn || 'SYNC DIMENSION';
  const noImageTag = config.noImageTag || 'RAW_CORE_DATA';
  const viewMetric = config.viewMetric || 'ENERGY';
  const siteMood = config.siteMood || 'PURE_ENERGY';

  const hasImage = showFeaturedImage && article.featuredImage;

  return (
    <article className="group relative mb-16 md:mb-32 flex flex-col lg:flex-row gap-8 md:gap-16 items-center">
      {/* 视觉主体 */}
      <div className="relative w-full lg:w-[50%] shrink-0 transition-all duration-700 group-hover:scale-[1.02]">
        {hasImage ? (
          <div className="relative aspect-[16/11] overflow-hidden rounded-2xl md:rounded-[3rem] shadow-2xl border-2 md:border-4 border-white/10">
            <img
              src={article.featuredImage!}
              alt={article.title}
              className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} mix-blend-color opacity-30`} />
            <div className="absolute inset-0 bg-black/20" />
            {/* 浮动标签 */}
            <div className="absolute top-4 md:top-8 left-4 md:left-8 px-4 md:px-6 py-1.5 md:py-2 bg-white text-black rounded-full font-black text-[9px] md:text-[10px] tracking-widest shadow-xl">
              {siteMood}
            </div>
          </div>
        ) : (
          /* 无图海报模式 */
          <div
            className={`relative aspect-[16/11] rounded-2xl md:rounded-[3rem] bg-gradient-to-br ${p.gradient} p-6 md:p-12 flex flex-col justify-between overflow-hidden shadow-2xl`}
          >
            <div className="absolute -top-8 md:-top-12 -right-8 md:-right-12 text-[8rem] md:text-[20rem] font-black text-white/10 select-none leading-none">
              CORE
            </div>
            <div className="relative z-10">
              <div className="w-8 md:w-12 h-px bg-white/40 mb-4 md:mb-6" />
              <span className="text-[9px] md:text-[10px] font-black tracking-[0.4em] text-white/60 mb-3 md:mb-4 block uppercase">
                {noImageTag}
              </span>
              <h3 className="text-2xl md:text-5xl lg:text-7xl font-black text-white leading-none tracking-tighter uppercase line-clamp-3">
                {article.title}
              </h3>
            </div>
            <div className="flex justify-between items-end relative z-10">
              <Box size={40} className="text-white/20 md:w-[60px] md:h-[60px]" />
              <div className="text-right">
                <p className="text-[9px] md:text-[10px] font-black text-white/40 uppercase">Chroma Node</p>
                <p className="text-white font-black text-xs md:text-sm">
                  {article.category?.name || 'INFINITE'}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* 卡片背后的发光层 */}
        <div
          className={`absolute -inset-4 bg-gradient-to-br ${p.gradient} rounded-[3rem] md:rounded-[4rem] -z-10 opacity-20 blur-3xl group-hover:opacity-40 transition-opacity`}
        />
      </div>

      {/* 文字主体 */}
      <div className="flex-1 space-y-4 md:space-y-8 py-4 md:py-6">
        <div className={`flex items-center gap-4 md:gap-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] opacity-50 ${p.text} ${p.darkText}`}>
          <span className="flex items-center gap-2">
            <Orbit size={12} style={{ color: p.primary }} />
            {article.category?.name || 'INFINITE'}
          </span>
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full" style={{ backgroundColor: p.primary }} />
          <span>
            {viewMetric}: {article.viewCount || 0}
          </span>
        </div>
        <Link href={`/article/${article.slug}`}>
          <h2
            className={`text-2xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] ${p.title} ${p.darkTitle} transition-all duration-500 group-hover:italic line-clamp-3`}
          >
            {article.title}
          </h2>
        </Link>
        <p className={`text-base md:text-xl lg:text-2xl font-bold opacity-50 italic leading-snug max-w-xl ${p.text} ${p.darkText}`}>
          "{truncate(article.excerpt || article.content, excerptLength)}"
        </p>
        {/* 标签 */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.id}`}
                className={`text-[9px] md:text-[10px] font-black px-3 py-1 rounded-full border border-white/20 ${p.glass} ${p.darkGlass} hover:border-white/40 transition-colors`}
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
        <Link
          href={`/article/${article.slug}`}
          className="inline-flex h-14 md:h-16 px-8 md:px-12 rounded-full bg-white text-black font-black text-[10px] md:text-xs tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-lg items-center gap-3 md:gap-4"
        >
          {exploreBtn}
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}

// ============ 文章详情 ============
function ArticleDetail({ article, config = defaultConfig }: ArticleDetailProps & { config?: ThemeConfig }) {
  const p = palettes[config.vibeMode as string] || palettes['electric-candy'];
  const showFeaturedImage = config.showFeaturedImage !== false;

  return (
    <article className="animate-in fade-in duration-700">
      <header className="relative pt-8 md:pt-20 pb-16 md:pb-32 mb-12 md:mb-20 border-b-4 md:border-b-8 border-current/20">
        <div className="space-y-8 md:space-y-12">
          <div
            className={`inline-flex items-center gap-3 md:gap-4 px-6 md:px-8 py-2 md:py-3 rounded-full bg-gradient-to-r ${p.gradient} text-white text-[10px] md:text-xs font-black tracking-[0.3em] md:tracking-[0.5em]`}
          >
            <Activity size={16} />
            LIVE_STREAM_CONNECTED
          </div>
          <h1
            className={`text-3xl md:text-6xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] ${p.title} ${p.darkTitle} uppercase break-words`}
          >
            {article.title}
          </h1>
          <div className="flex flex-wrap gap-6 md:gap-12 pt-8 md:pt-12 items-center border-t border-white/10">
            <div className="flex gap-3 md:gap-4 items-center">
              <div
                className={`w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 md:border-4 flex items-center justify-center ${p.glass} ${p.darkGlass}`}
                style={{ borderColor: p.primary }}
              >
                <span className={`text-lg md:text-2xl font-black ${p.title} ${p.darkTitle}`}>
                  {(article.author?.username || 'A')[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className={`text-[9px] md:text-[10px] font-black opacity-40 uppercase tracking-widest ${p.text} ${p.darkText}`}>
                  Mastermind
                </p>
                <p className={`text-lg md:text-2xl font-black ${p.title} ${p.darkTitle}`}>
                  {article.author?.username || 'GHOST_USER'}
                </p>
              </div>
            </div>
            <div className="h-8 md:h-12 w-px bg-white/10 hidden md:block" />
            <div>
              <p className={`text-[9px] md:text-[10px] font-black opacity-40 uppercase tracking-widest ${p.text} ${p.darkText}`}>
                Dimension
              </p>
              <p className={`text-lg md:text-2xl font-black ${p.title} ${p.darkTitle}`}>
                {article.category?.name || 'CORE'}
              </p>
            </div>
            <div className="h-8 md:h-12 w-px bg-white/10 hidden md:block" />
            <div>
              <p className={`text-[9px] md:text-[10px] font-black opacity-40 uppercase tracking-widest ${p.text} ${p.darkText}`}>
                Timestamp
              </p>
              <p className={`text-lg md:text-2xl font-black ${p.title} ${p.darkTitle}`}>
                {formatDate(article.publishedAt || article.createdAt).split(' ')[0]}
              </p>
            </div>
            <div className="flex-1" />
            <button
              className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl border-2 ${p.glass} ${p.darkGlass} flex items-center justify-center hover:scale-110 transition-all cursor-pointer`}
              style={{ borderColor: `${p.primary}40` }}
            >
              <Share2 size={20} className={p.title} />
            </button>
          </div>
        </div>
      </header>

      {/* 特色图片 */}
      {showFeaturedImage && article.featuredImage && (
        <div className="w-full aspect-video mb-12 md:mb-20 overflow-hidden rounded-2xl md:rounded-[3rem] shadow-2xl">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 阅读区布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
        <aside className="lg:col-span-3 hidden xl:block space-y-8 md:space-y-12">
          <div className={`p-6 md:p-8 border-2 md:border-4 rounded-2xl md:rounded-[3rem] space-y-6 md:space-y-8 ${p.glass} ${p.darkGlass}`} style={{ borderColor: `${p.primary}30` }}>
            <h4 className={`text-[9px] md:text-[10px] font-black tracking-[0.3em] opacity-50 uppercase ${p.text} ${p.darkText}`}>
              System Context
            </h4>
            <p className={`text-xs font-bold leading-relaxed italic opacity-70 ${p.text} ${p.darkText}`}>
              当前处于高维同步模式。内容已通过全息协议验证。情感指数：100% 多巴胺。
            </p>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" style={{ animationDelay: '0.3s' }} />
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" style={{ animationDelay: '0.7s' }} />
            </div>
          </div>
          {/* 阅读量 */}
          <div className={`p-6 rounded-2xl ${p.glass} ${p.darkGlass} text-center`}>
            <Eye size={24} className="mx-auto mb-2 opacity-40" />
            <p className={`text-2xl font-black ${p.title} ${p.darkTitle}`}>{article.viewCount || 0}</p>
            <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${p.text} ${p.darkText}`}>Views</p>
          </div>
        </aside>

        <div className="lg:col-span-9">
          <div
            className={`prose prose-lg md:prose-2xl max-w-none
              prose-headings:font-black prose-headings:tracking-tighter
              prose-headings:${p.isLightTheme ? 'text-slate-900' : 'text-white'}
              dark:prose-headings:text-white
              prose-p:font-medium prose-p:leading-relaxed prose-p:mb-8
              prose-p:${p.isLightTheme ? 'text-slate-700' : 'text-slate-300'}
              dark:prose-p:text-slate-300
              prose-strong:${p.isLightTheme ? 'text-slate-900' : 'text-white'}
              dark:prose-strong:text-white
              prose-a:text-pink-500 dark:prose-a:text-pink-400
              prose-blockquote:border-l-[8px] md:prose-blockquote:border-l-[16px]
              prose-blockquote:${p.isLightTheme ? 'border-slate-300 bg-slate-100' : 'border-pink-500 bg-white/5'}
              dark:prose-blockquote:border-pink-500 dark:prose-blockquote:bg-white/5
              prose-blockquote:p-6 md:prose-blockquote:p-12 prose-blockquote:rounded-r-2xl md:prose-blockquote:rounded-r-[3rem] prose-blockquote:italic
              prose-blockquote:${p.isLightTheme ? 'text-slate-600' : 'text-slate-300'}
              dark:prose-blockquote:text-slate-300
              prose-img:rounded-2xl md:prose-img:rounded-[3rem] prose-img:border-4 md:prose-img:border-8 prose-img:border-white/5
              prose-code:${p.isLightTheme ? 'text-pink-600' : 'text-pink-400'}
              dark:prose-code:text-pink-400
              prose-pre:${p.isLightTheme ? 'bg-slate-100' : 'bg-slate-900'}
              dark:prose-pre:bg-slate-900 prose-pre:rounded-2xl
              prose-li:${p.isLightTheme ? 'text-slate-700' : 'text-slate-300'}
              dark:prose-li:text-slate-300`}
            dangerouslySetInnerHTML={{ __html: article.htmlContent || article.content }}
          />
        </div>
      </div>

      {/* 标签 */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-12 md:mt-16 pt-8 border-t border-white/10">
          {article.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.id}`}
              className={`px-5 py-2.5 rounded-full text-sm font-black ${p.glass} ${p.darkGlass} border border-white/20 hover:border-white/40 transition-colors ${p.text} ${p.darkText}`}
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* 底部CTA */}
      <footer
        className={`mt-20 md:mt-32 p-12 md:p-24 rounded-[2rem] md:rounded-[4rem] bg-gradient-to-br ${p.gradient} text-center relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black opacity-10" />
        <h4 className="text-2xl md:text-5xl lg:text-7xl font-black tracking-tight text-white uppercase italic mb-8 md:mb-12 relative z-10">
          STAY VIBRANT.
          <br />
          DISCONNECT?
        </h4>
        <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 relative z-10">
          <Link
            href="/"
            className="h-14 md:h-16 px-10 md:px-16 bg-white text-black font-black text-xs md:text-sm tracking-[0.3em] hover:scale-105 transition-all rounded-full shadow-2xl flex items-center justify-center"
          >
            RE-SYNC
          </Link>
          <Link
            href="/categories"
            className="h-14 md:h-16 px-10 md:px-16 border-2 md:border-4 border-white text-white font-black text-xs md:text-sm tracking-[0.3em] hover:bg-white hover:text-black transition-all rounded-full flex items-center justify-center"
          >
            EXPLORE MORE
          </Link>
        </div>
      </footer>
    </article>
  );
}


// ============ 分类列表 ============
function CategoryList({ categories, config = defaultConfig }: CategoryListProps & { config?: ThemeConfig }) {
  const p = palettes[config.vibeMode as string] || palettes['electric-candy'];

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
          className={`inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/20 ${p.glass} ${p.darkGlass} text-[10px] font-black uppercase tracking-[0.5em] mb-8`}
        >
          <Folder size={16} style={{ color: p.primary }} />
          <span className={p.text}>SPECTRUM_INDEX</span>
        </div>
        <h1 className={`text-4xl md:text-6xl lg:text-[10rem] font-black tracking-tighter ${p.title} ${p.darkTitle} uppercase`}>
          SPECTRUM
        </h1>
        <p className={`mt-6 text-base md:text-lg opacity-50 ${p.text} ${p.darkText}`}>
          探索所有维度分类
        </p>
      </div>

      {/* 分类网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {flatCategories.map(({ category, isChild }, index) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className={`group relative p-8 md:p-12 rounded-2xl md:rounded-[3rem] ${p.glass} ${p.darkGlass} border border-white/10 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:border-white/30 ${
              isChild ? 'ml-4 md:ml-8' : ''
            }`}
          >
            {/* 背景发光 */}
            <div
              className={`absolute -inset-2 bg-gradient-to-br ${p.gradient} rounded-[3rem] -z-10 opacity-0 group-hover:opacity-20 blur-2xl transition-opacity`}
            />
            <div className="flex justify-between items-start mb-6">
              <div
                className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center ${p.glass} ${p.darkGlass}`}
                style={{ borderColor: `${p.primary}30` }}
              >
                <Layers style={{ color: p.primary }} size={24} />
              </div>
              <span className={`text-4xl md:text-6xl font-black opacity-10 font-mono ${p.title} ${p.darkTitle}`}>
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <h2 className={`text-xl md:text-3xl font-black tracking-tight mb-2 ${p.title} ${p.darkTitle}`}>
              {isChild && <span className="opacity-30 mr-2">└</span>}
              {category.name}
            </h2>
            {category.description && (
              <p className={`text-sm opacity-50 line-clamp-2 mb-4 ${p.text} ${p.darkText}`}>
                {category.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <p className={`text-xs font-black uppercase tracking-wider opacity-40 ${p.text} ${p.darkText}`}>
                {category._count?.articles || 0} NODES
              </p>
              <ChevronRight size={20} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {flatCategories.length === 0 && (
        <div className="p-24 text-center">
          <Layers size={64} className="mx-auto mb-4 opacity-10" />
          <p className={`text-xl font-black opacity-20 italic ${p.title} ${p.darkTitle}`}>
            SPECTRUM_EMPTY
          </p>
        </div>
      )}
    </div>
  );
}

// ============ 标签列表 ============
function TagList({ tags, config = defaultConfig }: TagListProps & { config?: ThemeConfig }) {
  const p = palettes[config.vibeMode as string] || palettes['electric-candy'];

  return (
    <div>
      {/* 页面标题 */}
      <div className="text-center mb-16 md:mb-24">
        <div
          className={`inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/20 ${p.glass} ${p.darkGlass} text-[10px] font-black uppercase tracking-[0.5em] mb-8`}
        >
          <Hash size={16} style={{ color: p.primary }} />
          <span className={p.text}>FRAGMENT_CLOUD</span>
        </div>
        <h1 className={`text-4xl md:text-6xl lg:text-[10rem] font-black tracking-tighter ${p.title} ${p.darkTitle} uppercase`}>
          FRAGMENTS
        </h1>
        <p className={`mt-6 text-base md:text-lg opacity-50 ${p.text} ${p.darkText}`}>
          碎片化的主题标签
        </p>
      </div>

      {/* 标签云 */}
      <div
        className={`p-8 md:p-16 rounded-2xl md:rounded-[3rem] ${p.glass} ${p.darkGlass} border border-white/10 backdrop-blur-sm`}
      >
        <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
          {tags.map((tag, index) => {
            const count = tag._count?.articles || 0;
            const size =
              count > 10
                ? 'text-xl md:text-2xl px-6 md:px-8 py-3 md:py-4'
                : count > 5
                ? 'text-lg md:text-xl px-5 md:px-6 py-2.5 md:py-3'
                : 'text-base px-4 md:px-5 py-2 md:py-2.5';
            const isHot = index < 3;

            return (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className={`${size} rounded-full font-black transition-all hover:scale-105 flex items-center gap-2`}
                style={{
                  backgroundColor: isHot ? p.primary : `${p.primary}20`,
                  color: isHot ? 'white' : p.primary,
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
          <Hash size={64} className="mx-auto mb-4 opacity-10" />
          <p className={`text-xl font-black opacity-20 italic ${p.title} ${p.darkTitle}`}>
            FRAGMENTS_EMPTY
          </p>
        </div>
      )}
    </div>
  );
}

// ============ 搜索结果 ============
function SearchResults({ articles, total, query, config = defaultConfig }: SearchResultProps & { config?: ThemeConfig }) {
  const p = palettes[config.vibeMode as string] || palettes['electric-candy'];

  if (!query) return null;

  return (
    <div className="space-y-16 md:space-y-24">
      {/* 搜索标题 */}
      <div className="py-12 md:py-24 border-b-4 md:border-b-8 border-current/20 text-center">
        <div
          className={`inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/20 ${p.glass} ${p.darkGlass} text-[10px] font-black uppercase tracking-[0.5em] mb-8`}
        >
          <Search size={16} style={{ color: p.primary }} />
          <span className={p.text}>RESONANCE_FILTER</span>
        </div>
        <h2 className={`text-3xl md:text-6xl lg:text-[10rem] font-black tracking-tighter leading-[0.8] uppercase ${p.title} ${p.darkTitle}`}>
          RESONANCE
          <br />
          <span
            className="text-transparent"
            style={{ WebkitTextStroke: `2px ${p.primary}` }}
          >
            "{query}"
          </span>
        </h2>
        <p className={`mt-6 text-base md:text-lg opacity-50 ${p.text} ${p.darkText}`}>
          找到 <span style={{ color: p.primary }} className="font-black">{total}</span> 个匹配节点
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
          <Search size={64} className="mx-auto mb-4 opacity-10" />
          <p className={`text-xl font-black opacity-20 italic ${p.title} ${p.darkTitle}`}>
            NO_RESONANCE_FOUND
          </p>
          <p className={`text-sm opacity-30 mt-2 ${p.text} ${p.darkText}`}>
            尝试使用其他关键词搜索
          </p>
        </div>
      )}
    </div>
  );
}

// ============ 导出主题 ============
export const ChromaDimensionTheme: ThemeComponents = {
  name: 'chroma-dimension',
  displayName: '幻彩维度',
  description: '极致多巴胺美学：未来波普排版、液态金属背景，支持有图全息与无图海报双重前卫视觉',
  configOptions,
  defaultConfig,
  BlogLayout,
  ArticleCard,
  ArticleDetail,
  CategoryList,
  TagList,
  SearchResults,
};
