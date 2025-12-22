// Chroma Dimension 主题 - 幻彩维度：极致多巴胺美学，未来波普排版
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { SearchBox } from '../../components/SearchBox';
import { DesktopNavMenu, MobileNavMenu } from '../../components/NavMenu';
import { formatDate, truncate } from '../../lib/utils';
import { useSiteSettingsContext } from '../../contexts/site-settings-context';
import {
  Zap,
  Orbit,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Eye,
  Cpu,
  Share2,
  Activity,
  Radio,
  Dna,
  Layers,
  Smile,
  Globe,
  Folder,
  Search,
  Hash,
  Menu,
  X,
  Clock,
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
      { value: 'cyber-pulse', label: '赛博脉冲 (动态霓虹)' },
      { value: 'rainbow-vortex', label: '彩虹漩涡 (动态彩虹)' },
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
    key: 'showArticleDetailFeaturedImage',
    label: '文章页显示特色图',
    type: 'boolean',
    default: true,
    description: '在文章详情页显示特色图片',
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
  showArticleDetailFeaturedImage: true,
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
  isDynamic?: boolean;
  animationType?: 'pulse' | 'vortex';
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
  'cyber-pulse': {
    primary: '#00FFFF',
    secondary: '#FF00FF',
    accent: '#FFFF00',
    bg: 'bg-[#050510]',
    darkBg: 'dark:bg-black',
    text: 'text-cyan-400',
    darkText: 'dark:text-cyan-300',
    title: 'text-white',
    darkTitle: 'dark:text-white',
    glass: 'bg-white/5',
    darkGlass: 'dark:bg-white/5',
    gradient: 'from-[#00FFFF] via-[#FF00FF] to-[#FFFF00]',
    isLightTheme: false,
    isDynamic: true,
    animationType: 'pulse',
  },
  'rainbow-vortex': {
    primary: '#FF0000',
    secondary: '#00FF00',
    accent: '#0000FF',
    bg: 'bg-[#0a0a15]',
    darkBg: 'dark:bg-black',
    text: 'text-purple-300',
    darkText: 'dark:text-purple-200',
    title: 'text-white',
    darkTitle: 'dark:text-white',
    glass: 'bg-white/5',
    darkGlass: 'dark:bg-white/5',
    gradient: 'from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500',
    isLightTheme: false,
    isDynamic: true,
    animationType: 'vortex',
  },
};

// ============ 液态流动背景 ============
function LiquidBackground({ config }: { config: ThemeConfig }) {
  const p = palettes[config.vibeMode as string] || palettes['electric-candy'];
  const motion = config.liquidMotion || 'vibrant';
  const animationDuration = motion === 'gentle' ? '20s' : motion === 'insane' ? '5s' : '10s';
  const paletteAny = p as any;
  const isDynamic = paletteAny.isDynamic;
  const animationType = paletteAny.animationType;

  // 赛博脉冲 - 霓虹闪烁动画
  if (isDynamic && animationType === 'pulse') {
    return (
      <div className={`fixed inset-0 -z-10 ${p.bg} ${p.darkBg} transition-colors duration-1000 overflow-hidden`}>
        {/* 动态霓虹脉冲光斑 */}
        <div
          className="absolute top-[-20%] left-[-20%] w-[100vw] h-[100vw] rounded-full blur-[150px] opacity-50 animate-cyber-pulse-1"
          style={{ backgroundColor: '#00FFFF' }}
        />
        <div
          className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] rounded-full blur-[120px] opacity-40 animate-cyber-pulse-2"
          style={{ backgroundColor: '#FF00FF' }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-[50vw] h-[50vw] rounded-full blur-[100px] opacity-30 animate-cyber-pulse-3"
          style={{ backgroundColor: '#FFFF00' }}
        />
        {/* 扫描线效果 */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,255,0.03)_2px,rgba(0,255,255,0.03)_4px)] animate-scan-lines" />
        {/* 网格装饰 */}
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#0ff_1px,transparent_1px)] [background-size:30px_30px]" />
        {/* 动态CSS */}
        <style jsx>{`
          @keyframes cyber-pulse-1 {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
          }
          @keyframes cyber-pulse-2 {
            0%, 100% { opacity: 0.4; transform: scale(1) rotate(0deg); }
            50% { opacity: 0.7; transform: scale(1.15) rotate(10deg); }
          }
          @keyframes cyber-pulse-3 {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            33% { opacity: 0.6; transform: scale(1.2); }
            66% { opacity: 0.4; transform: scale(0.9); }
          }
          @keyframes scan-lines {
            0% { transform: translateY(0); }
            100% { transform: translateY(4px); }
          }
          .animate-cyber-pulse-1 { animation: cyber-pulse-1 3s ease-in-out infinite; }
          .animate-cyber-pulse-2 { animation: cyber-pulse-2 4s ease-in-out infinite; }
          .animate-cyber-pulse-3 { animation: cyber-pulse-3 5s ease-in-out infinite; }
          .animate-scan-lines { animation: scan-lines 0.1s linear infinite; }
        `}</style>
      </div>
    );
  }

  // 彩虹漩涡 - 彩虹旋转流动动画
  if (isDynamic && animationType === 'vortex') {
    return (
      <div className={`fixed inset-0 -z-10 ${p.bg} ${p.darkBg} transition-colors duration-1000 overflow-hidden`}>
        {/* 彩虹漩涡中心 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] animate-rainbow-spin">
          <div className="absolute inset-0 rounded-full blur-[200px] opacity-30 bg-[conic-gradient(from_0deg,#ff0000,#ff8800,#ffff00,#00ff00,#00ffff,#0088ff,#8800ff,#ff00ff,#ff0000)]" />
        </div>
        {/* 外圈光环 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] animate-rainbow-spin-reverse">
          <div className="absolute inset-0 rounded-full blur-[150px] opacity-20 bg-[conic-gradient(from_180deg,#ff00ff,#00ffff,#ffff00,#ff00ff)]" />
        </div>
        {/* 流动粒子效果 */}
        <div className="absolute inset-0">
          <div className="absolute top-[20%] left-[10%] w-4 h-4 rounded-full bg-red-500 blur-sm opacity-60 animate-float-1" />
          <div className="absolute top-[40%] right-[15%] w-3 h-3 rounded-full bg-yellow-400 blur-sm opacity-60 animate-float-2" />
          <div className="absolute bottom-[30%] left-[20%] w-5 h-5 rounded-full bg-green-400 blur-sm opacity-60 animate-float-3" />
          <div className="absolute top-[60%] right-[25%] w-4 h-4 rounded-full bg-blue-400 blur-sm opacity-60 animate-float-4" />
          <div className="absolute bottom-[20%] right-[10%] w-3 h-3 rounded-full bg-purple-500 blur-sm opacity-60 animate-float-5" />
        </div>
        {/* 网格装饰 */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]" />
        {/* 动态CSS */}
        <style jsx>{`
          @keyframes rainbow-spin {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
          @keyframes rainbow-spin-reverse {
            0% { transform: translate(-50%, -50%) rotate(360deg); }
            100% { transform: translate(-50%, -50%) rotate(0deg); }
          }
          @keyframes float-1 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
            25% { transform: translate(100px, -50px) scale(1.5); opacity: 0.8; }
            50% { transform: translate(50px, 100px) scale(1); opacity: 0.4; }
            75% { transform: translate(-50px, 50px) scale(1.3); opacity: 0.7; }
          }
          @keyframes float-2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-80px, 60px) scale(1.4); }
            66% { transform: translate(60px, -40px) scale(0.8); }
          }
          @keyframes float-3 {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(120px, -80px); }
          }
          @keyframes float-4 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(-60px, -60px) scale(1.2); }
            75% { transform: translate(40px, 80px) scale(0.9); }
          }
          @keyframes float-5 {
            0%, 100% { transform: translate(0, 0); opacity: 0.6; }
            50% { transform: translate(-100px, -60px); opacity: 0.9; }
          }
          .animate-rainbow-spin { animation: rainbow-spin 20s linear infinite; }
          .animate-rainbow-spin-reverse { animation: rainbow-spin-reverse 30s linear infinite; }
          .animate-float-1 { animation: float-1 8s ease-in-out infinite; }
          .animate-float-2 { animation: float-2 10s ease-in-out infinite; }
          .animate-float-3 { animation: float-3 12s ease-in-out infinite; }
          .animate-float-4 { animation: float-4 9s ease-in-out infinite; }
          .animate-float-5 { animation: float-5 11s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }

  // 默认静态背景
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
  const siteLogo = settings.siteLogo;
  const siteMood = config.siteMood || 'PURE_ENERGY';
  const heroTagline = config.heroTagline || 'HIGH_FREQUENCY_MODE';
  const footerText = settings.footerText?.replace('{year}', new Date().getFullYear().toString())
    || `© ${new Date().getFullYear()} ${siteName}`;

  const defaultNavItems = [
    { id: '1', label: 'SPECTRUM', url: '/', type: 'internal' as const, sortOrder: 0 },
    { id: '2', label: 'ARCHIVE', url: '/categories', type: 'internal' as const, sortOrder: 1 },
    { id: '3', label: 'FRAGMENTS', url: '/tags', type: 'internal' as const, sortOrder: 2 },
    { id: '4', label: 'ABOUT', url: '/about', type: 'internal' as const, sortOrder: 3 },
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
          {siteLogo ? (
            <img src={siteLogo} alt={siteName} className="h-10 md:h-12 w-auto" />
          ) : (
            <div
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${p.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
            >
              <Zap className="text-white" size={20} fill="white" />
            </div>
          )}
          <div className="flex flex-col">
            <span className={`text-lg md:text-2xl font-black tracking-widest ${p.title} ${p.darkTitle}`}>
              {siteName}
            </span>
            <span className={`text-[8px] md:text-[10px] font-bold opacity-40 tracking-[0.3em] uppercase ${p.text} ${p.darkText}`}>
              {siteMood}
            </span>
          </div>
        </Link>

        {/* 桌面导航 - 使用支持多级菜单的组件 */}
        <DesktopNavMenu
          items={navItems}
          className="hidden lg:flex items-center gap-6 xl:gap-10"
          itemClassName={`text-sm font-black uppercase tracking-[0.15em] xl:tracking-[0.2em] hover:opacity-100 opacity-60 transition-all relative ${p.text} ${p.darkText}`}
        />
        <div className="hidden lg:flex items-center gap-4">
          <SearchBox />
        </div>

        {/* 移动端菜单按钮 */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`w-10 h-10 rounded-xl ${p.glass} ${p.darkGlass} border border-white/20 flex items-center justify-center`}
            aria-label="菜单"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* 移动端菜单 - 使用支持多级菜单的组件 */}
      {mobileMenuOpen && (
        <MobileNavMenu items={navItems} onClose={() => setMobileMenuOpen(false)} />
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


// ============ 文章卡片：常规列表卡片布局 ============
function ArticleCard({ article, config = defaultConfig }: ArticleCardProps & { config?: ThemeConfig }) {
  const p = palettes[config.vibeMode as string] || palettes['electric-candy'];
  const showFeaturedImage = config.showFeaturedImage !== false;
  const excerptLength = config.excerptLength || 120;

  return (
    <article className={`group relative mb-6 rounded-2xl md:rounded-3xl ${p.glass} ${p.darkGlass} border border-white/10 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:border-white/30 hover:shadow-xl overflow-hidden`}>
      {/* 背景发光效果 */}
      <div
        className={`absolute -inset-1 bg-gradient-to-br ${p.gradient} rounded-3xl -z-10 opacity-0 group-hover:opacity-20 blur-xl transition-opacity`}
      />
      
      {/* 特色图片 - 在卡片顶部，参考 vibrant 主题样式 */}
      {showFeaturedImage && article.featuredImage && (
        <div className="relative h-48 md:h-56 overflow-hidden">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* 渐变遮罩 */}
          <div className={`absolute inset-0 bg-gradient-to-t ${p.isLightTheme ? 'from-white/80 via-white/20' : 'from-black/80 via-black/20'} to-transparent`} />
          {/* 色彩叠加 */}
          <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} mix-blend-overlay opacity-30`} />
        </div>
      )}

      {/* 内容区域 */}
      <div className="p-6 md:p-8">
        {/* 元信息 */}
        <div className={`flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider opacity-60 mb-3 ${p.text} ${p.darkText}`}>
          <span className="flex items-center gap-1.5">
            <Orbit size={14} style={{ color: p.primary }} />
            {article.category?.name || '未分类'}
          </span>
          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: p.primary }} />
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDate(article.publishedAt || article.createdAt).split(' ')[0]}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={12} />
            {article.viewCount || 0}
          </span>
        </div>

        {/* 标题 */}
        <Link href={`/article/${article.slug}`}>
          <h2 className={`text-xl md:text-2xl font-black tracking-tight leading-tight mb-3 ${p.title} ${p.darkTitle} group-hover:opacity-80 transition-opacity line-clamp-2`}>
            {article.title}
          </h2>
        </Link>

        {/* 摘要 */}
        <p className={`text-sm md:text-base opacity-60 leading-relaxed mb-4 line-clamp-2 ${p.text} ${p.darkText}`}>
          {truncate(article.excerpt || article.content, excerptLength)}
        </p>

        {/* 底部：标签和阅读更多 */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* 标签 */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.id}`}
                  className={`text-xs font-bold px-3 py-1 rounded-full border border-white/20 ${p.glass} hover:border-white/40 transition-colors ${p.text} ${p.darkText} opacity-70 hover:opacity-100`}
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* 阅读更多 */}
          <Link
            href={`/article/${article.slug}`}
            className={`shrink-0 flex items-center gap-2 text-xs font-black uppercase tracking-wider group-hover:gap-3 transition-all ${p.text} ${p.darkText} opacity-80 hover:opacity-100`}
          >
            阅读全文
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}

// ============ 文章详情 ============
function ArticleDetail({ article, config = defaultConfig }: ArticleDetailProps & { config?: ThemeConfig }) {
  const p = palettes[config.vibeMode as string] || palettes['electric-candy'];
  const showArticleDetailFeaturedImage = config.showArticleDetailFeaturedImage !== false;

  // 从文章内容提取目录
  const articleAny = article as any;
  const toc = articleAny.toc && articleAny.toc.length > 0 
    ? articleAny.toc 
    : extractTOCFromContent(article.content);

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
                className={`w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 md:border-4 flex items-center justify-center ${p.glass} ${p.darkGlass} border-white/30`}
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
              onClick={async () => {
                const shareData = {
                  title: article.title,
                  text: (article as any).excerpt || article.title,
                  url: window.location.href,
                };
                try {
                  if (navigator.share) {
                    await navigator.share(shareData);
                  } else {
                    await navigator.clipboard.writeText(window.location.href);
                    alert('链接已复制到剪贴板');
                  }
                } catch (err) {
                  // 用户取消分享或复制失败
                }
              }}
              className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl border-2 ${p.glass} ${p.darkGlass} flex items-center justify-center hover:scale-110 transition-all cursor-pointer`}
              style={{ borderColor: `${p.primary}40` }}
              title="分享文章"
            >
              <Share2 size={20} className={p.title} />
            </button>
          </div>
        </div>
      </header>

      {/* 特色图片 */}
      {showArticleDetailFeaturedImage && article.featuredImage && (
        <div className="w-full aspect-video mb-12 md:mb-20 overflow-hidden rounded-2xl md:rounded-[3rem] shadow-2xl">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 阅读区布局 - 左侧边栏统一宽度280px，固定定位 */}
      <div className="flex gap-8 md:gap-12">
        <aside className="hidden xl:block shrink-0" style={{ width: '280px' }}>
          <div className="sticky top-24 space-y-6">
            {/* System Context 模块 */}
            <div className={`p-6 border-2 rounded-2xl space-y-6 ${p.glass} ${p.darkGlass}`} style={{ borderColor: `${p.primary}30` }}>
              <h4 className={`text-[10px] font-black tracking-[0.3em] opacity-50 uppercase ${p.text} ${p.darkText}`}>
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

            {/* Views 模块 */}
            <div className={`p-6 rounded-2xl ${p.glass} ${p.darkGlass} text-center`}>
              <Eye size={24} className="mx-auto mb-2 opacity-40" />
              <p className={`text-2xl font-black ${p.title} ${p.darkTitle}`}>{article.viewCount || 0}</p>
              <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${p.text} ${p.darkText}`}>Views</p>
            </div>

            {/* 目录模块 - 放在 Views 下面 */}
            {toc.length > 0 && (
              <div className={`p-6 rounded-2xl ${p.glass} ${p.darkGlass} border border-white/10`}>
                <h4 className={`text-[10px] font-black tracking-[0.3em] opacity-50 uppercase mb-4 ${p.text} ${p.darkText}`}>
                  Navigation
                </h4>
                <nav className="text-sm max-h-[40vh] overflow-y-auto pr-1">
                  <ul className="space-y-2">
                    {toc.map((item: any, index: number) => (
                      <li key={`${item.id}-${index}`}>
                        <a
                          href={`#${item.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            const element = document.getElementById(item.id);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              window.history.pushState(null, '', `#${item.id}`);
                            }
                          }}
                          className={`block py-1 transition-colors opacity-70 hover:opacity-100 hover:text-pink-400 line-clamp-2 ${p.text} ${p.darkText}`}
                          title={item.text}
                        >
                          {item.text}
                        </a>
                        {item.children && item.children.length > 0 && (
                          <ul className="ml-3 mt-1 space-y-1 border-l border-white/20 pl-2">
                            {item.children.map((child: any, childIndex: number) => (
                              <li key={`${child.id}-${childIndex}`}>
                                <a
                                  href={`#${child.id}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const element = document.getElementById(child.id);
                                    if (element) {
                                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                      window.history.pushState(null, '', `#${child.id}`);
                                    }
                                  }}
                                  className={`block py-0.5 text-xs transition-colors opacity-60 hover:opacity-100 hover:text-pink-400 line-clamp-1 ${p.text} ${p.darkText}`}
                                  title={child.text}
                                >
                                  {child.text}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div
            className={`prose prose-lg md:prose-2xl max-w-none
              prose-headings:font-black prose-headings:tracking-tighter
              prose-h1:text-slate-900 prose-h2:text-slate-900 prose-h3:text-slate-900 prose-h4:text-slate-900
              dark:prose-h1:text-white dark:prose-h2:text-white dark:prose-h3:text-white dark:prose-h4:text-white
              prose-p:font-medium prose-p:leading-relaxed prose-p:mb-8
              prose-p:text-slate-700 dark:prose-p:text-slate-300
              prose-strong:text-slate-900 dark:prose-strong:text-white
              prose-a:text-pink-500 dark:prose-a:text-pink-400
              prose-blockquote:border-l-[8px] md:prose-blockquote:border-l-[16px]
              prose-blockquote:border-pink-500 prose-blockquote:bg-white/5
              dark:prose-blockquote:border-pink-500 dark:prose-blockquote:bg-white/5
              prose-blockquote:p-6 md:prose-blockquote:p-12 prose-blockquote:rounded-r-2xl md:prose-blockquote:rounded-r-[3rem] prose-blockquote:italic
              prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-300
              prose-img:rounded-2xl md:prose-img:rounded-[3rem] prose-img:border-4 md:prose-img:border-8 prose-img:border-white/5
              prose-code:text-pink-600 dark:prose-code:text-pink-400
              prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900 prose-pre:rounded-2xl prose-pre:overflow-x-auto
              prose-li:text-slate-700 dark:prose-li:text-slate-300
              ${p.isLightTheme ? '' : '[&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_p]:!text-slate-300 [&_li]:!text-slate-300 [&_strong]:!text-white [&_blockquote]:!text-slate-300'}`}
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

// 从内容提取目录的辅助函数
function extractTOCFromContent(content: string): any[] {
  if (!content) return [];
  
  const contentWithoutCode = content.replace(/```[\s\S]*?```/g, '');
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const flatToc: any[] = [];
  const idCounter: Record<string, number> = {};
  let match;

  while ((match = headingRegex.exec(contentWithoutCode)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const baseId = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5\s-]/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
    
    let id = baseId;
    if (idCounter[baseId] !== undefined) {
      idCounter[baseId]++;
      id = `${baseId}-${idCounter[baseId]}`;
    } else {
      idCounter[baseId] = 0;
    }
    
    flatToc.push({ id, text, level, children: [] });
  }

  // 构建树形结构
  const result: any[] = [];
  const stack: any[] = [];

  for (const item of flatToc) {
    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      result.push(item);
    } else {
      stack[stack.length - 1].children.push(item);
    }
    stack.push(item);
  }

  return result;
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
