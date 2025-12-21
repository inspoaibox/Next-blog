// Vibe Pulse 主题 - 微博风格社交信息流布局
import { ReactNode, useState, useMemo } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '../../components/ThemeToggle';
import { SearchBox } from '../../components/SearchBox';
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
    label: '布局宽度',
    type: 'select',
    options: [
      { value: 'standard', label: '标准 (1200px)' },
      { value: 'wide', label: '宽屏 (1400px)' },
      { value: 'full', label: '全宽' },
    ],
    default: 'standard',
    description: '页面整体宽度',
  },
  {
    key: 'contentWidth',
    label: '内容区宽度',
    type: 'select',
    options: [
      { value: 'narrow', label: '窄 (550px)' },
      { value: 'standard', label: '标准 (650px)' },
      { value: 'wide', label: '宽 (750px)' },
    ],
    default: 'standard',
    description: '中间信息流的宽度',
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
    key: 'imageGridStyle',
    label: '图片网格样式',
    type: 'select',
    options: [
      { value: 'auto', label: '自动适应' },
      { value: 'single', label: '单图大图' },
      { value: 'grid', label: '九宫格' },
    ],
    default: 'auto',
    description: '文章图片的展示方式',
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
  contentWidth: 'standard',
  layoutDensity: 'cozy',
  showRightSidebar: true,
  showTrending: true,
  showAiAssistant: true,
  showFeaturedImage: true,
  imageGridStyle: 'auto',
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


// ============ 左侧导航栏 ============
function LeftSidebar({ config, siteName }: { config: ThemeConfig; siteName: string }) {
  const theme = colorMaps[config.primaryColor] || colorMaps['weibo-orange'];
  const { navMenu } = useSiteSettingsContext();

  const defaultNavItems = [
    { icon: <Home size={24} />, label: '首页', href: '/', active: true },
    { icon: <Hash size={24} />, label: '分类', href: '/categories' },
    { icon: <Bookmark size={24} />, label: '标签', href: '/tags' },
    { icon: <User size={24} />, label: '关于', href: '/about' },
  ];

  // 合并自定义菜单
  const navItems = navMenu.length > 0
    ? navMenu.map((item, idx) => ({
        icon: idx === 0 ? <Home size={24} /> : idx === 1 ? <Hash size={24} /> : <Bookmark size={24} />,
        label: item.label,
        href: item.url,
        active: idx === 0,
      }))
    : defaultNavItems;

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen sticky top-0 py-4 px-4 gap-2 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f0f0f]">
      {/* Logo */}
      <Link href="/" className="mb-6 px-3">
        <div
          className="w-12 h-12 flex items-center justify-center rounded-full text-white shadow-lg"
          style={{ backgroundColor: theme.primary }}
        >
          <Sparkles size={28} fill="white" />
        </div>
      </Link>

      {/* 导航项 */}
      {navItems.map((item, idx) => (
        <Link
          key={idx}
          href={item.href}
          className={`flex items-center gap-4 px-4 py-3 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300 ${
            item.active ? 'font-black' : 'font-medium'
          }`}
          style={item.active ? { color: theme.primary } : {}}
        >
          {item.icon}
          <span className="text-lg hidden xl:block">{item.label}</span>
        </Link>
      ))}

      {/* 发布按钮 */}
      <Link
        href="/about"
        className="mt-6 w-full py-3 rounded-full text-white font-black text-lg shadow-xl hover:opacity-90 transition-opacity text-center"
        style={{ backgroundColor: theme.primary }}
      >
        探索更多
      </Link>

      {/* 主题切换 */}
      <div className="mt-4 flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-full">
        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 hidden xl:block">主题</span>
        <ThemeToggle />
      </div>

      {/* 底部用户信息 */}
      <div className="mt-auto p-3 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
          <User size={20} className="text-slate-400 dark:text-slate-500" />
        </div>
        <div className="hidden xl:block flex-1">
          <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{siteName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">@blog_user</p>
        </div>
        <MoreHorizontal size={18} className="ml-auto text-slate-400 hidden xl:block" />
      </div>
    </aside>
  );
}

// ============ 右侧边栏 ============
function RightSidebar({ config }: { config: ThemeConfig }) {
  const theme = colorMaps[config.primaryColor] || colorMaps['weibo-orange'];
  const trendingTitle = config.trendingTitle || '实时热搜榜';
  const aiTitle = config.aiAssistantTitle || 'AI Intelligence Node';

  // 模拟热搜数据（实际应从API获取）
  const trendingItems = [
    { label: '技术博客最佳实践', hot: '爆', color: 'bg-red-500' },
    { label: '2025 前端发展趋势', hot: '新', color: 'bg-orange-500' },
    { label: 'Next.js 15 新特性', hot: '热', color: 'bg-orange-400' },
    { label: 'TypeScript 进阶指南', hot: '荐', color: 'bg-blue-500' },
    { label: 'React Server Components', count: '128.4万' },
  ];

  return (
    <aside className="hidden xl:flex flex-col w-[350px] sticky top-0 h-screen py-4 px-6 gap-6 overflow-y-auto">
      {/* 搜索框 */}
      <div className="pt-2">
        <SearchBox />
      </div>

      {/* 热搜榜 */}
      {config.showTrending && (
        <div className="bg-slate-50 dark:bg-[#151515] rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-black text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <TrendingUp size={18} className="text-red-500" /> {trendingTitle}
            </h3>
            <Sparkles size={16} className="text-amber-500 animate-pulse" />
          </div>
          <div className="py-2">
            {trendingItems.map((item, i) => (
              <div
                key={i}
                className="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors"
              >
                <div className="flex gap-4 items-center">
                  <span className={`font-bold italic ${i < 3 ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500'}`}>
                    {i + 1}
                  </span>
                  <span className="text-[15px] font-bold line-clamp-1 text-slate-700 dark:text-slate-300">{item.label}</span>
                </div>
                {item.hot ? (
                  <span className={`text-[10px] text-white px-1 rounded-sm font-black ${item.color}`}>
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
            className="block p-4 text-sm font-medium transition-colors cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
            style={{ color: theme.primary }}
          >
            查看更多话题
          </Link>
        </div>
      )}

      {/* AI 助手 */}
      {config.showAiAssistant && (
        <div className="p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-[#0f0f0f] dark:to-[#151515]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {aiTitle}
            </span>
          </div>
          <p className="text-sm font-bold leading-relaxed text-slate-700 dark:text-slate-300">
            欢迎来到博客！这里汇集了
            <span style={{ color: theme.primary }}> #技术分享# </span>
            和
            <span style={{ color: theme.primary }}> #深度思考# </span>
            的精彩内容。当前热门话题互动率预测为
            <span className="text-green-500"> 89%↑</span>。
          </p>
          <Link
            href="/categories"
            className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
            style={{ color: theme.primary }}
          >
            探索分类 <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </aside>
  );
}


// ============ 核心布局组件 ============
function BlogLayout({ children, config = defaultConfig }: { children: ReactNode; config?: ThemeConfig }) {
  const theme = colorMaps[config.primaryColor] || colorMaps['weibo-orange'];
  const { settings, navMenu } = useSiteSettingsContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const siteName = settings.siteName || 'NextBlog';
  const navBrandText = config.navBrandText || '首页';
  const showRightSidebar = config.showRightSidebar !== false;

  // 布局宽度类
  const layoutWidthMap: Record<string, string> = {
    standard: 'max-w-[1200px]',
    wide: 'max-w-[1400px]',
    full: 'max-w-full px-4',
  };
  const layoutWidthClass = layoutWidthMap[config.layoutWidth as string] || layoutWidthMap.standard;

  // 内容区宽度类
  const contentWidthMap: Record<string, string> = {
    narrow: 'max-w-[550px]',
    standard: 'max-w-[650px]',
    wide: 'max-w-[750px]',
  };
  const contentWidthClass = contentWidthMap[config.contentWidth as string] || contentWidthMap.standard;

  return (
    <div className="min-h-screen bg-[#F2F2F2] dark:bg-[#0a0a0a] text-slate-800 dark:text-slate-200 font-sans transition-all duration-300">
      <div className={`${layoutWidthClass} mx-auto flex justify-center`}>
        {/* PC 左侧导航栏 */}
        <LeftSidebar config={config} siteName={siteName} />

        {/* 中间信息流 */}
        <main className={`flex-1 ${contentWidthClass} min-h-screen bg-white dark:bg-[#0f0f0f] border-x border-slate-100 dark:border-slate-700`}>
          {/* 移动端顶部状态栏 */}
          <div className="lg:hidden sticky top-0 z-50 bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-md px-4 h-14 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <User size={16} className="text-slate-400 dark:text-slate-500" />
            </div>
            <div className="flex gap-6 font-bold text-sm text-slate-800 dark:text-slate-200">
              <span className="border-b-4 pb-3" style={{ borderColor: theme.primary }}>
                {navBrandText}
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1"
              aria-label="菜单"
            >
              <MoreHorizontal size={20} className="text-slate-500" />
            </button>
          </div>

          {/* 移动端菜单 */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white dark:bg-[#0f0f0f] border-b border-slate-100 dark:border-slate-700 p-4">
              <div className="flex flex-col gap-2">
                {navMenu.length > 0 ? (
                  navMenu.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.url}
                      className="px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))
                ) : (
                  <>
                    <Link href="/" className="px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300" onClick={() => setMobileMenuOpen(false)}>首页</Link>
                    <Link href="/categories" className="px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300" onClick={() => setMobileMenuOpen(false)}>分类</Link>
                    <Link href="/tags" className="px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300" onClick={() => setMobileMenuOpen(false)}>标签</Link>
                    <Link href="/about" className="px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300" onClick={() => setMobileMenuOpen(false)}>关于</Link>
                  </>
                )}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">主题模式</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          )}

          {/* PC 顶部标题栏 */}
          <div className="hidden lg:flex sticky top-0 z-50 bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-md px-6 h-14 items-center border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-200">{navBrandText}</h2>
          </div>

          {/* 内容区域 */}
          <div className={`${config.layoutDensity === 'cozy' ? 'pb-24' : 'pb-16'}`}>
            {children}
          </div>
        </main>

        {/* 右侧边栏 */}
        {showRightSidebar && <RightSidebar config={config} />}
      </div>

      {/* 手机端底部导航 */}
      <footer className="lg:hidden fixed bottom-0 left-0 w-full h-16 bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-700 flex items-center justify-around z-50">
        <Link href="/" style={{ color: theme.primary }}>
          <Home size={26} />
        </Link>
        <Link href="/categories" className="text-slate-400 dark:text-slate-500">
          <Hash size={26} />
        </Link>
        <Link
          href="/tags"
          className="w-12 h-10 rounded-xl flex items-center justify-center text-white"
          style={{ backgroundColor: theme.primary }}
        >
          <Bookmark size={20} />
        </Link>
        <Link href="/about" className="text-slate-400 dark:text-slate-500">
          <User size={26} />
        </Link>
        <Link href="/search" className="text-slate-400 dark:text-slate-500">
          <Search size={26} />
        </Link>
      </footer>
    </div>
  );
}


// ============ 文章卡片：Feed 项 ============
function ArticleCard({ article, config = defaultConfig }: ArticleCardProps & { config?: ThemeConfig }) {
  const [isLiked, setIsLiked] = useState(false);
  const theme = colorMaps[config.primaryColor] || colorMaps['weibo-orange'];
  const excerptLength = config.excerptLength || 150;
  const showFeaturedImage = config.showFeaturedImage !== false;
  const showVerifiedBadge = config.showVerifiedBadge !== false;
  const imageGridStyle = config.imageGridStyle || 'auto';

  // 生成图片数组（基于文章ID的稳定哈希）
  const images = useMemo(() => {
    if (!showFeaturedImage) return [];
    if (article.featuredImage) return [article.featuredImage];
    
    // 如果没有特色图，根据配置决定是否显示占位图
    if (imageGridStyle === 'single') {
      return [`https://picsum.photos/seed/${article.id}/800/400`];
    }
    return [];
  }, [article.id, article.featuredImage, showFeaturedImage, imageGridStyle]);

  // 计算网格列数
  const getGridClass = (count: number) => {
    if (imageGridStyle === 'single' || count === 1) return 'grid-cols-1';
    if (count === 2 || count === 4) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  return (
    <article className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
      <div className="flex gap-3">
        {/* 头像 */}
        <div className="shrink-0">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
              <User size={24} className="text-slate-400 dark:text-slate-500" />
            </div>
            {showVerifiedBadge && (
              <div className="absolute -right-0.5 -bottom-0.5 w-4 h-4 bg-white dark:bg-[#0f0f0f] rounded-full flex items-center justify-center">
                <CheckCircle2 size={12} fill={theme.primary} className="text-white" />
              </div>
            )}
          </div>
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          {/* 作者信息 */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex flex-col">
              <span className="font-black text-[15px] hover:underline" style={{ color: theme.primary }}>
                {article.category?.name || '博主'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock size={10} />
                {formatDate(article.publishedAt || article.createdAt)}
              </span>
            </div>
            <Link
              href={`/category/${article.category?.id || ''}`}
              className="px-4 py-1.5 rounded-full border font-bold text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              style={{ borderColor: theme.primary, color: theme.primary }}
            >
              {article.category?.name || '分类'}
            </Link>
          </div>

          {/* 标题 */}
          <Link href={`/article/${article.slug}`}>
            <h2 className="text-lg font-black mb-2 hover:underline line-clamp-2 text-slate-800 dark:text-slate-200">
              {article.title}
            </h2>
          </Link>

          {/* 摘要 */}
          <div className="text-[15px] leading-relaxed mb-3 text-slate-600 dark:text-slate-400">
            {truncate(article.excerpt || article.content, excerptLength)}
            <Link
              href={`/article/${article.slug}`}
              className="ml-2 font-bold cursor-pointer"
              style={{ color: theme.primary }}
            >
              ...全文
            </Link>
          </div>

          {/* 标签 */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {article.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.id}`}
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* 图片网格 */}
          {images.length > 0 && (
            <div className={`grid gap-1 mb-4 max-w-[500px] ${getGridClass(images.length)}`}>
              {images.map((src, i) => (
                <div
                  key={i}
                  className={`relative bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden ${
                    images.length === 1 ? 'max-w-[400px] aspect-video' : 'aspect-square'
                  }`}
                >
                  <img
                    src={src}
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                    alt={article.title}
                  />
                </div>
              ))}
            </div>
          )}

          {/* 工具栏 */}
          <div className="flex justify-between items-center max-w-md text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1 hover:text-blue-500 transition-colors cursor-pointer">
              <Repeat size={18} />
              <span className="text-xs font-bold">{Math.floor(Math.random() * 100) + 10}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-green-500 transition-colors cursor-pointer">
              <MessageCircle size={18} />
              <span className="text-xs font-bold">{Math.floor(Math.random() * 50) + 5}</span>
            </div>
            <div
              className={`flex items-center gap-1 cursor-pointer transition-colors ${
                isLiked ? 'text-red-500' : 'hover:text-red-500'
              }`}
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
            >
              {isLiked ? <Heart size={18} fill="currentColor" /> : <Heart size={18} />}
              <span className="text-xs font-bold">{article.viewCount || 0}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-amber-500 transition-colors cursor-pointer">
              <Share size={18} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}


// ============ 文章详情 ============
function ArticleDetail({ article, config = defaultConfig }: ArticleDetailProps & { config?: ThemeConfig }) {
  const theme = colorMaps[config.primaryColor] || colorMaps['weibo-orange'];
  const showAiAssistant = config.showAiAssistant !== false;

  return (
    <article className="animate-in fade-in duration-700">
      <div className="p-4 md:p-8 space-y-8">
        {/* 头部 */}
        <header className="space-y-6">
          <h1 className="text-2xl md:text-4xl font-black leading-tight tracking-tight text-slate-800 dark:text-slate-100">
            {article.title}
          </h1>

          {/* 作者信息栏 */}
          <div className="flex items-center gap-4 py-4 border-y border-slate-100 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <User size={24} className="text-slate-400 dark:text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="font-black text-lg text-slate-800 dark:text-slate-200">{article.author?.username || '博主'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Clock size={12} />
                {formatDate(article.publishedAt || article.createdAt)}
                <span>·</span>
                <Eye size={12} />
                {article.viewCount || 0} 阅读
              </p>
            </div>
            {article.category && (
              <Link
                href={`/category/${article.category.id}`}
                className="px-6 py-2 rounded-full text-white font-black text-sm"
                style={{ backgroundColor: theme.primary }}
              >
                {article.category.name}
              </Link>
            )}
          </div>
        </header>

        {/* AI 内容摘要 */}
        {showAiAssistant && (
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: theme.primary }}
            />
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                AI 内容解析
              </span>
            </div>
            <p className="text-sm font-bold italic text-slate-600 dark:text-slate-400">
              "本文深度探讨了关于「{article.title}」的核心议题，
              {article.category && `属于${article.category.name}分类，`}
              建议从多角度切入思考。"
            </p>
          </div>
        )}

        {/* 正文内容 */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-img:rounded-2xl prose-pre:rounded-2xl prose-headings:font-black prose-headings:text-slate-800 dark:prose-headings:text-slate-200"
          dangerouslySetInnerHTML={{ __html: article.htmlContent || article.content }}
        />

        {/* 标签 */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-100 dark:border-slate-700">
            {article.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.id}`}
                className="px-4 py-2 rounded-full text-sm font-bold transition-colors"
                style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* 底部互动栏 */}
        <footer className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex gap-8 md:gap-12">
            <div className="flex flex-col items-center gap-1 group cursor-pointer transition-colors text-slate-500 dark:text-slate-400 hover:text-red-500">
              <Heart size={28} />
              <span className="text-xs font-black">{article.viewCount || 0} 赞</span>
            </div>
            <div className="flex flex-col items-center gap-1 group cursor-pointer transition-colors text-slate-500 dark:text-slate-400 hover:text-blue-500">
              <Repeat size={28} />
              <span className="text-xs font-black">转发</span>
            </div>
            <div className="flex flex-col items-center gap-1 group cursor-pointer transition-colors text-slate-500 dark:text-slate-400 hover:text-green-500">
              <MessageCircle size={28} />
              <span className="text-xs font-black">评论</span>
            </div>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full cursor-pointer hover:rotate-12 transition-all text-slate-600 dark:text-slate-400">
            <Share size={24} />
          </div>
        </footer>
      </div>
    </article>
  );
}


// ============ 分类列表 ============
function CategoryList({ categories, config = defaultConfig }: CategoryListProps & { config?: ThemeConfig }) {
  const theme = colorMaps[config.primaryColor] || colorMaps['weibo-orange'];

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
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-3 mb-2">
          <Folder size={24} style={{ color: theme.primary }} />
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-200">分类目录</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">浏览所有文章分类</p>
      </div>

      {/* 分类列表 */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {flatCategories.map(({ category, isChild }, i) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className={`flex items-center justify-between p-4 md:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
              isChild ? 'pl-8 md:pl-12' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg"
                style={{ backgroundColor: theme.primary }}
              >
                {isChild ? '└' : String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-800 dark:text-slate-200">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{category.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-slate-300 dark:text-slate-600">
                {category._count?.articles || 0}
              </span>
              <ArrowRight size={20} className="text-slate-400 dark:text-slate-500" />
            </div>
          </Link>
        ))}
      </div>

      {flatCategories.length === 0 && (
        <div className="p-12 text-center">
          <Layers size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-lg font-bold text-slate-400 dark:text-slate-500">暂无分类</p>
        </div>
      )}
    </div>
  );
}

// ============ 标签列表 ============
function TagList({ tags, config = defaultConfig }: TagListProps & { config?: ThemeConfig }) {
  const theme = colorMaps[config.primaryColor] || colorMaps['weibo-orange'];

  return (
    <div>
      {/* 页面标题 */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-3 mb-2">
          <Tag size={24} style={{ color: theme.primary }} />
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-200">标签云</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">探索所有话题标签</p>
      </div>

      {/* 标签云 */}
      <div className="p-6">
        <div className="flex flex-wrap gap-3">
          {tags.map((tag, index) => {
            const count = tag._count?.articles || 0;
            const size = count > 10 ? 'text-lg px-5 py-2.5' : count > 5 ? 'text-base px-4 py-2' : 'text-sm px-3 py-1.5';
            const isHot = index < 3;
            
            return (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className={`${size} rounded-full font-bold transition-all hover:scale-105 flex items-center gap-2`}
                style={{
                  backgroundColor: isHot ? theme.primary : `${theme.primary}15`,
                  color: isHot ? 'white' : theme.primary,
                }}
              >
                #{tag.name}
                <span className={`text-xs ${isHot ? 'text-white/80' : ''}`} style={!isHot ? { color: theme.primary, opacity: 0.7 } : {}}>
                  ({count})
                </span>
                {isHot && <TrendingUp size={14} />}
              </Link>
            );
          })}
        </div>
      </div>

      {tags.length === 0 && (
        <div className="p-12 text-center">
          <Hash size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-lg font-bold text-slate-400 dark:text-slate-500">暂无标签</p>
        </div>
      )}
    </div>
  );
}

// ============ 搜索结果 ============
function SearchResults({ articles, total, query, config = defaultConfig }: SearchResultProps & { config?: ThemeConfig }) {
  const theme = colorMaps[config.primaryColor] || colorMaps['weibo-orange'];

  if (!query) return null;

  return (
    <div>
      {/* 搜索标题 */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-3 mb-2">
          <Search size={24} style={{ color: theme.primary }} />
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-200">搜索结果</h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          找到 <span style={{ color: theme.primary }} className="font-bold">{total}</span> 篇关于
          "<span style={{ color: theme.primary }} className="font-bold">{query}</span>" 的文章
        </p>
      </div>

      {/* 结果列表 */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
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
        <div className="p-12 text-center">
          <Search size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-lg font-bold text-slate-400 dark:text-slate-500">未找到相关文章</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">尝试使用其他关键词搜索</p>
        </div>
      )}
    </div>
  );
}

// ============ 导出主题 ============
export const VibePulseTheme: ThemeComponents = {
  name: 'vibe-pulse',
  displayName: '微博风格',
  description: '社交信息流布局，左侧导航、中间信息流、右侧热搜与AI助手的完美结合',
  configOptions,
  defaultConfig,
  BlogLayout,
  ArticleCard,
  ArticleDetail,
  CategoryList,
  TagList,
  SearchResults,
};
