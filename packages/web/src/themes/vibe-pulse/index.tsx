// Vibe Pulse 主题 - 微博风格社交信息流布局
import { ReactNode, useState, useMemo } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '../../components/ThemeToggle';
import { SearchBox } from '../../components/SearchBox';
import { MobileNavMenu } from '../../components/NavMenu';
import { formatDate, truncate } from '../../lib/utils';
import { useSiteSettingsContext } from '../../contexts/site-settings-context';
import {
  Home,
  Hash,
  User,
  MoreHorizontal,
  Share,
  MessageCircle,
  Heart,
  Repeat,
  TrendingUp,
  Sparkles,
  Bookmark,
  CheckCircle2,
  ArrowRight,
  Eye,
  Clock,
  Folder,
  Tag,
  Search,
  Layers,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Calendar,
  BookOpen,
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
    key: 'primaryColor',
    label: '品牌主色',
    type: 'select',
    options: [
      { value: 'weibo-orange', label: '经典橙' },
      { value: 'cyber-blue', label: '赛博蓝' },
      { value: 'rose-pink', label: '活力粉' },
      { value: 'emerald-green', label: '翠绿' },
    ],
    default: 'weibo-orange',
    description: '整体品牌色调',
  },
  {
    key: 'layoutWidth',
    label: '整体布局宽度',
    type: 'select',
    options: [
      { value: 'standard', label: '标准 (1280px)' },
      { value: 'wide', label: '宽屏 (1536px)' },
      { value: 'full', label: '全宽 (100%)' },
    ],
    default: 'standard',
    description: '页面容器的最大宽度',
  },
  {
    key: 'articleLayout',
    label: '文章列表布局',
    type: 'select',
    options: [
      { value: 'single', label: '单栏 (信息流)' },
      { value: 'double', label: '双栏 (卡片)' },
      { value: 'triple', label: '三栏 (瀑布流)' },
    ],
    default: 'single',
    description: '首页文章列表的布局方式',
  },
  {
    key: 'cardStyle',
    label: '卡片风格',
    type: 'select',
    options: [
      { value: 'feed', label: '信息流风格' },
      { value: 'card', label: '博客卡片风格' },
      { value: 'minimal', label: '极简风格' },
    ],
    default: 'feed',
    description: '文章卡片的展示风格',
  },
  {
    key: 'layoutDensity',
    label: '内容密度',
    type: 'select',
    options: [
      { value: 'cozy', label: '舒适 (大间距)' },
      { value: 'compact', label: '紧凑 (多内容)' },
    ],
    default: 'cozy',
    description: '信息流的间距密度',
  },
  {
    key: 'showRightSidebar',
    label: '显示右侧边栏',
    type: 'boolean',
    default: true,
    description: '是否显示右侧边栏（热搜、AI助手等）',
  },
  {
    key: 'showTrending',
    label: '显示热搜榜',
    type: 'boolean',
    default: true,
    description: '在右侧边栏显示热门话题',
  },
  {
    key: 'showAiAssistant',
    label: '显示AI助手',
    type: 'boolean',
    default: true,
    description: '在右侧边栏显示AI智能推荐',
  },
  {
    key: 'showFeaturedImage',
    label: '显示特色图',
    type: 'boolean',
    default: true,
    description: '在文章卡片中显示图片',
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
    default: 150,
    description: '文章摘要显示的字符数 (50-500)',
  },
  {
    key: 'showVerifiedBadge',
    label: '显示认证徽章',
    type: 'boolean',
    default: true,
    description: '在作者头像旁显示认证标识',
  },
  {
    key: 'navBrandText',
    label: '导航品牌文字',
    type: 'text',
    default: '首页',
    description: '顶部导航栏显示的标题',
  },
  {
    key: 'trendingTitle',
    label: '热搜榜标题',
    type: 'text',
    default: '实时热搜榜',
    description: '右侧热搜区域的标题',
  },
  {
    key: 'aiAssistantTitle',
    label: 'AI助手标题',
    type: 'text',
    default: 'AI Intelligence Node',
    description: 'AI助手区域的标题',
  },
];

const defaultConfig: ThemeConfig = {
  primaryColor: 'weibo-orange',
  layoutWidth: 'standard',
  articleLayout: 'single',
  cardStyle: 'feed',
  layoutDensity: 'cozy',
  showRightSidebar: true,
  showTrending: true,
  showAiAssistant: true,
  showFeaturedImage: true,
  showArticleDetailFeaturedImage: true,
  excerptLength: 150,
  showVerifiedBadge: true,
  navBrandText: '首页',
  trendingTitle: '实时热搜榜',
  aiAssistantTitle: 'AI Intelligence Node',
};

// 配色方案
const colorMaps: Record<string, { primary: string; secondary: string; bg: string; light: string }> = {
  'weibo-orange': { primary: '#FF8200', secondary: '#FFB100', bg: '#F2F2F2', light: '#FFF4E5' },
  'cyber-blue': { primary: '#1DA1F2', secondary: '#71C9F8', bg: '#F5F8FA', light: '#E8F5FE' },
  'rose-pink': { primary: '#E0245E', secondary: '#F45D22', bg: '#FDF2F5', light: '#FFF0F5' },
  'emerald-green': { primary: '#10B981', secondary: '#34D399', bg: '#F0FDF4', light: '#ECFDF5' },
};

// 菜单项类型
interface NavMenuItem {
  id: string;
  label: string;
  url: string;
  type: 'internal' | 'external';
  sortOrder: number;
  children?: NavMenuItem[];
}

// ============ 左侧导航菜单项（支持多级） ============
function NavItem({ item, theme, depth = 0 }: { item: NavMenuItem; theme: typeof colorMaps['weibo-orange']; depth?: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isExternal = item.type === 'external';

  const getIcon = (label: string, index: number) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('首页') || lowerLabel.includes('home')) return <Home size={22} />;
    if (lowerLabel.includes('分类') || lowerLabel.includes('categor')) return <Folder size={22} />;
    if (lowerLabel.includes('标签') || lowerLabel.includes('tag')) return <Hash size={22} />;
    if (lowerLabel.includes('关于') || lowerLabel.includes('about')) return <User size={22} />;
    if (lowerLabel.includes('项目') || lowerLabel.includes('project')) return <Layers size={22} />;
    if (lowerLabel.includes('友链') || lowerLabel.includes('friend')) return <Heart size={22} />;
    if (lowerLabel.includes('知识') || lowerLabel.includes('knowledge')) return <BookOpen size={22} />;
    return <Bookmark size={22} />;
  };

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300 font-medium ${
            depth > 0 ? 'pl-10' : ''
          }`}
        >
          {depth === 0 && getIcon(item.label, 0)}
          <span className="flex-1 text-left text-[15px] hidden xl:block">{item.label}</span>
          {expanded ? (
            <ChevronDown size={16} className="text-slate-400 hidden xl:block" />
          ) : (
            <ChevronRight size={16} className="text-slate-400 hidden xl:block" />
          )}
        </button>
        {expanded && (
          <div className="ml-2 border-l-2 border-slate-200 dark:border-slate-700">
            {item.children!.map((child) => (
              <NavItem key={child.id} item={child} theme={theme} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.url}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300 font-medium ${
        depth > 0 ? 'pl-10' : ''
      }`}
    >
      {depth === 0 && getIcon(item.label, 0)}
      <span className="flex-1 text-[15px] hidden xl:block">{item.label}</span>
      {isExternal && <ExternalLink size={14} className="text-slate-400 hidden xl:block" />}
    </Link>
  );
}

// ============ 左侧导航栏（支持多级菜单） ============
function LeftSidebar({ config, siteName, siteLogo }: { config: ThemeConfig; siteName: string; siteLogo?: string | null }) {
  const theme = colorMaps[config.primaryColor as string] || colorMaps['weibo-orange'];
  const { navMenu } = useSiteSettingsContext();

  const defaultNavItems: NavMenuItem[] = [
    { id: '1', label: '首页', url: '/', type: 'internal', sortOrder: 0 },
    { id: '2', label: '分类', url: '/categories', type: 'internal', sortOrder: 1 },
    { id: '3', label: '标签', url: '/tags', type: 'internal', sortOrder: 2 },
    { id: '4', label: '关于', url: '/about', type: 'internal', sortOrder: 3 },
  ];

  const navItems = navMenu.length > 0 ? navMenu : defaultNavItems;

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen sticky top-0 py-4 px-3 gap-1 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f0f0f] overflow-y-auto">
      {/* Logo */}
      <Link href="/" className="mb-4 px-3 flex items-center gap-3">
        {siteLogo ? (
          <img src={siteLogo} alt={siteName} className="h-11 w-auto" />
        ) : (
          <div
            className="w-11 h-11 flex items-center justify-center rounded-xl text-white shadow-lg"
            style={{ backgroundColor: theme.primary }}
          >
            <Sparkles size={24} fill="white" />
          </div>
        )}
        <span className="text-lg font-black text-slate-800 dark:text-slate-200 hidden xl:block">{siteName}</span>
      </Link>

      {/* 导航项 - 支持多级菜单 */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.id} item={item as NavMenuItem} theme={theme} />
        ))}
      </nav>

      {/* 发布按钮 */}
      <Link
        href="/about"
        className="mt-4 w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity text-center"
        style={{ backgroundColor: theme.primary }}
      >
        探索更多
      </Link>

      {/* 主题切换 */}
      <div className="mt-3 flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 hidden xl:block">主题</span>
        <ThemeToggle />
      </div>

      {/* 底部用户信息 */}
      <div className="mt-3 p-3 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer">
        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
          <User size={18} className="text-slate-400 dark:text-slate-500" />
        </div>
        <div className="hidden xl:block flex-1 min-w-0">
          <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{siteName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">@blog</p>
        </div>
      </div>
    </aside>
  );
}

// ============ 右侧边栏 ============
function RightSidebar({ config }: { config: ThemeConfig }) {
  const theme = colorMaps[config.primaryColor as string] || colorMaps['weibo-orange'];
  const trendingTitle = config.trendingTitle || '实时热搜榜';
  const aiTitle = config.aiAssistantTitle || 'AI Intelligence Node';

  const trendingItems = [
    { label: '技术博客最佳实践', hot: '爆', color: 'bg-red-500' },
    { label: '2025 前端发展趋势', hot: '新', color: 'bg-orange-500' },
    { label: 'Next.js 15 新特性', hot: '热', color: 'bg-orange-400' },
    { label: 'TypeScript 进阶指南', hot: '荐', color: 'bg-blue-500' },
    { label: 'React Server Components', count: '128.4万' },
  ];

  return (
    <aside className="hidden xl:flex flex-col w-[320px] sticky top-0 h-screen py-4 px-4 gap-4 overflow-y-auto">
      <div className="pt-1">
        <SearchBox />
      </div>

      {config.showTrending && (
        <div className="bg-slate-50 dark:bg-[#151515] rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-base flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <TrendingUp size={16} className="text-red-500" /> {trendingTitle}
            </h3>
            <Sparkles size={14} className="text-amber-500 animate-pulse" />
          </div>
          <div className="py-1">
            {trendingItems.map((item, i) => (
              <div
                key={i}
                className="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors"
              >
                <div className="flex gap-3 items-center">
                  <span className={`font-bold text-sm ${i < 3 ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500'}`}>
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium line-clamp-1 text-slate-700 dark:text-slate-300">{item.label}</span>
                </div>
                {item.hot ? (
                  <span className={`text-[10px] text-white px-1.5 py-0.5 rounded font-bold ${item.color}`}>
                    {item.hot}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{item.count}</span>
                )}
              </div>
            ))}
          </div>
          <Link
            href="/tags"
            className="block p-3 text-sm font-medium transition-colors cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 border-t border-slate-100 dark:border-slate-700"
            style={{ color: theme.primary }}
          >
            查看更多话题
          </Link>
        </div>
      )}

      {config.showAiAssistant && (
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-[#0f0f0f] dark:to-[#151515]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {aiTitle}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            欢迎来到博客！这里汇集了
            <span style={{ color: theme.primary }}> #技术分享# </span>
            和
            <span style={{ color: theme.primary }}> #深度思考# </span>
            的精彩内容。
          </p>
          <Link
            href="/categories"
            className="mt-3 flex items-center gap-1 text-xs font-bold"
            style={{ color: theme.primary }}
          >
            探索分类 <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </aside>
  );
}


// ============ 核心布局组件 ============
function BlogLayout({ children, config = defaultConfig }: { children: ReactNode; config?: ThemeConfig }) {
  const theme = colorMaps[config.primaryColor as string] || colorMaps['weibo-orange'];
  const { settings, navMenu } = useSiteSettingsContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const siteName = settings.siteName || 'NextBlog';
  const siteLogo = settings.siteLogo;
  const navBrandText = config.navBrandText || '首页';
  const showRightSidebar = config.showRightSidebar !== false;

  const layoutWidthMap: Record<string, string> = {
    standard: 'max-w-7xl',
    wide: 'max-w-[1536px]',
    full: 'w-full',
  };
  const layoutWidthClass = layoutWidthMap[config.layoutWidth as string] || layoutWidthMap.standard;

  return (
    <div className="min-h-screen bg-[#F2F2F2] dark:bg-[#0a0a0a] text-slate-800 dark:text-slate-200 font-sans transition-all duration-300">
      <div className={`${layoutWidthClass} mx-auto flex ${config.layoutWidth === 'full' ? 'px-0' : ''}`}>
        <LeftSidebar config={config} siteName={siteName} siteLogo={siteLogo} />

        <main className={`flex-1 min-w-0 min-h-screen bg-white dark:bg-[#0f0f0f] border-x border-slate-100 dark:border-slate-700 ${config.layoutWidth === 'full' ? 'max-w-none' : ''}`}>
          {/* 移动端顶部 */}
          <div className="lg:hidden sticky top-0 z-50 bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-md px-4 h-14 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
            <Link href="/" className="flex items-center gap-2">
              {siteLogo ? (
                <img src={siteLogo} alt={siteName} className="h-8 w-auto" />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Sparkles size={16} fill="white" />
                </div>
              )}
              <span className="font-bold text-slate-800 dark:text-slate-200">{siteName}</span>
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2" aria-label="菜单">
              <MoreHorizontal size={20} className="text-slate-500" />
            </button>
          </div>

          {mobileMenuOpen && (
            <MobileNavMenu
              items={navMenu.length > 0 ? navMenu : [
                { id: '1', label: '首页', url: '/', type: 'internal' as const, sortOrder: 0 },
                { id: '2', label: '分类', url: '/categories', type: 'internal' as const, sortOrder: 1 },
                { id: '3', label: '标签', url: '/tags', type: 'internal' as const, sortOrder: 2 },
                { id: '4', label: '关于', url: '/about', type: 'internal' as const, sortOrder: 3 },
              ]}
              onClose={() => setMobileMenuOpen(false)}
            />
          )}

          {/* PC 顶部标题栏 */}
          <div className="hidden lg:flex sticky top-0 z-50 bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-md px-6 h-14 items-center border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{navBrandText}</h2>
          </div>

          <div className={`${config.layoutDensity === 'cozy' ? 'pb-24' : 'pb-16'}`}>
            {children}
          </div>
        </main>

        {showRightSidebar && <RightSidebar config={config} />}
      </div>

      {/* 手机端底部导航 */}
      <footer className="lg:hidden fixed bottom-0 left-0 w-full h-14 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-700 flex items-center justify-around z-50">
        <Link href="/" style={{ color: theme.primary }}><Home size={22} /></Link>
        <Link href="/categories" className="text-slate-400 dark:text-slate-500"><Folder size={22} /></Link>
        <Link href="/tags" className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: theme.primary }}>
          <Hash size={18} />
        </Link>
        <Link href="/about" className="text-slate-400 dark:text-slate-500"><User size={22} /></Link>
        <Link href="/search" className="text-slate-400 dark:text-slate-500"><Search size={22} /></Link>
      </footer>
    </div>
  );
}

// ============ 信息流风格卡片 ============
function FeedStyleCard({ article, config, theme }: { article: ArticleCardProps['article']; config: ThemeConfig; theme: typeof colorMaps['weibo-orange'] }) {
  const [isLiked, setIsLiked] = useState(false);
  const excerptLength = (config.excerptLength as number) || 150;
  const showFeaturedImage = config.showFeaturedImage !== false;
  const showVerifiedBadge = config.showVerifiedBadge !== false;

  return (
    <article className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
      <div className="flex gap-3">
        <div className="shrink-0 relative">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
            <User size={18} className="text-slate-400 dark:text-slate-500" />
          </div>
          {showVerifiedBadge && (
            <div className="absolute -right-0.5 -bottom-0.5 w-4 h-4 bg-white dark:bg-[#0f0f0f] rounded-full flex items-center justify-center">
              <CheckCircle2 size={12} fill={theme.primary} className="text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm" style={{ color: theme.primary }}>
              {article.category?.name || '博主'}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(article.publishedAt || article.createdAt)}
            </span>
          </div>

          <Link href={`/article/${article.slug}`}>
            <h2 className="text-base font-bold mb-2 hover:underline line-clamp-2 text-slate-800 dark:text-slate-200">
              {article.title}
            </h2>
          </Link>

          <p className="text-sm leading-relaxed mb-3 text-slate-600 dark:text-slate-400 line-clamp-3">
            {truncate(article.excerpt || article.content, excerptLength)}
          </p>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {article.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.id}`}
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {showFeaturedImage && article.featuredImage && (
            <div className="mb-3 rounded-xl overflow-hidden">
              <img src={article.featuredImage} alt={article.title} className="w-full aspect-video object-cover" />
            </div>
          )}

          <div className="flex justify-between items-center text-slate-400 dark:text-slate-500 text-xs">
            <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <Repeat size={14} /> <span>转发</span>
            </button>
            <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
              <MessageCircle size={14} /> <span>评论</span>
            </button>
            <button
              className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} /> <span>{article.viewCount || 0}</span>
            </button>
            <Link href={`/article/${article.slug}`} className="flex items-center gap-1 hover:text-amber-500 transition-colors">
              <Eye size={14} /> <span>{article.viewCount || 0}</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

// ============ 博客卡片风格 ============
function BlogCardStyle({ article, config, theme }: { article: ArticleCardProps['article']; config: ThemeConfig; theme: typeof colorMaps['weibo-orange'] }) {
  const excerptLength = (config.excerptLength as number) || 120;
  const showFeaturedImage = config.showFeaturedImage !== false;

  return (
    <article className="bg-white dark:bg-[#151515] rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all group">
      {showFeaturedImage && article.featuredImage && (
        <div className="aspect-video overflow-hidden">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {article.category && (
            <Link
              href={`/category/${article.category.id}`}
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
            >
              {article.category.name}
            </Link>
          )}
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(article.publishedAt || article.createdAt).split(' ')[0]}
          </span>
        </div>

        <Link href={`/article/${article.slug}`}>
          <h2 className="text-lg font-bold mb-2 line-clamp-2 text-slate-800 dark:text-slate-200 group-hover:underline">
            {article.title}
          </h2>
        </Link>

        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
          {truncate(article.excerpt || article.content, excerptLength)}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Eye size={12} /> {article.viewCount || 0}</span>
          </div>
          <Link
            href={`/article/${article.slug}`}
            className="font-bold flex items-center gap-1"
            style={{ color: theme.primary }}
          >
            阅读全文 <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </article>
  );
}

// ============ 极简风格卡片 ============
function MinimalCardStyle({ article, config, theme }: { article: ArticleCardProps['article']; config: ThemeConfig; theme: typeof colorMaps['weibo-orange'] }) {
  return (
    <article className="py-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors px-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {article.category && (
              <span className="text-xs font-medium" style={{ color: theme.primary }}>
                {article.category.name}
              </span>
            )}
            <span className="text-xs text-slate-400">
              {formatDate(article.publishedAt || article.createdAt).split(' ')[0]}
            </span>
          </div>
          <Link href={`/article/${article.slug}`}>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 hover:underline line-clamp-1">
              {article.title}
            </h2>
          </Link>
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
          <Eye size={12} /> {article.viewCount || 0}
        </span>
      </div>
    </article>
  );
}


// ============ 文章卡片（根据配置选择风格和布局） ============
function ArticleCard({ article, config = defaultConfig }: ArticleCardProps & { config?: ThemeConfig }) {
  const theme = colorMaps[config.primaryColor as string] || colorMaps['weibo-orange'];
  const cardStyle = config.cardStyle || 'feed';

  if (cardStyle === 'card') {
    return <BlogCardStyle article={article} config={config} theme={theme} />;
  }
  if (cardStyle === 'minimal') {
    return <MinimalCardStyle article={article} config={config} theme={theme} />;
  }
  return <FeedStyleCard article={article} config={config} theme={theme} />;
}

// ============ 文章列表容器（支持多栏布局） ============
export function ArticleListWrapper({ children, config = defaultConfig }: { children: ReactNode; config?: ThemeConfig }) {
  const articleLayout = config.articleLayout || 'single';
  const cardStyle = config.cardStyle || 'feed';

  // 信息流风格只支持单栏
  if (cardStyle === 'feed') {
    return <div className="divide-y divide-slate-100 dark:divide-slate-700">{children}</div>;
  }

  // 极简风格只支持单栏
  if (cardStyle === 'minimal') {
    return <div>{children}</div>;
  }

  // 博客卡片风格支持多栏
  const gridClassMap: Record<string, string> = {
    single: 'grid-cols-1',
    double: 'grid-cols-1 md:grid-cols-2',
    triple: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };
  const gridClass = gridClassMap[articleLayout as string] || 'grid-cols-1';

  return <div className={`grid ${gridClass} gap-4 p-4`}>{children}</div>;
}

// ============ 文章详情（博客风格） ============
function ArticleDetail({ article, config = defaultConfig }: ArticleDetailProps & { config?: ThemeConfig }) {
  const theme = colorMaps[config.primaryColor as string] || colorMaps['weibo-orange'];
  const showAiAssistant = config.showAiAssistant !== false;
  const showArticleDetailFeaturedImage = config.showArticleDetailFeaturedImage !== false;

  return (
    <article className="animate-in fade-in duration-500">
      <div className="p-4 md:p-8">
        {/* 文章头部 */}
        <header className="mb-8">
          {/* 分类标签 */}
          {article.category && (
            <Link
              href={`/category/${article.category.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-bold mb-4"
              style={{ color: theme.primary }}
            >
              <Folder size={14} />
              {article.category.name}
            </Link>
          )}

          {/* 标题 */}
          <h1 className="text-2xl md:text-4xl font-black leading-tight text-slate-800 dark:text-slate-100 mb-6">
            {article.title}
          </h1>

          {/* 作者信息 */}
          <div className="flex items-center gap-4 py-4 border-y border-slate-100 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <User size={24} className="text-slate-400 dark:text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">{article.author?.username || '博主'}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(article.publishedAt || article.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  {article.viewCount || 0} 阅读
                </span>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  if (navigator.share) {
                    await navigator.share({ title: article.title, url: window.location.href });
                  } else {
                    await navigator.clipboard.writeText(window.location.href);
                    alert('链接已复制');
                  }
                } catch {}
              }}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Share size={18} className="text-slate-500" />
            </button>
          </div>
        </header>

        {/* 特色图片 */}
        {showArticleDetailFeaturedImage && article.featuredImage && (
          <div className="rounded-2xl overflow-hidden mb-8">
            <img src={article.featuredImage} alt={article.title} className="w-full aspect-video object-cover" />
          </div>
        )}

        {/* AI 摘要 */}
        {showAiAssistant && (
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-l-4 mb-8" style={{ borderColor: theme.primary }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                AI 内容摘要
              </span>
            </div>
            <p className="text-sm italic text-slate-600 dark:text-slate-400">
              本文探讨了「{article.title}」的核心内容
              {article.category && `，属于${article.category.name}分类`}。
            </p>
          </div>
        )}

        {/* 正文 */}
        <div
          className="prose prose-slate dark:prose-invert max-w-none 
            prose-headings:font-bold prose-headings:text-slate-800 dark:prose-headings:text-slate-200
            prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed
            prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-pre:rounded-xl prose-pre:bg-slate-900
            prose-code:text-sm prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
          style={{ '--tw-prose-links': theme.primary } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: article.htmlContent || article.content }}
        />

        {/* 标签 */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-8 mt-8 border-t border-slate-100 dark:border-slate-700">
            {article.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.id}`}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* 底部互动 */}
        <footer className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-center gap-8">
            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-red-500 transition-colors">
              <Heart size={24} />
              <span className="text-xs font-medium">点赞</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-500 transition-colors">
              <Repeat size={24} />
              <span className="text-xs font-medium">转发</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-green-500 transition-colors">
              <MessageCircle size={24} />
              <span className="text-xs font-medium">评论</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-amber-500 transition-colors">
              <Bookmark size={24} />
              <span className="text-xs font-medium">收藏</span>
            </button>
          </div>
        </footer>
      </div>
    </article>
  );
}

// ============ 分类列表 ============
function CategoryList({ categories, config = defaultConfig }: CategoryListProps & { config?: ThemeConfig }) {
  const theme = colorMaps[config.primaryColor as string] || colorMaps['weibo-orange'];

  const flatCategories: { category: CategoryListProps['categories'][0]; isChild: boolean }[] = [];
  categories.forEach((category) => {
    flatCategories.push({ category, isChild: false });
    category.children?.forEach((child) => {
      flatCategories.push({ category: child as CategoryListProps['categories'][0], isChild: true });
    });
  });

  return (
    <div>
      <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2 mb-1">
          <Folder size={20} style={{ color: theme.primary }} />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">分类目录</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">浏览所有文章分类</p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {flatCategories.map(({ category, isChild }, i) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className={`flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
              isChild ? 'pl-10' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: theme.primary }}
              >
                {isChild ? '└' : String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">{category.name}</h3>
                {category.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{category.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-300 dark:text-slate-600">
                {category._count?.articles || 0}
              </span>
              <ArrowRight size={16} className="text-slate-400" />
            </div>
          </Link>
        ))}
      </div>

      {flatCategories.length === 0 && (
        <div className="p-12 text-center">
          <Layers size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-400 dark:text-slate-500">暂无分类</p>
        </div>
      )}
    </div>
  );
}

// ============ 标签列表 ============
function TagList({ tags, config = defaultConfig }: TagListProps & { config?: ThemeConfig }) {
  const theme = colorMaps[config.primaryColor as string] || colorMaps['weibo-orange'];

  return (
    <div>
      <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2 mb-1">
          <Tag size={20} style={{ color: theme.primary }} />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">标签云</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">探索所有话题标签</p>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => {
            const count = tag._count?.articles || 0;
            const size = count > 10 ? 'text-base px-4 py-2' : count > 5 ? 'text-sm px-3 py-1.5' : 'text-xs px-2.5 py-1';
            const isHot = index < 3;

            return (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className={`${size} rounded-full font-medium transition-all hover:scale-105 flex items-center gap-1`}
                style={{
                  backgroundColor: isHot ? theme.primary : `${theme.primary}15`,
                  color: isHot ? 'white' : theme.primary,
                }}
              >
                #{tag.name}
                <span className={`text-xs ${isHot ? 'opacity-80' : 'opacity-70'}`}>({count})</span>
                {isHot && <TrendingUp size={12} />}
              </Link>
            );
          })}
        </div>
      </div>

      {tags.length === 0 && (
        <div className="p-12 text-center">
          <Hash size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-400 dark:text-slate-500">暂无标签</p>
        </div>
      )}
    </div>
  );
}

// ============ 搜索结果 ============
function SearchResults({ articles, total, query, config = defaultConfig }: SearchResultProps & { config?: ThemeConfig }) {
  const theme = colorMaps[config.primaryColor as string] || colorMaps['weibo-orange'];

  if (!query) return null;

  return (
    <div>
      <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2 mb-1">
          <Search size={20} style={{ color: theme.primary }} />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">搜索结果</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          找到 <span style={{ color: theme.primary }} className="font-bold">{total}</span> 篇关于
          "<span style={{ color: theme.primary }} className="font-bold">{query}</span>" 的文章
        </p>
      </div>

      <div>
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={{ ...article, featuredImage: null, category: null, viewCount: 0 }}
            config={{ ...config, cardStyle: 'minimal' }}
          />
        ))}
      </div>

      {articles.length === 0 && (
        <div className="p-12 text-center">
          <Search size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-400 dark:text-slate-500">未找到相关文章</p>
        </div>
      )}
    </div>
  );
}

// ============ 导出主题 ============
export const VibePulseTheme: ThemeComponents = {
  name: 'vibe-pulse',
  displayName: '微博风格',
  description: '社交信息流布局，支持多级菜单、多栏布局、多种卡片风格',
  configOptions,
  defaultConfig,
  BlogLayout,
  ArticleCard,
  ArticleDetail,
  CategoryList,
  TagList,
  SearchResults,
};
