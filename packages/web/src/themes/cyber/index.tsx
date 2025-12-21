// 赛博朋克主题 - 科技感极光背景，深色调，霓虹高亮
import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { SearchBox } from '../../components/SearchBox';
import { DesktopNavMenu, MobileNavMenu } from '../../components/NavMenu';
import { formatDate, truncate } from '../../lib/utils';
import { useSiteSettingsContext } from '../../contexts/site-settings-context';
import {
  Cpu,
  Zap,
  Clock,
  Activity,
  Terminal,
  ArrowUpRight,
  Radio,
  Layers,
  Database,
  Shield,
  Code2,
  Workflow,
  Eye,
  Tag,
  Folder,
  Search,
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
    key: 'accentColor',
    label: '主题色',
    type: 'select',
    options: [
      { value: 'emerald', label: '翠绿 (Emerald)' },
      { value: 'cyan', label: '青色 (Cyan)' },
      { value: 'violet', label: '紫罗兰 (Violet)' },
      { value: 'rose', label: '玫红 (Rose)' },
      { value: 'amber', label: '琥珀 (Amber)' },
    ],
    default: 'emerald',
    description: '霓虹高亮色调',
  },
  {
    key: 'showAurora',
    label: '显示极光背景',
    type: 'boolean',
    default: true,
    description: '显示动态极光光晕效果',
  },
  {
    key: 'showGrid',
    label: '显示网格背景',
    type: 'boolean',
    default: true,
    description: '显示精细网格纹理',
  },
  {
    key: 'showUptime',
    label: '显示运行时间',
    type: 'boolean',
    default: true,
    description: '在导航栏显示系统运行时间',
  },
  {
    key: 'showFeaturedImage',
    label: '显示特色图',
    type: 'boolean',
    default: true,
    description: '在文章卡片中显示特色图片',
  },
  {
    key: 'showInteractiveGlow',
    label: '显示互动光效',
    type: 'boolean',
    default: true,
    description: '鼠标悬停时显示动态光圈效果',
  },
  {
    key: 'cardStyle',
    label: '卡片样式',
    type: 'select',
    options: [
      { value: 'glass', label: '玻璃拟态' },
      { value: 'solid', label: '实心边框' },
      { value: 'gradient', label: '渐变边框' },
    ],
    default: 'glass',
    description: '文章卡片的视觉样式',
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
    default: '2',
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
    key: 'heroTitle',
    label: 'Hero 标题',
    type: 'text',
    default: 'CORE_PRISM',
    description: '首页大标题文字',
  },
  {
    key: 'heroSubtitle',
    label: 'Hero 副标题',
    type: 'text',
    default: '// 正在同步数字化资产... 这是一个融合了精密逻辑架构与感官视觉美学的实验性节点。',
    description: '首页副标题文字',
  },
  {
    key: 'showHeroStats',
    label: '显示 Hero 统计',
    type: 'boolean',
    default: true,
    description: '在首页显示统计数据块',
  },
  {
    key: 'terminalPrefix',
    label: '终端前缀',
    type: 'text',
    default: 'PRISM_NODE',
    description: '导航栏显示的终端标识',
  },
];

const defaultConfig: ThemeConfig = {
  accentColor: 'emerald',
  showAurora: true,
  showGrid: true,
  showUptime: true,
  showFeaturedImage: true,
  showInteractiveGlow: true,
  cardStyle: 'glass',
  gridColumns: '2',
  excerptLength: 120,
  heroTitle: 'CORE_PRISM',
  heroSubtitle: '// 正在同步数字化资产... 这是一个融合了精密逻辑架构与感官视觉美学的实验性节点。',
  showHeroStats: true,
  terminalPrefix: 'PRISM_NODE',
};

// 配色方案
const accentColors: Record<string, { primary: string; glow: string; text: string; bg: string; border: string }> = {
  emerald: {
    primary: 'emerald-500',
    glow: 'rgba(16, 185, 129, 0.1)',
    text: 'text-emerald-500',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500',
  },
  cyan: {
    primary: 'cyan-500',
    glow: 'rgba(6, 182, 212, 0.1)',
    text: 'text-cyan-500',
    bg: 'bg-cyan-500',
    border: 'border-cyan-500',
  },
  violet: {
    primary: 'violet-500',
    glow: 'rgba(139, 92, 246, 0.1)',
    text: 'text-violet-500',
    bg: 'bg-violet-500',
    border: 'border-violet-500',
  },
  rose: {
    primary: 'rose-500',
    glow: 'rgba(244, 63, 94, 0.1)',
    text: 'text-rose-500',
    bg: 'bg-rose-500',
    border: 'border-rose-500',
  },
  amber: {
    primary: 'amber-500',
    glow: 'rgba(245, 158, 11, 0.1)',
    text: 'text-amber-500',
    bg: 'bg-amber-500',
    border: 'border-amber-500',
  },
};

// 网格列数映射
const gridClasses: Record<string, string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};


// ============ 极光背景系统 ============
function AuroraBackground({ config }: { config: ThemeConfig }) {
  const colors = accentColors[config.accentColor] || accentColors.emerald;
  
  if (!config.showAurora && !config.showGrid) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0d1117]">
      {/* 极光光晕 */}
      {config.showAurora && (
        <>
          <div 
            className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] animate-pulse`}
            style={{ backgroundColor: colors.glow }}
          />
          <div 
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </>
      )}
      {/* 精细网格 */}
      {config.showGrid && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      )}
      {/* 微小噪点 */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />
    </div>
  );
}

// ============ 运行时间显示 ============
function UptimeDisplay({ config }: { config: ThemeConfig }) {
  const [uptime, setUptime] = useState('00:00:00');
  const [latency, setLatency] = useState(4);
  const colors = accentColors[config.accentColor] || accentColors.emerald;

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - start) / 1000);
      const h = Math.floor(diff / 3600).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setUptime(`${h}:${m}:${s}`);
      setLatency(Math.floor(Math.random() * 5) + 2);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!config.showUptime) return null;

  return (
    <div className="hidden xl:flex items-center gap-12 font-mono text-[10px] tracking-[0.2em] text-white/30">
      <div className="flex items-center gap-3">
        <Activity size={16} className={`${colors.text} animate-pulse`} />
        <span className="text-white/60 uppercase">LATENCY: {latency}MS</span>
      </div>
      <div className="flex items-center gap-3">
        <Clock size={16} />
        <span className="text-white/60 uppercase font-bold tracking-widest">{uptime}</span>
      </div>
    </div>
  );
}

// ============ 布局 ============
function BlogLayout({ children, config = defaultConfig }: { children: ReactNode; config?: ThemeConfig }) {
  const colors = accentColors[config.accentColor] || accentColors.emerald;
  const { settings, navMenu } = useSiteSettingsContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const siteName = settings.siteName || 'NextBlog';
  const terminalPrefix = config.terminalPrefix || 'PRISM_NODE';
  const footerText = settings.footerText?.replace('{year}', new Date().getFullYear().toString()) 
    || `© ${new Date().getFullYear()} ${siteName}`;

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-300 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      <AuroraBackground config={config} />
      
      {/* 顶部 HUD 导航 */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-xl h-20">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 md:gap-6 group cursor-pointer">
            <div className={`relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/5 border border-white/10 group-hover:${colors.border} transition-all`}>
              <Cpu className={`${colors.text} w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-1000`} />
              <div className={`absolute top-0 right-0 w-2 h-2 ${colors.bg}`} />
            </div>
            <div>
              <div className="font-mono font-black text-lg md:text-2xl tracking-tighter text-white leading-none italic uppercase">
                {terminalPrefix}<span className={colors.text}>_SYNC</span>
              </div>
              <div className="text-[8px] md:text-[9px] font-mono tracking-[0.4em] text-white/30 uppercase mt-1">
                {siteName}
              </div>
            </div>
          </Link>

          <DesktopNavMenu 
            items={navMenu} 
            itemClassName="px-4 py-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all"
          />

          <UptimeDisplay config={config} />

          <div className="flex items-center gap-2 md:gap-4">
            <SearchBox />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white/40"
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
        {mobileMenuOpen && (
          <MobileNavMenu items={navMenu} onClose={() => setMobileMenuOpen(false)} />
        )}
      </header>

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 py-12 md:py-20">
        {children}
      </main>

      <footer className="py-16 md:py-24 px-4 md:px-8 border-t border-white/5 bg-[#0a0b0e]">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center opacity-30 hover:opacity-100 transition-opacity duration-700">
          <div className="flex flex-col gap-3 text-center md:text-left">
            <div className="font-mono text-xs tracking-[0.3em] md:tracking-[0.5em] uppercase text-white font-bold">
              {footerText}
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center justify-center md:justify-start gap-3">
              <Terminal size={14} /> LOG: {new Date().toLocaleDateString()} // SESSION: STABLE
            </div>
          </div>
          <div className="flex gap-8 md:gap-16 font-mono text-[11px] uppercase tracking-[0.4em] mt-8 md:mt-0">
            <Link href="/categories" className={`flex items-center gap-3 hover:${colors.text} transition-colors`}>
              <Folder size={14} /> 分类
            </Link>
            <Link href="/tags" className={`flex items-center gap-3 hover:${colors.text} transition-colors`}>
              <Tag size={14} /> 标签
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


// ============ 文章卡片 - 晶体互动卡片 ============
function ArticleCard({ article, config = defaultConfig }: ArticleCardProps & { config?: ThemeConfig }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const colors = accentColors[config.accentColor] || accentColors.emerald;
  const excerptLength = config.excerptLength || 120;
  const showFeaturedImage = config.showFeaturedImage !== false;
  const showInteractiveGlow = config.showInteractiveGlow !== false;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!showInteractiveGlow) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // 基于文章 ID 生成稳定的图标
  const icons = [Database, Shield, Code2, Layers, Workflow, Zap];
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };
  const IconComponent = icons[hashCode(article.id) % icons.length];

  const cardClasses = {
    glass: 'border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:border-white/20 hover:bg-white/[0.06]',
    solid: `border-2 border-white/10 bg-[#0d1117] hover:${colors.border}/40`,
    gradient: `border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent hover:from-white/[0.08]`,
  };

  return (
    <article
      className={`group relative flex flex-col transition-all duration-500 overflow-hidden shadow-2xl ${cardClasses[config.cardStyle as keyof typeof cardClasses] || cardClasses.glass}`}
      onMouseMove={handleMouseMove}
    >
      {/* 特色图片 */}
      {showFeaturedImage && article.featuredImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] to-transparent" />
        </div>
      )}

      <div className="p-6 md:p-8 flex flex-col flex-1">
        {/* 动态互动光圈 */}
        {showInteractiveGlow && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-700 opacity-0 group-hover:opacity-100"
            style={{
              background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${colors.glow}, transparent 80%)`,
            }}
          />
        )}

        {/* 标题与状态 */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 flex items-center justify-center ${colors.bg}/10 border ${colors.border}/20 ${colors.text}`}>
              <IconComponent size={20} />
            </div>
            <div>
              <span className={`text-[10px] font-mono tracking-[0.2em] ${colors.text}/60 uppercase block`}>
                Article_File
              </span>
              <span className="text-[9px] font-mono text-white/30 uppercase">
                {article.category?.name || 'UNCATEGORIZED'}
              </span>
            </div>
          </div>
          <div className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-tighter border ${colors.border}/30 ${colors.text}`}>
            {formatDate(article.publishedAt || article.createdAt).split(' ')[0]}
          </div>
        </div>

        <Link href={`/article/${article.slug}`}>
          <h3 className={`font-black text-white group-hover:${colors.text} transition-colors uppercase leading-tight mb-4 text-xl md:text-2xl line-clamp-2`}>
            {article.title}
          </h3>
        </Link>

        <p className="text-slate-400 text-sm leading-relaxed mb-8 font-light flex-1 line-clamp-3">
          {truncate(article.excerpt || article.content, excerptLength)}
        </p>

        {/* 底部数据展示 */}
        <div className="mt-auto flex items-end justify-between relative z-10">
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {article.tags?.slice(0, 3).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.id}`}
                  className="text-[9px] font-mono px-2 py-0.5 bg-white/5 border border-white/10 text-slate-500 uppercase hover:text-white transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
            <div className="flex gap-6 font-mono text-[10px] text-white/40">
              <span className="flex items-center gap-1.5">
                <Eye size={12} className={colors.text} /> {article.viewCount || 0}
              </span>
            </div>
          </div>
          <Link
            href={`/article/${article.slug}`}
            className={`w-12 h-12 flex items-center justify-center border border-white/10 group-hover:${colors.border}/50 group-hover:${colors.bg} group-hover:text-black transition-all`}
          >
            <ArrowUpRight size={20} />
          </Link>
        </div>

        {/* 装饰性背景文字 */}
        <div className={`absolute -bottom-4 -right-4 text-[80px] md:text-[120px] font-mono font-black text-white/[0.01] select-none pointer-events-none group-hover:${colors.text}/[0.03] transition-all duration-700 italic`}>
          {article.id.slice(-2).toUpperCase()}
        </div>
      </div>
    </article>
  );
}

// ============ 文章详情 ============
function ArticleDetail({ article, config = defaultConfig }: ArticleDetailProps & { config?: ThemeConfig }) {
  const colors = accentColors[config.accentColor] || accentColors.emerald;

  return (
    <article>
      {/* Hero Header */}
      <header className="mb-12 relative">
        <div className={`inline-flex items-center gap-3 px-4 py-1.5 ${colors.bg}/5 border ${colors.border}/20 ${colors.text} text-[10px] font-mono mb-8 uppercase tracking-[0.5em]`}>
          <Radio size={14} className="animate-pulse" /> Article_Loaded
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-8 uppercase leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-[11px] font-mono text-white/40 uppercase tracking-widest">
          {article.category && (
            <span className={`px-3 py-1 ${colors.bg}/10 ${colors.text} border ${colors.border}/20`}>
              {article.category.name}
            </span>
          )}
          <span className="flex items-center gap-2">
            <Clock size={14} /> {formatDate(article.publishedAt || article.createdAt)}
          </span>
          {article.author && (
            <span className="flex items-center gap-2">
              <Terminal size={14} /> {article.author.username}
            </span>
          )}
          <span className="flex items-center gap-2">
            <Eye size={14} /> {article.viewCount || 0} views
          </span>
        </div>
      </header>

      {/* 内容区域 */}
      <div className="border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 md:p-12 shadow-2xl">
        <div
          className="prose prose-lg prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-emerald-400 prose-code:text-emerald-400 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10"
          dangerouslySetInnerHTML={{ __html: article.htmlContent || article.content }}
        />
      </div>

      {/* 标签 */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3">
          {article.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.id}`}
              className={`px-4 py-2 border border-white/10 bg-white/[0.02] text-sm font-mono uppercase hover:${colors.border}/50 hover:${colors.text} transition-all`}
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
  const colors = accentColors[config.accentColor] || accentColors.emerald;

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
      <div className="mb-16">
        <div className={`inline-flex items-center gap-3 px-4 py-1.5 ${colors.bg}/5 border ${colors.border}/20 ${colors.text} text-[10px] font-mono mb-8 uppercase tracking-[0.5em]`}>
          <Folder size={14} /> Category_Index
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white uppercase">
          分类<span className={colors.text}>_</span>目录
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flatCategories.map(({ category, isChild }) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className={`group relative border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 transition-all duration-500 hover:${colors.border}/40 hover:bg-white/[0.06] ${isChild ? 'ml-4 border-l-2' : ''}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 flex items-center justify-center ${colors.bg}/10 border ${colors.border}/20 ${colors.text}`}>
                <Database size={24} />
              </div>
              <span className="text-4xl font-black text-white/10 font-mono">
                {String(category._count?.articles || 0).padStart(2, '0')}
              </span>
            </div>
            <h2 className={`text-xl font-black text-white group-hover:${colors.text} transition-colors uppercase mb-2`}>
              {isChild && <span className="text-white/30 mr-2">└</span>}
              {category.name}
            </h2>
            <p className="text-sm text-slate-500 font-mono uppercase tracking-wider">
              {category._count?.articles || 0} Articles
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ============ 标签列表 ============
function TagList({ tags, config = defaultConfig }: TagListProps & { config?: ThemeConfig }) {
  const colors = accentColors[config.accentColor] || accentColors.emerald;

  return (
    <div>
      <div className="mb-16">
        <div className={`inline-flex items-center gap-3 px-4 py-1.5 ${colors.bg}/5 border ${colors.border}/20 ${colors.text} text-[10px] font-mono mb-8 uppercase tracking-[0.5em]`}>
          <Tag size={14} /> Tag_Registry
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white uppercase">
          标签<span className={colors.text}>_</span>索引
        </h1>
      </div>

      <div className="border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 md:p-12">
        <div className="flex flex-wrap gap-4 justify-center">
          {tags.map((tag) => {
            const count = tag._count?.articles || 0;
            const size = count > 10 ? 'text-lg px-6 py-3' : count > 5 ? 'text-base px-5 py-2.5' : 'text-sm px-4 py-2';
            return (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className={`${size} border border-white/10 bg-white/[0.02] font-mono uppercase hover:${colors.border}/50 hover:${colors.text} transition-all group`}
              >
                <span className={`${colors.text} mr-1`}>#</span>
                {tag.name}
                <span className="ml-2 text-white/30 group-hover:text-white/50">({count})</span>
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
  const colors = accentColors[config.accentColor] || accentColors.emerald;
  const gridClass = gridClasses[config.gridColumns] || gridClasses['2'];

  if (!query) return null;

  return (
    <div>
      <div className="mb-12">
        <div className={`inline-flex items-center gap-3 px-4 py-1.5 ${colors.bg}/5 border ${colors.border}/20 ${colors.text} text-[10px] font-mono mb-8 uppercase tracking-[0.5em]`}>
          <Search size={14} /> Search_Results
        </div>
        <p className="text-lg font-mono text-white/60">
          找到 <span className={`${colors.text} font-bold`}>{total}</span> 篇关于
          "<span className={`${colors.text}`}>{query}</span>" 的文章
        </p>
      </div>

      <div className={`grid ${gridClass} gap-6`}>
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/article/${article.slug}`}
            className="group border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 transition-all duration-500 hover:border-white/20 hover:bg-white/[0.06]"
          >
            <h2 className={`font-bold text-lg text-white group-hover:${colors.text} transition-colors uppercase mb-3`}>
              {article.title}
            </h2>
            <p className="text-slate-400 text-sm line-clamp-2 mb-4">
              {truncate(article.excerpt || article.content, 100)}
            </p>
            <div className="flex items-center gap-4 text-[10px] font-mono text-white/40 uppercase">
              <span>{formatDate(article.publishedAt || article.createdAt)}</span>
              {article.tags?.slice(0, 2).map((tag) => (
                <span key={tag.id} className={`px-2 py-0.5 ${colors.bg}/10 ${colors.text}`}>
                  {tag.name}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const CyberTheme: ThemeComponents = {
  name: 'cyber',
  displayName: '赛博朋克',
  description: '科技感极光背景，深色调，霓虹高亮，适合技术博客',
  configOptions,
  defaultConfig,
  BlogLayout,
  ArticleCard,
  ArticleDetail,
  CategoryList,
  TagList,
  SearchResults,
};
