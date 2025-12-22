// Serene Ink 主题 - 静墨：以阅读为核心的极简博客主题
// 设计理念：干净、稳重、适合长时间阅读，内容是绝对主角
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '../../components/ThemeToggle';
import { SearchBox } from '../../components/SearchBox';
import { MobileNavMenu } from '../../components/NavMenu';
import { formatDate, truncate } from '../../lib/utils';
import { useSiteSettingsContext } from '../../contexts/site-settings-context';
import {
  CustomHtmlBlock,
  useHeadCodeInjector,
  customCodeConfigOptions,
  sidebarCustomHtmlConfigOptions,
  customCodeDefaultConfig,
  sidebarCustomHtmlDefaultConfig,
} from '../shared';
import {
  Search,
  Menu,
  X,
  ChevronRight,
  Calendar,
  Clock,
  Eye,
  Folder,
  Tag,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ChevronDown,
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

// 主题配置选项 - 所有功能都可在设置页面编辑
const configOptions: ThemeConfigOption[] = [
  {
    key: 'colorScheme',
    label: '色彩方案',
    type: 'select',
    options: [
      { value: 'warm-paper', label: '暖纸色（护眼）' },
      { value: 'cool-gray', label: '冷灰色（专业）' },
      { value: 'pure-white', label: '纯净白（清爽）' },
      { value: 'sepia', label: '复古褐（怀旧）' },
    ],
    default: 'warm-paper',
    description: '整体背景色调，影响阅读舒适度',
  },
  {
    key: 'contentWidth',
    label: '内容宽度',
    type: 'select',
    options: [
      { value: 'narrow', label: '窄版 (640px) - 最佳阅读' },
      { value: 'medium', label: '中等 (720px) - 平衡' },
      { value: 'wide', label: '宽版 (800px) - 更多内容' },
    ],
    default: 'medium',
    description: '正文区域宽度，窄版更适合长文阅读',
  },
  {
    key: 'fontSize',
    label: '基础字号',
    type: 'select',
    options: [
      { value: 'small', label: '小 (16px)' },
      { value: 'medium', label: '中 (18px) - 推荐' },
      { value: 'large', label: '大 (20px)' },
    ],
    default: 'medium',
    description: '正文字体大小',
  },
  {
    key: 'lineHeight',
    label: '行高',
    type: 'select',
    options: [
      { value: 'compact', label: '紧凑 (1.6)' },
      { value: 'comfortable', label: '舒适 (1.8) - 推荐' },
      { value: 'relaxed', label: '宽松 (2.0)' },
    ],
    default: 'comfortable',
    description: '行与行之间的间距',
  },
  {
    key: 'paragraphSpacing',
    label: '段落间距',
    type: 'select',
    options: [
      { value: 'tight', label: '紧凑' },
      { value: 'normal', label: '正常 - 推荐' },
      { value: 'loose', label: '宽松' },
    ],
    default: 'normal',
    description: '段落之间的间距',
  },
  {
    key: 'headerStyle',
    label: '导航栏风格',
    type: 'select',
    options: [
      { value: 'minimal', label: '极简（仅Logo和菜单）' },
      { value: 'standard', label: '标准（含搜索）' },
      { value: 'hidden', label: '隐藏（滚动时显示）' },
    ],
    default: 'standard',
    description: '顶部导航栏的显示方式',
  },
  {
    key: 'showReadingProgress',
    label: '显示阅读进度',
    type: 'boolean',
    default: true,
    description: '在文章页顶部显示阅读进度条',
  },
  {
    key: 'showReadingTime',
    label: '显示阅读时间',
    type: 'boolean',
    default: true,
    description: '显示预估阅读时间',
  },
  {
    key: 'showTableOfContents',
    label: '显示目录',
    type: 'boolean',
    default: true,
    description: '在长文章中显示侧边目录',
  },
  {
    key: 'showFeaturedImage',
    label: '显示特色图片',
    type: 'boolean',
    default: false,
    description: '在文章列表中显示封面图（关闭更简洁）',
  },
  {
    key: 'showArticleDetailFeaturedImage',
    label: '文章页显示特色图',
    type: 'boolean',
    default: true,
    description: '在文章详情页显示特色图片',
  },
  {
    key: 'articleListStyle',
    label: '文章列表风格',
    type: 'select',
    options: [
      { value: 'simple', label: '简洁（仅标题和日期）' },
      { value: 'excerpt', label: '摘要（含简短描述）' },
      { value: 'card', label: '卡片（含更多信息）' },
    ],
    default: 'excerpt',
    description: '首页文章列表的展示方式',
  },
  {
    key: 'excerptLength',
    label: '摘要长度',
    type: 'number',
    default: 120,
    description: '文章摘要显示的字符数',
  },
  {
    key: 'showAuthor',
    label: '显示作者信息',
    type: 'boolean',
    default: false,
    description: '在文章中显示作者信息',
  },
  {
    key: 'showViewCount',
    label: '显示阅读量',
    type: 'boolean',
    default: true,
    description: '显示文章阅读次数',
  },
  {
    key: 'footerText',
    label: '页脚文字',
    type: 'text',
    default: '',
    description: '自定义页脚文字（留空使用默认）',
  },
  // 添加自定义代码注入配置
  ...customCodeConfigOptions,
  ...sidebarCustomHtmlConfigOptions,
];

const defaultConfig: ThemeConfig = {
  colorScheme: 'warm-paper',
  contentWidth: 'medium',
  fontSize: 'medium',
  lineHeight: 'comfortable',
  paragraphSpacing: 'normal',
  headerStyle: 'standard',
  showReadingProgress: true,
  showReadingTime: true,
  showTableOfContents: true,
  showFeaturedImage: false,
  showArticleDetailFeaturedImage: true,
  articleListStyle: 'excerpt',
  excerptLength: 120,
  showAuthor: false,
  showViewCount: true,
  footerText: '',
  // 添加自定义代码默认值
  ...customCodeDefaultConfig,
  ...sidebarCustomHtmlDefaultConfig,
};

// 色彩方案定义
const colorSchemes: Record<string, {
  bg: string;
  bgDark: string;
  text: string;
  textDark: string;
  textMuted: string;
  textMutedDark: string;
  border: string;
  borderDark: string;
  accent: string;
}> = {
  'warm-paper': {
    bg: 'bg-[#FDFBF7]',
    bgDark: 'dark:bg-[#1a1a1a]',
    text: 'text-[#2c2c2c]',
    textDark: 'dark:text-[#e8e6e3]',
    textMuted: 'text-[#6b6b6b]',
    textMutedDark: 'dark:text-[#9a9a9a]',
    border: 'border-[#e8e4dc]',
    borderDark: 'dark:border-[#333]',
    accent: '#5c7c6f',
  },
  'cool-gray': {
    bg: 'bg-[#f8f9fa]',
    bgDark: 'dark:bg-[#111]',
    text: 'text-[#1a1a1a]',
    textDark: 'dark:text-[#f0f0f0]',
    textMuted: 'text-[#666]',
    textMutedDark: 'dark:text-[#888]',
    border: 'border-[#e5e5e5]',
    borderDark: 'dark:border-[#2a2a2a]',
    accent: '#4a6fa5',
  },
  'pure-white': {
    bg: 'bg-white',
    bgDark: 'dark:bg-[#0a0a0a]',
    text: 'text-[#111]',
    textDark: 'dark:text-[#fafafa]',
    textMuted: 'text-[#555]',
    textMutedDark: 'dark:text-[#aaa]',
    border: 'border-[#eee]',
    borderDark: 'dark:border-[#222]',
    accent: '#333',
  },
  'sepia': {
    bg: 'bg-[#f4ecd8]',
    bgDark: 'dark:bg-[#1c1810]',
    text: 'text-[#3d3425]',
    textDark: 'dark:text-[#d4c8a8]',
    textMuted: 'text-[#7a6f5d]',
    textMutedDark: 'dark:text-[#9a8f7d]',
    border: 'border-[#d4c8a8]',
    borderDark: 'dark:border-[#3d3425]',
    accent: '#8b7355',
  },
};

// 内容宽度映射
const contentWidthMap: Record<string, string> = {
  narrow: 'max-w-[640px]',
  medium: 'max-w-[720px]',
  wide: 'max-w-[800px]',
};

// 字号映射
const fontSizeMap: Record<string, string> = {
  small: 'text-base',
  medium: 'text-lg',
  large: 'text-xl',
};

// 行高映射
const lineHeightMap: Record<string, string> = {
  compact: 'leading-relaxed',
  comfortable: 'leading-loose',
  relaxed: 'leading-[2]',
};

// 段落间距映射
const paragraphSpacingMap: Record<string, string> = {
  tight: 'space-y-4',
  normal: 'space-y-6',
  loose: 'space-y-8',
};

// 计算阅读时间
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 300; // 中文阅读速度
  const textLength = content.replace(/<[^>]*>/g, '').length;
  return Math.max(1, Math.ceil(textLength / wordsPerMinute));
}

// 菜单项组件（支持多级）
function NavItem({ item, colors, depth = 0 }: { item: any; colors: typeof colorSchemes['warm-paper']; depth?: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isExternal = item.type === 'external';

  if (hasChildren) {
    return (
      <div className="relative group">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-1 py-2 ${colors.textMuted} ${colors.textMutedDark} hover:${colors.text} hover:${colors.textDark} transition-colors text-sm`}
        >
          {item.label}
          <ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        {expanded && (
          <div className={`absolute top-full left-0 mt-1 py-2 min-w-[160px] ${colors.bg} ${colors.bgDark} ${colors.border} ${colors.borderDark} border rounded-lg shadow-lg z-50`}>
            {item.children.map((child: any) => (
              <Link
                key={child.id}
                href={child.url}
                target={child.type === 'external' ? '_blank' : undefined}
                className={`block px-4 py-2 text-sm ${colors.textMuted} ${colors.textMutedDark} hover:${colors.text} hover:${colors.textDark} transition-colors`}
              >
                {child.label}
                {child.type === 'external' && <ExternalLink size={12} className="inline ml-1" />}
              </Link>
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
      className={`py-2 ${colors.textMuted} ${colors.textMutedDark} hover:${colors.text} hover:${colors.textDark} transition-colors text-sm`}
    >
      {item.label}
      {isExternal && <ExternalLink size={12} className="inline ml-1" />}
    </Link>
  );
}


// ============ 核心布局组件 ============
function BlogLayout({ children, config = defaultConfig }: { children: ReactNode; config?: ThemeConfig }) {
  const { settings, navMenu } = useSiteSettingsContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const colors = colorSchemes[config.colorScheme as string] || colorSchemes['warm-paper'];
  const contentWidth = contentWidthMap[config.contentWidth as string] || contentWidthMap.medium;
  const siteName = settings.siteName || 'Blog';
  const siteLogo = settings.siteLogo;
  const headerStyle = config.headerStyle || 'standard';
  const customFooter = config.footerText as string;
  const footerText = customFooter || settings.footerText?.replace('{year}', new Date().getFullYear().toString()) || `© ${new Date().getFullYear()} ${siteName}`;

  // 自定义代码
  const customHeadCode = config.customHeadCode as string;
  const customBodyStartCode = config.customBodyStartCode as string;
  const customBodyEndCode = config.customBodyEndCode as string;

  // 注入head代码
  useHeadCodeInjector(customHeadCode);

  const defaultNavItems: Array<{ id: string; label: string; url: string; type: 'internal' | 'external'; sortOrder: number }> = [
    { id: '1', label: '首页', url: '/', type: 'internal', sortOrder: 0 },
    { id: '2', label: '分类', url: '/categories', type: 'internal', sortOrder: 1 },
    { id: '3', label: '标签', url: '/tags', type: 'internal', sortOrder: 2 },
    { id: '4', label: '关于', url: '/about', type: 'internal', sortOrder: 3 },
  ];
  const navItems = navMenu.length > 0 ? navMenu : defaultNavItems;

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.bgDark} ${colors.text} ${colors.textDark} transition-colors duration-300`}>
      {/* 页面顶部自定义代码 */}
      {customBodyStartCode && <CustomHtmlBlock html={customBodyStartCode} />}

      {/* 导航栏 */}
      {headerStyle !== 'hidden' && (
        <header className={`sticky top-0 z-50 ${colors.bg} ${colors.bgDark} border-b ${colors.border} ${colors.borderDark} backdrop-blur-sm bg-opacity-95`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight shrink-0">
                {siteLogo && <img src={siteLogo} alt={siteName} className="h-8 w-auto" />}
                <span className="hidden sm:inline">{siteName}</span>
              </Link>

              {/* 桌面导航 */}
              <nav className="hidden md:flex items-center gap-4 lg:gap-6 overflow-x-auto">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.url}
                    target={item.type === 'external' ? '_blank' : undefined}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
                  >
                    {item.label}
                    {item.type === 'external' && <ExternalLink size={12} className="inline ml-1" />}
                  </Link>
                ))}
              </nav>

              {/* 右侧操作 */}
              <div className="flex items-center gap-2 shrink-0">
                {headerStyle === 'standard' && (
                  <SearchBox />
                )}
                <ThemeToggle />
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400"
                  aria-label="菜单"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <MobileNavMenu items={navItems} onClose={() => setMobileMenuOpen(false)} />
      )}

      {/* 主内容区 - 应用内容宽度限制 */}
      <main className="min-h-[calc(100vh-8rem)]">
        <div className={`${contentWidth} mx-auto px-4 sm:px-6 py-8 md:py-12`}>
          {children}
        </div>
      </main>

      {/* 页脚 - 极简 */}
      <footer className={`py-12 border-t ${colors.border} ${colors.borderDark}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className={`text-sm ${colors.textMuted} ${colors.textMutedDark}`}>
            {footerText}
          </p>
        </div>
      </footer>

      {/* 页面底部自定义代码 */}
      {customBodyEndCode && <CustomHtmlBlock html={customBodyEndCode} />}
    </div>
  );
}

// ============ 文章卡片 ============
function ArticleCard({ article, config = defaultConfig }: ArticleCardProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme as string] || colorSchemes['warm-paper'];
  const listStyle = config.articleListStyle || 'excerpt';
  const showFeaturedImage = config.showFeaturedImage === true;
  const excerptLength = (config.excerptLength as number) || 120;
  const showViewCount = config.showViewCount !== false;
  const showReadingTime = config.showReadingTime !== false;

  const readingTime = calculateReadingTime(article.content);

  // 简洁风格 - 仅标题和日期
  if (listStyle === 'simple') {
    return (
      <article className={`py-4 border-b ${colors.border} ${colors.borderDark} last:border-b-0`}>
        <div className="flex items-baseline justify-between gap-4">
          <Link href={`/article/${article.slug}`} className="group flex-1 min-w-0">
            <h2 className={`font-medium ${colors.text} ${colors.textDark} group-hover:underline underline-offset-4 truncate`}>
              {article.title}
            </h2>
          </Link>
          <time className={`text-sm ${colors.textMuted} ${colors.textMutedDark} shrink-0`}>
            {formatDate(article.publishedAt || article.createdAt).split(' ')[0]}
          </time>
        </div>
      </article>
    );
  }

  // 摘要风格 - 标题、日期、摘要
  if (listStyle === 'excerpt') {
    return (
      <article className={`py-8 border-b ${colors.border} ${colors.borderDark} last:border-b-0`}>
        <Link href={`/article/${article.slug}`} className="group block">
          <h2 className={`text-xl font-semibold mb-3 ${colors.text} ${colors.textDark} group-hover:underline underline-offset-4`}>
            {article.title}
          </h2>
        </Link>
        <p className={`mb-4 leading-relaxed ${colors.textMuted} ${colors.textMutedDark}`}>
          {truncate(article.excerpt || article.content, excerptLength)}
        </p>
        <div className={`flex items-center gap-4 text-sm ${colors.textMuted} ${colors.textMutedDark}`}>
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {formatDate(article.publishedAt || article.createdAt).split(' ')[0]}
          </span>
          {showReadingTime && (
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {readingTime} 分钟
            </span>
          )}
          {showViewCount && (article.viewCount || 0) > 0 && (
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {article.viewCount}
            </span>
          )}
          {article.category && (
            <Link
              href={`/category/${article.category.id}`}
              className="flex items-center gap-1 hover:underline"
            >
              <Folder size={14} />
              {article.category.name}
            </Link>
          )}
        </div>
      </article>
    );
  }

  // 卡片风格 - 含更多信息和可选图片
  return (
    <article className={`py-8 border-b ${colors.border} ${colors.borderDark} last:border-b-0`}>
      <div className={showFeaturedImage && article.featuredImage ? 'md:flex md:gap-6' : ''}>
        {showFeaturedImage && article.featuredImage && (
          <div className="md:w-48 md:shrink-0 mb-4 md:mb-0">
            <Link href={`/article/${article.slug}`}>
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-32 md:h-full object-cover rounded-lg"
              />
            </Link>
          </div>
        )}
        <div className="flex-1">
          <Link href={`/article/${article.slug}`} className="group block">
            <h2 className={`text-xl font-semibold mb-3 ${colors.text} ${colors.textDark} group-hover:underline underline-offset-4`}>
              {article.title}
            </h2>
          </Link>
          <p className={`mb-4 leading-relaxed ${colors.textMuted} ${colors.textMutedDark}`}>
            {truncate(article.excerpt || article.content, excerptLength)}
          </p>
          <div className={`flex flex-wrap items-center gap-4 text-sm ${colors.textMuted} ${colors.textMutedDark}`}>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(article.publishedAt || article.createdAt).split(' ')[0]}
            </span>
            {showReadingTime && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {readingTime} 分钟
              </span>
            )}
            {showViewCount && (article.viewCount || 0) > 0 && (
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {article.viewCount}
              </span>
            )}
            {article.category && (
              <Link
                href={`/category/${article.category.id}`}
                className="flex items-center gap-1 hover:underline"
              >
                <Folder size={14} />
                {article.category.name}
              </Link>
            )}
          </div>
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {article.tags.slice(0, 4).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.id}`}
                  className={`text-xs px-2 py-1 rounded ${colors.border} ${colors.borderDark} border ${colors.textMuted} ${colors.textMutedDark} hover:${colors.text} hover:${colors.textDark} transition-colors`}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}


// ============ 阅读进度条 ============
function ReadingProgress({ color }: { color: string }) {
  const [progress, setProgress] = useState(0);

  if (typeof window !== 'undefined') {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, scrollPercent));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
  }

  return (
    <div className="fixed top-0 left-0 w-full h-0.5 z-[100]">
      <div
        className="h-full transition-all duration-150"
        style={{ width: `${progress}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ============ 文章详情 ============
function ArticleDetail({ article, config = defaultConfig }: ArticleDetailProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme as string] || colorSchemes['warm-paper'];
  const fontSize = fontSizeMap[config.fontSize as string] || fontSizeMap.medium;
  const lineHeight = lineHeightMap[config.lineHeight as string] || lineHeightMap.comfortable;
  const paragraphSpacing = paragraphSpacingMap[config.paragraphSpacing as string] || paragraphSpacingMap.normal;
  
  const showReadingProgress = config.showReadingProgress !== false;
  const showReadingTime = config.showReadingTime !== false;
  const showAuthor = config.showAuthor === true;
  const showViewCount = config.showViewCount !== false;
  const showArticleDetailFeaturedImage = config.showArticleDetailFeaturedImage !== false;

  const readingTime = calculateReadingTime(article.content);

  return (
    <article className="animate-in fade-in duration-500">
      {/* 阅读进度条 */}
      {showReadingProgress && <ReadingProgress color={colors.accent} />}

      {/* 文章头部 */}
      <header className="py-8 md:py-12">
        {/* 分类 */}
        {article.category && (
          <Link
            href={`/category/${article.category.id}`}
            className={`inline-block text-sm mb-4 ${colors.textMuted} ${colors.textMutedDark} hover:underline`}
          >
            {article.category.name}
          </Link>
        )}

        {/* 标题 */}
        <h1 className={`text-3xl md:text-4xl font-bold leading-tight mb-6 ${colors.text} ${colors.textDark}`}>
          {article.title}
        </h1>

        {/* 元信息 */}
        <div className={`flex flex-wrap items-center gap-4 text-sm ${colors.textMuted} ${colors.textMutedDark}`}>
          {showAuthor && article.author && (
            <span>{article.author.username}</span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {formatDate(article.publishedAt || article.createdAt)}
          </span>
          {showReadingTime && (
            <span className="flex items-center gap-1">
              <Clock size={14} />
              约 {readingTime} 分钟
            </span>
          )}
          {showViewCount && (article.viewCount || 0) > 0 && (
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {article.viewCount} 次阅读
            </span>
          )}
        </div>
      </header>

      {/* 特色图片 */}
      {showArticleDetailFeaturedImage && article.featuredImage && (
        <div className="mb-8">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full rounded-lg"
          />
        </div>
      )}

      {/* 正文内容 */}
      <div className="pb-8">
        <div
          className={`
            prose prose-slate dark:prose-invert max-w-none
            ${fontSize} ${lineHeight}
            prose-headings:font-semibold prose-headings:${colors.text} dark:prose-headings:${colors.textDark}
            prose-p:${colors.text} dark:prose-p:${colors.textDark}
            prose-a:underline prose-a:underline-offset-4 prose-a:decoration-1
            prose-blockquote:border-l-2 prose-blockquote:${colors.border} dark:prose-blockquote:${colors.borderDark}
            prose-blockquote:${colors.textMuted} dark:prose-blockquote:${colors.textMutedDark}
            prose-blockquote:not-italic prose-blockquote:font-normal
            prose-code:text-sm prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-code:${colors.bg} dark:prose-code:bg-[#2a2a2a]
            prose-pre:rounded-lg prose-pre:bg-[#1a1a1a]
            prose-img:rounded-lg
            prose-hr:${colors.border} dark:prose-hr:${colors.borderDark}
            ${paragraphSpacing}
          `}
          style={{ '--tw-prose-links': colors.accent } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: article.htmlContent || article.content }}
        />

        {/* 标签 */}
        {article.tags && article.tags.length > 0 && (
          <div className={`flex flex-wrap gap-2 mt-12 pt-8 border-t ${colors.border} ${colors.borderDark}`}>
            <Tag size={16} className={`${colors.textMuted} ${colors.textMutedDark}`} />
            {article.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.id}`}
                className={`text-sm px-3 py-1 rounded-full border ${colors.border} ${colors.borderDark} ${colors.textMuted} ${colors.textMutedDark} hover:${colors.text} hover:${colors.textDark} transition-colors`}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* 文章导航 */}
        <nav className={`mt-12 pt-8 border-t ${colors.border} ${colors.borderDark}`}>
          <div className="flex justify-between">
            <Link
              href="/"
              className={`flex items-center gap-2 text-sm ${colors.textMuted} ${colors.textMutedDark} hover:${colors.text} hover:${colors.textDark} transition-colors`}
            >
              <ArrowLeft size={16} />
              返回首页
            </Link>
          </div>
        </nav>
      </div>
    </article>
  );
}

// ============ 分类列表 ============
function CategoryList({ categories, config = defaultConfig }: CategoryListProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme as string] || colorSchemes['warm-paper'];

  // 展平分类（支持多级）
  const flatCategories: { category: CategoryListProps['categories'][0]; depth: number }[] = [];
  const flatten = (cats: CategoryListProps['categories'], depth = 0) => {
    cats.forEach((cat) => {
      flatCategories.push({ category: cat, depth });
      if (cat.children) flatten(cat.children as CategoryListProps['categories'], depth + 1);
    });
  };
  flatten(categories);

  return (
    <div className="py-4">
      <h1 className={`text-2xl md:text-3xl font-bold mb-8 ${colors.text} ${colors.textDark}`}>
        分类
      </h1>
      <div className={`divide-y ${colors.border} ${colors.borderDark}`}>
        {flatCategories.map(({ category, depth }) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className={`flex items-center justify-between py-4 hover:${colors.text} hover:${colors.textDark} transition-colors group`}
            style={{ paddingLeft: depth * 24 }}
          >
            <div className="flex items-center gap-3">
              {depth > 0 && <ChevronRight size={14} className={colors.textMuted} />}
              <span className={`font-medium ${colors.text} ${colors.textDark}`}>{category.name}</span>
              {category.description && (
                <span className={`text-sm ${colors.textMuted} ${colors.textMutedDark} hidden sm:inline`}>
                  — {category.description}
                </span>
              )}
            </div>
            <span className={`text-sm ${colors.textMuted} ${colors.textMutedDark}`}>
              {category._count?.articles || 0} 篇
            </span>
          </Link>
        ))}
      </div>
      {flatCategories.length === 0 && (
        <p className={`text-center py-12 ${colors.textMuted} ${colors.textMutedDark}`}>
          暂无分类
        </p>
      )}
    </div>
  );
}

// ============ 标签列表 ============
function TagList({ tags, config = defaultConfig }: TagListProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme as string] || colorSchemes['warm-paper'];

  return (
    <div className="py-4">
      <h1 className={`text-2xl md:text-3xl font-bold mb-8 ${colors.text} ${colors.textDark}`}>
        标签
      </h1>
      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => {
          const count = tag._count?.articles || 0;
          return (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className={`px-4 py-2 rounded-full border ${colors.border} ${colors.borderDark} ${colors.textMuted} ${colors.textMutedDark} hover:${colors.text} hover:${colors.textDark} hover:border-current transition-colors text-sm`}
            >
              {tag.name}
              <span className="ml-2 opacity-60">({count})</span>
            </Link>
          );
        })}
      </div>
      {tags.length === 0 && (
        <p className={`text-center py-12 ${colors.textMuted} ${colors.textMutedDark}`}>
          暂无标签
        </p>
      )}
    </div>
  );
}

// ============ 搜索结果 ============
function SearchResults({ articles, total, query, config = defaultConfig }: SearchResultProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme as string] || colorSchemes['warm-paper'];

  if (!query) return null;

  return (
    <div className="py-4">
      <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${colors.text} ${colors.textDark}`}>
        搜索结果
      </h1>
      <p className={`mb-8 ${colors.textMuted} ${colors.textMutedDark}`}>
        找到 {total} 篇关于 "{query}" 的文章
      </p>
      <div>
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={{ ...article, featuredImage: null, category: null, viewCount: 0 }}
            config={{ ...config, articleListStyle: 'simple' }}
          />
        ))}
      </div>
      {articles.length === 0 && (
        <p className={`text-center py-12 ${colors.textMuted} ${colors.textMutedDark}`}>
          未找到相关文章，试试其他关键词？
        </p>
      )}
    </div>
  );
}

// ============ 导出主题 ============
export const SereneInkTheme: ThemeComponents = {
  name: 'serene-ink',
  displayName: '静墨',
  description: '以阅读为核心的极简博客主题，干净、稳重、适合长时间阅读',
  configOptions,
  defaultConfig,
  BlogLayout,
  ArticleCard,
  ArticleDetail,
  CategoryList,
  TagList,
  SearchResults,
};
