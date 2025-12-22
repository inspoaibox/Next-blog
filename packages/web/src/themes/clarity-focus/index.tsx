// Clarity Focus 主题 - 清晰聚焦：三栏结构，视觉重心集中在中间
// 设计理念：结构清楚，但注意力始终留在内容本身
import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '../../components/ThemeToggle';
import { InlineSearchBox } from '../../components/SearchBox';
import { DesktopNavMenu, MobileNavMenu } from '../../components/NavMenu';
import { formatDate, truncate } from '../../lib/utils';
import { useSiteSettingsContext } from '../../contexts/site-settings-context';
import {
  CustomHtmlBlock,
  useHeadCodeInjector,
  customCodeConfigOptions,
  dualSidebarCustomHtmlConfigOptions,
  customCodeDefaultConfig,
  dualSidebarCustomHtmlDefaultConfig,
} from '../shared';
import {
  Search,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Calendar,
  Clock,
  Eye,
  Folder,
  Tag,
  ArrowLeft,
  ExternalLink,
  FileText,
  Hash,
  TrendingUp,
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

// ============ 主题配置选项 ============
const configOptions: ThemeConfigOption[] = [
  {
    key: 'layoutWidth',
    label: '布局宽度',
    type: 'select',
    options: [
      { value: 'standard', label: '标准 (1280px)' },
      { value: 'wide', label: '宽屏 (1536px)' },
      { value: 'full', label: '全宽' },
    ],
    default: 'standard',
    description: '整体布局最大宽度',
  },
  {
    key: 'colorScheme',
    label: '色彩方案',
    type: 'select',
    options: [
      { value: 'light-gray', label: '浅灰（清爽）' },
      { value: 'warm-cream', label: '暖米色（护眼）' },
      { value: 'cool-blue', label: '冷蓝调（专业）' },
      { value: 'pure-white', label: '纯净白（极简）' },
    ],
    default: 'light-gray',
    description: '整体色调风格',
  },
  {
    key: 'mainColumnWidth',
    label: '主栏宽度',
    type: 'select',
    options: [
      { value: 'narrow', label: '窄版 (600px)' },
      { value: 'medium', label: '中等 (680px) - 推荐' },
      { value: 'wide', label: '宽版 (760px)' },
      { value: 'full', label: '自适应（撑满）' },
    ],
    default: 'medium',
    description: '中间主内容区域宽度',
  },
  {
    key: 'sidebarWidth',
    label: '侧栏宽度',
    type: 'select',
    options: [
      { value: 'narrow', label: '窄 (180px)' },
      { value: 'medium', label: '中等 (220px)' },
      { value: 'wide', label: '宽 (260px)' },
    ],
    default: 'medium',
    description: '左右侧栏宽度',
  },
  {
    key: 'leftSidebarContent',
    label: '左侧栏内容',
    type: 'select',
    options: [
      { value: 'toc', label: '文章目录（详情页）' },
      { value: 'sidebar', label: '侧边栏内容（搜索+标签）' },
      { value: 'widgets', label: '小部件' },
      { value: 'hidden', label: '隐藏' },
    ],
    default: 'toc',
    description: '左侧栏显示的内容',
  },
  {
    key: 'rightSidebarContent',
    label: '右侧栏内容',
    type: 'select',
    options: [
      { value: 'search-tags', label: '搜索 + 标签' },
      { value: 'recent', label: '最近文章' },
      { value: 'full', label: '搜索 + 标签 + 最近' },
      { value: 'toc', label: '文章目录（详情页）' },
      { value: 'hidden', label: '隐藏' },
    ],
    default: 'full',
    description: '右侧栏显示的内容',
  },
  {
    key: 'sidebarVisibility',
    label: '侧栏显示模式',
    type: 'select',
    options: [
      { value: 'always', label: '始终显示' },
      { value: 'hover', label: '悬停显示' },
      { value: 'scroll-hide', label: '滚动时隐藏' },
    ],
    default: 'always',
    description: '侧栏的显示行为',
  },
  {
    key: 'fontSize',
    label: '正文字号',
    type: 'select',
    options: [
      { value: 'small', label: '小 (16px)' },
      { value: 'medium', label: '中 (17px) - 推荐' },
      { value: 'large', label: '大 (18px)' },
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
      { value: 'comfortable', label: '舒适 (1.75)' },
      { value: 'relaxed', label: '宽松 (1.9)' },
    ],
    default: 'comfortable',
    description: '行与行之间的间距',
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
    key: 'showViewCount',
    label: '显示阅读量',
    type: 'boolean',
    default: true,
    description: '显示文章阅读次数',
  },
  {
    key: 'articleListStyle',
    label: '文章列表风格',
    type: 'select',
    options: [
      { value: 'minimal', label: '极简（仅标题）' },
      { value: 'compact', label: '紧凑（标题+日期）' },
      { value: 'standard', label: '标准（含摘要）' },
    ],
    default: 'standard',
    description: '首页文章列表展示方式',
  },
  {
    key: 'excerptLength',
    label: '摘要长度',
    type: 'number',
    default: 100,
    description: '文章摘要显示的字符数',
  },
  {
    key: 'showFeaturedImage',
    label: '显示特色图片',
    type: 'boolean',
    default: false,
    description: '在文章列表中显示封面图',
  },
  {
    key: 'sidebarOpacity',
    label: '侧栏透明度',
    type: 'select',
    options: [
      { value: 'subtle', label: '淡化 (0.5)' },
      { value: 'light', label: '轻微 (0.7)' },
      { value: 'normal', label: '正常 (1.0)' },
    ],
    default: 'light',
    description: '侧栏内容的透明度',
  },
  {
    key: 'headerStyle',
    label: '顶部导航',
    type: 'select',
    options: [
      { value: 'minimal', label: '极简（仅Logo）' },
      { value: 'standard', label: '标准（Logo+导航）' },
      { value: 'hidden', label: '隐藏' },
    ],
    default: 'standard',
    description: '顶部导航栏风格',
  },
  {
    key: 'footerText',
    label: '页脚文字',
    type: 'text',
    default: '',
    description: '自定义页脚文字',
  },
  {
    key: 'leftSidebarCustomHtml',
    label: '左侧栏自定义HTML',
    type: 'text',
    default: '',
    description: '在左侧栏底部显示的自定义HTML代码（支持广告、统计等）',
  },
  {
    key: 'rightSidebarCustomHtml',
    label: '右侧栏自定义HTML',
    type: 'text',
    default: '',
    description: '在右侧栏底部显示的自定义HTML代码（支持广告、统计等）',
  },
  {
    key: 'customHeadCode',
    label: '自定义Head代码',
    type: 'text',
    default: '',
    description: '插入到页面head标签中的代码（如统计代码、字体等）',
  },
  {
    key: 'customBodyStartCode',
    label: '页面顶部自定义代码',
    type: 'text',
    default: '',
    description: '插入到页面body开始处的代码',
  },
  {
    key: 'customBodyEndCode',
    label: '页面底部自定义代码',
    type: 'text',
    default: '',
    description: '插入到页面body结束处的代码',
  },
];

const defaultConfig: ThemeConfig = {
  layoutWidth: 'standard',
  colorScheme: 'light-gray',
  mainColumnWidth: 'medium',
  sidebarWidth: 'medium',
  leftSidebarContent: 'toc',
  rightSidebarContent: 'full',
  sidebarVisibility: 'always',
  fontSize: 'medium',
  lineHeight: 'comfortable',
  showReadingProgress: true,
  showReadingTime: true,
  showViewCount: true,
  articleListStyle: 'standard',
  excerptLength: 100,
  showFeaturedImage: false,
  sidebarOpacity: 'light',
  headerStyle: 'standard',
  footerText: '',
  leftSidebarCustomHtml: '',
  rightSidebarCustomHtml: '',
  customHeadCode: '',
  customBodyStartCode: '',
  customBodyEndCode: '',
};

// ============ 样式映射 ============
const colorSchemes: Record<string, {
  bg: string;
  bgDark: string;
  mainBg: string;
  mainBgDark: string;
  sideBg: string;
  sideBgDark: string;
  text: string;
  textDark: string;
  textMuted: string;
  textMutedDark: string;
  border: string;
  borderDark: string;
  accent: string;
}> = {
  'light-gray': {
    bg: 'bg-[#f5f5f5]',
    bgDark: 'dark:bg-[#111]',
    mainBg: 'bg-white',
    mainBgDark: 'dark:bg-[#1a1a1a]',
    sideBg: 'bg-[#fafafa]',
    sideBgDark: 'dark:bg-[#151515]',
    text: 'text-[#1a1a1a]',
    textDark: 'dark:text-[#e8e8e8]',
    textMuted: 'text-[#666]',
    textMutedDark: 'dark:text-[#888]',
    border: 'border-[#e5e5e5]',
    borderDark: 'dark:border-[#2a2a2a]',
    accent: '#4a7c59',
  },
  'warm-cream': {
    bg: 'bg-[#f8f6f1]',
    bgDark: 'dark:bg-[#1a1815]',
    mainBg: 'bg-[#fffdf8]',
    mainBgDark: 'dark:bg-[#1f1d1a]',
    sideBg: 'bg-[#f5f3ee]',
    sideBgDark: 'dark:bg-[#1a1815]',
    text: 'text-[#2c2a25]',
    textDark: 'dark:text-[#e5e3de]',
    textMuted: 'text-[#7a7770]',
    textMutedDark: 'dark:text-[#9a9890]',
    border: 'border-[#e8e5dc]',
    borderDark: 'dark:border-[#3a3530]',
    accent: '#8b7355',
  },
  'cool-blue': {
    bg: 'bg-[#f0f4f8]',
    bgDark: 'dark:bg-[#0d1117]',
    mainBg: 'bg-white',
    mainBgDark: 'dark:bg-[#161b22]',
    sideBg: 'bg-[#f6f8fa]',
    sideBgDark: 'dark:bg-[#0d1117]',
    text: 'text-[#1f2937]',
    textDark: 'dark:text-[#e6edf3]',
    textMuted: 'text-[#6b7280]',
    textMutedDark: 'dark:text-[#8b949e]',
    border: 'border-[#d0d7de]',
    borderDark: 'dark:border-[#30363d]',
    accent: '#2563eb',
  },
  'pure-white': {
    bg: 'bg-white',
    bgDark: 'dark:bg-[#0a0a0a]',
    mainBg: 'bg-white',
    mainBgDark: 'dark:bg-[#0a0a0a]',
    sideBg: 'bg-[#fafafa]',
    sideBgDark: 'dark:bg-[#111]',
    text: 'text-[#111]',
    textDark: 'dark:text-[#fafafa]',
    textMuted: 'text-[#555]',
    textMutedDark: 'dark:text-[#aaa]',
    border: 'border-[#eee]',
    borderDark: 'dark:border-[#222]',
    accent: '#333',
  },
};

const mainWidthMap: Record<string, string> = {
  narrow: 'max-w-[600px]',
  medium: 'max-w-[680px]',
  wide: 'max-w-[760px]',
  full: '',
};

const layoutWidthMap: Record<string, string> = {
  standard: 'max-w-7xl',
  wide: 'max-w-[1536px]',
  full: 'w-full',
};

const sidebarWidthMap: Record<string, string> = {
  narrow: 'w-[180px]',
  medium: 'w-[220px]',
  wide: 'w-[260px]',
};

const fontSizeMap: Record<string, string> = {
  small: 'text-base',
  medium: 'text-[17px]',
  large: 'text-lg',
};

const lineHeightMap: Record<string, string> = {
  compact: 'leading-relaxed',
  comfortable: 'leading-[1.75]',
  relaxed: 'leading-loose',
};

const opacityMap: Record<string, string> = {
  subtle: 'opacity-50 hover:opacity-80',
  light: 'opacity-70 hover:opacity-100',
  normal: 'opacity-100',
};

// 计算阅读时间
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 300;
  const textLength = content.replace(/<[^>]*>/g, '').length;
  return Math.max(1, Math.ceil(textLength / wordsPerMinute));
}


// ============ TOC 组件 ============
interface TOCItem {
  id: string;
  text: string;
  level: number;
  children?: TOCItem[];
}

function TableOfContents({ toc }: { toc: TOCItem[] }) {
  if (!toc || toc.length === 0) return null;

  const renderItems = (items: TOCItem[], depth: number = 0) => (
    <ul className={depth > 0 ? 'ml-3 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-2' : 'space-y-2'}>
      {items.map((item, index) => (
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
            className={`block transition-colors line-clamp-2 ${
              depth === 0
                ? 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xs'
            }`}
            title={item.text}
          >
            {item.text}
          </a>
          {item.children && item.children.length > 0 && renderItems(item.children, depth + 1)}
        </li>
      ))}
    </ul>
  );

  return (
    <nav className="max-h-[70vh] overflow-y-auto pr-1">
      {renderItems(toc)}
    </nav>
  );
}

// ============ 左侧栏组件 ============
function LeftSidebar({
  config,
  colors,
  tags,
  recentArticles,
  toc,
}: {
  config: ThemeConfig;
  colors: (typeof colorSchemes)['light-gray'];
  tags?: TagListProps['tags'];
  recentArticles?: Array<{ id: string; title: string; slug: string; createdAt: string }>;
  toc?: TOCItem[];
}) {
  const content = config.leftSidebarContent as string;
  const opacity = opacityMap[config.sidebarOpacity as string] || opacityMap.light;

  if (content === 'hidden') return null;

  return (
    <aside className={`${opacity} transition-opacity duration-300`}>
      {/* 文章目录 - 在文章详情页会显示目录 */}
      {content === 'toc' && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <h3 className="font-medium uppercase tracking-wider mb-4">目录</h3>
          {toc && toc.length > 0 ? (
            <TableOfContents toc={toc} />
          ) : (
            <p className="text-xs opacity-60">文章详情页显示目录</p>
          )}
        </div>
      )}

      {/* 侧边栏内容（搜索+标签） */}
      {content === 'sidebar' && (
        <>
          {/* 搜索框 */}
          <div className="mb-8">
            <h3 className="text-xs font-medium uppercase tracking-wider mb-4 text-gray-500 dark:text-gray-400">
              搜索
            </h3>
            <InlineSearchBox />
          </div>

          {/* 标签云 */}
          {tags && tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-medium uppercase tracking-wider mb-4 text-gray-500 dark:text-gray-400">
                标签
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 15).map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tag/${tag.slug}`}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Hash size={10} />
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 最近文章 */}
          {recentArticles && recentArticles.length > 0 && (
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider mb-4 text-gray-500 dark:text-gray-400">
                最近文章
              </h3>
              <ul className="space-y-3">
                {recentArticles.slice(0, 5).map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/article/${article.slug}`}
                      className="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors line-clamp-2"
                    >
                      {article.title}
                    </Link>
                    <time className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(article.createdAt).split(' ')[0]}
                    </time>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* 小部件区域 */}
      {content === 'widgets' && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <h3 className="font-medium uppercase tracking-wider mb-4">小部件</h3>
        </div>
      )}

      {/* 自定义HTML */}
      {config.leftSidebarCustomHtml && (
        <div className="mt-6">
          <CustomHtmlBlock html={config.leftSidebarCustomHtml as string} />
        </div>
      )}
    </aside>
  );
}

// ============ 右侧栏组件 ============
function RightSidebar({
  config,
  colors,
  tags,
  recentArticles,
  toc,
}: { 
  config: ThemeConfig; 
  colors: typeof colorSchemes['light-gray'];
  tags?: TagListProps['tags'];
  recentArticles?: Array<{ id: string; title: string; slug: string; createdAt: string }>;
  toc?: TOCItem[];
}) {
  const content = config.rightSidebarContent as string;
  const opacity = opacityMap[config.sidebarOpacity as string] || opacityMap.light;

  if (content === 'hidden') return null;

  // 目录（文章详情页会显示目录）
  if (content === 'toc') {
    return (
      <aside className={`${opacity} transition-opacity duration-300`}>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <h3 className="font-medium uppercase tracking-wider mb-4">目录</h3>
          {toc && toc.length > 0 ? (
            <TableOfContents toc={toc} />
          ) : (
            <p className="text-xs opacity-60">文章详情页显示目录</p>
          )}
        </div>
        {/* 自定义HTML代码块 */}
        {config.rightSidebarCustomHtml && (
          <div className="mt-8">
            <CustomHtmlBlock html={config.rightSidebarCustomHtml as string} />
          </div>
        )}
      </aside>
    );
  }

  return (
    <aside className={`${opacity} transition-opacity duration-300`}>
      {/* 搜索框 */}
      {(content === 'search-tags' || content === 'full') && (
        <div className="mb-8">
          <h3 className="text-xs font-medium uppercase tracking-wider mb-4 text-gray-500 dark:text-gray-400">
            搜索
          </h3>
          <InlineSearchBox />
        </div>
      )}

      {/* 标签云 */}
      {(content === 'search-tags' || content === 'full') && tags && tags.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-medium uppercase tracking-wider mb-4 text-gray-500 dark:text-gray-400">
            标签
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 15).map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Hash size={10} />
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 最近文章 */}
      {(content === 'recent' || content === 'full') && recentArticles && recentArticles.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-medium uppercase tracking-wider mb-4 text-gray-500 dark:text-gray-400">
            最近文章
          </h3>
          <ul className="space-y-3">
            {recentArticles.slice(0, 5).map((article) => (
              <li key={article.id}>
                <Link
                  href={`/article/${article.slug}`}
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors line-clamp-2"
                >
                  {article.title}
                </Link>
                <time className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(article.createdAt).split(' ')[0]}
                </time>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 自定义HTML代码块 */}
      {config.rightSidebarCustomHtml && (
        <div className="mt-8">
          <CustomHtmlBlock html={config.rightSidebarCustomHtml as string} />
        </div>
      )}
    </aside>
  );
}

// ============ 阅读进度条 ============
function ReadingProgress({ color }: { color: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, scrollPercent));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-0.5 z-[100]">
      <div
        className="h-full transition-all duration-150"
        style={{ width: `${progress}%`, backgroundColor: color }}
      />
    </div>
  );
}


// ============ 核心布局组件 ============
function BlogLayout({ children, config = defaultConfig }: { children: ReactNode; config?: ThemeConfig }) {
  const { settings, navMenu } = useSiteSettingsContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const colors = colorSchemes[config.colorScheme as string] || colorSchemes['light-gray'];
  const sidebarWidth = sidebarWidthMap[config.sidebarWidth as string] || sidebarWidthMap.medium;
  const layoutWidth = layoutWidthMap[config.layoutWidth as string] || layoutWidthMap.standard;
  const headerStyle = (config.headerStyle as string) || 'standard';
  const siteName = settings.siteName || 'Blog';
  const siteLogo = settings.siteLogo;
  const customFooter = config.footerText as string;
  const footerText = customFooter || settings.footerText?.replace('{year}', new Date().getFullYear().toString()) || `© ${new Date().getFullYear()} ${siteName}`;

  const leftContent = (config.leftSidebarContent as string) || 'toc';
  const rightContent = (config.rightSidebarContent as string) || 'full';
  const showLeftSidebar = leftContent !== 'hidden';
  const showRightSidebar = rightContent !== 'hidden';

  // 从配置中获取标签和最近文章数据
  const tags = (config._tags as any[]) || [];
  const recentArticles = (config._recentArticles as any[]) || [];

  // 自定义代码
  const customHeadCode = config.customHeadCode as string;
  const customBodyStartCode = config.customBodyStartCode as string;
  const customBodyEndCode = config.customBodyEndCode as string;

  // 注入head代码（使用共享hook）
  useHeadCodeInjector(customHeadCode);

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.bgDark} ${colors.text} ${colors.textDark} transition-colors duration-300`}>
      {/* 页面顶部自定义代码 */}
      {customBodyStartCode && (
        <CustomHtmlBlock html={customBodyStartCode} />
      )}
      {/* 顶部导航 */}
      {headerStyle !== 'hidden' && (
        <header className={`sticky top-0 z-50 ${colors.mainBg} ${colors.mainBgDark} border-b ${colors.border} ${colors.borderDark}`}>
          <div className={`${layoutWidth} mx-auto px-4 sm:px-6`}>
            <div className="flex items-center justify-between h-14">
              <Link href="/" className="flex items-center gap-2 font-medium text-lg tracking-tight">
                {siteLogo && <img src={siteLogo} alt={siteName} className="h-7 w-auto" />}
                {siteName}
              </Link>

              {headerStyle === 'standard' && (
                <DesktopNavMenu
                  items={navMenu}
                  itemClassName="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2"
                />
              )}

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded text-gray-600 dark:text-gray-400"
                  aria-label="菜单"
                >
                  {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </div>
          </div>
          {/* 移动端菜单 */}
          {mobileMenuOpen && (
            <MobileNavMenu items={navMenu} onClose={() => setMobileMenuOpen(false)} />
          )}
        </header>
      )}

      {/* 三栏布局 */}
      <div className={`${layoutWidth} mx-auto px-4 sm:px-6 py-8 lg:py-12`}>
        <div className="flex gap-8 lg:gap-12">
          {/* 左侧栏 */}
          {showLeftSidebar && (
            <div className={`hidden lg:block ${sidebarWidth} shrink-0`}>
              <div className="sticky top-20">
                <LeftSidebar config={config} colors={colors} tags={tags} recentArticles={recentArticles} />
              </div>
            </div>
          )}

          {/* 主内容区 */}
          <main className={`flex-1 min-w-0 ${colors.mainBg} ${colors.mainBgDark} rounded-lg`}>
            <div className="p-6 lg:p-8">
              {children}
            </div>
          </main>

          {/* 右侧栏 */}
          {showRightSidebar && (
            <div className={`hidden lg:block ${sidebarWidth} shrink-0`}>
              <div className="sticky top-20">
                <RightSidebar config={config} colors={colors} tags={tags} recentArticles={recentArticles} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 页脚 */}
      <footer className={`py-8 border-t ${colors.border} ${colors.borderDark}`}>
        <div className={`${layoutWidth} mx-auto px-4 sm:px-6 text-center`}>
          <p className={`text-sm ${colors.textMuted} ${colors.textMutedDark}`}>
            {footerText}
          </p>
        </div>
      </footer>

      {/* 页面底部自定义代码 */}
      {customBodyEndCode && (
        <CustomHtmlBlock html={customBodyEndCode} />
      )}
    </div>
  );
}

// ============ 文章卡片 ============
function ArticleCard({ article, config = defaultConfig }: ArticleCardProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme as string] || colorSchemes['light-gray'];
  const listStyle = config.articleListStyle as string;
  const showFeaturedImage = config.showFeaturedImage === true;
  const excerptLength = (config.excerptLength as number) || 100;
  const showViewCount = config.showViewCount !== false;
  const showReadingTime = config.showReadingTime !== false;

  const readingTime = calculateReadingTime(article.content);

  // 极简风格
  if (listStyle === 'minimal') {
    return (
      <article className={`py-3 border-b ${colors.border} ${colors.borderDark} last:border-b-0`}>
        <Link href={`/article/${article.slug}`} className="group">
          <h2 className={`font-medium ${colors.text} ${colors.textDark} group-hover:underline underline-offset-4`}>
            {article.title}
          </h2>
        </Link>
      </article>
    );
  }

  // 紧凑风格
  if (listStyle === 'compact') {
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

  // 标准风格
  return (
    <article className={`py-6 border-b ${colors.border} ${colors.borderDark} last:border-b-0`}>
      <div className={showFeaturedImage && article.featuredImage ? 'md:flex md:gap-5' : ''}>
        {showFeaturedImage && article.featuredImage && (
          <div className="md:w-40 md:shrink-0 mb-3 md:mb-0">
            <Link href={`/article/${article.slug}`}>
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-24 md:h-full object-cover rounded"
              />
            </Link>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Link href={`/article/${article.slug}`} className="group">
            <h2 className={`text-lg font-medium mb-2 ${colors.text} ${colors.textDark} group-hover:underline underline-offset-4`}>
              {article.title}
            </h2>
          </Link>
          <p className={`text-sm mb-3 leading-relaxed ${colors.textMuted} ${colors.textMutedDark} line-clamp-2`}>
            {truncate(article.excerpt || article.content, excerptLength)}
          </p>
          <div className={`flex flex-wrap items-center gap-3 text-xs ${colors.textMuted} ${colors.textMutedDark}`}>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(article.publishedAt || article.createdAt).split(' ')[0]}
            </span>
            {showReadingTime && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {readingTime} 分钟
              </span>
            )}
            {showViewCount && (article.viewCount || 0) > 0 && (
              <span className="flex items-center gap-1">
                <Eye size={12} />
                {article.viewCount}
              </span>
            )}
            {article.category && (
              <Link
                href={`/category/${article.category.id}`}
                className="flex items-center gap-1 hover:underline"
              >
                <Folder size={12} />
                {article.category.name}
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}


// ============ 文章详情 ============
function ArticleDetail({ article, config = defaultConfig }: ArticleDetailProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme as string] || colorSchemes['light-gray'];
  const fontSize = fontSizeMap[config.fontSize as string] || fontSizeMap.medium;
  const lineHeight = lineHeightMap[config.lineHeight as string] || lineHeightMap.comfortable;
  const showReadingProgress = config.showReadingProgress !== false;
  const showReadingTime = config.showReadingTime !== false;
  const showViewCount = config.showViewCount !== false;
  const sidebarWidth = sidebarWidthMap[config.sidebarWidth as string] || sidebarWidthMap.medium;
  const leftContent = (config.leftSidebarContent as string) || 'toc';
  const rightContent = (config.rightSidebarContent as string) || 'full';

  const readingTime = calculateReadingTime(article.content);
  
  // 从配置中获取TOC（由article-client传入）
  const toc = (config._articleToc as TOCItem[]) || [];
  
  // 判断TOC应该显示在哪一侧
  // 如果左侧配置为 toc，则显示在左侧
  // 如果右侧配置为 toc，则显示在右侧
  // 如果两侧都不是 toc，则自动放在侧边栏的对面：
  //   - 如果左侧有内容（不是hidden），TOC放右侧
  //   - 如果右侧有内容（不是hidden），TOC放左侧
  //   - 默认放右侧
  let showTocInLeft = false;
  let showTocInRight = false;
  
  if (toc.length > 0) {
    if (leftContent === 'toc') {
      showTocInLeft = true;
    } else if (rightContent === 'toc') {
      showTocInRight = true;
    } else {
      // 自动决定 TOC 位置：放在侧边栏内容的对面
      const hasLeftSidebar = leftContent !== 'hidden';
      const hasRightSidebar = rightContent !== 'hidden';
      
      if (hasLeftSidebar && !hasRightSidebar) {
        // 左侧有内容，TOC放右侧
        showTocInRight = true;
      } else if (!hasLeftSidebar && hasRightSidebar) {
        // 右侧有内容，TOC放左侧
        showTocInLeft = true;
      } else {
        // 两侧都有或都没有，默认放右侧
        showTocInRight = true;
      }
    }
  }

  return (
    <div className="relative">
      {showReadingProgress && <ReadingProgress color={colors.accent} />}
      
      {/* 桌面端：使用flex布局显示TOC */}
      <div className="flex gap-8">
        {/* 左侧TOC */}
        {showTocInLeft && (
          <aside className={`hidden lg:block ${sidebarWidth} shrink-0`}>
            <div className="sticky top-20">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <h3 className="font-medium uppercase tracking-wider mb-4">目录</h3>
                <TableOfContents toc={toc} />
              </div>
            </div>
          </aside>
        )}
        
        {/* 文章主体 */}
        <article className="flex-1 min-w-0 animate-in fade-in duration-500">
          {/* 文章头部 */}
          <header className="mb-8 pb-6 border-b border-inherit">
            {article.category && (
              <Link
                href={`/category/${article.category.id}`}
                className={`inline-block text-xs uppercase tracking-wider mb-3 ${colors.textMuted} ${colors.textMutedDark} hover:underline`}
              >
                {article.category.name}
              </Link>
            )}

            <h1 className={`text-2xl md:text-3xl font-bold leading-tight mb-4 ${colors.text} ${colors.textDark}`}>
              {article.title}
            </h1>

            <div className={`flex flex-wrap items-center gap-4 text-sm ${colors.textMuted} ${colors.textMutedDark}`}>
              {article.author && (
                <span>{article.author.username}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(article.publishedAt || article.createdAt)}
              </span>
              {showReadingTime && (
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {readingTime} 分钟阅读
                </span>
              )}
              {showViewCount && (article.viewCount || 0) > 0 && (
                <span className="flex items-center gap-1">
                  <Eye size={14} />
                  {article.viewCount}
                </span>
              )}
            </div>
          </header>

          {/* 特色图片 */}
          {article.featuredImage && (
            <div className="mb-8">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* 正文 */}
          <div
            className={`
              prose prose-slate dark:prose-invert max-w-none
              ${fontSize} ${lineHeight}
              prose-headings:font-semibold
              prose-a:underline prose-a:underline-offset-4
              prose-blockquote:border-l-2 prose-blockquote:not-italic
              prose-code:text-sm prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:bg-gray-100 dark:prose-code:bg-gray-800
              prose-pre:rounded-lg prose-pre:bg-[#1a1a1a]
              prose-img:rounded-lg
            `}
            style={{ '--tw-prose-links': colors.accent } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: article.htmlContent || article.content }}
          />

          {/* 标签 */}
          {article.tags && article.tags.length > 0 && (
            <div className={`flex flex-wrap gap-2 mt-10 pt-6 border-t ${colors.border} ${colors.borderDark}`}>
              <Tag size={14} className={`${colors.textMuted} ${colors.textMutedDark}`} />
              {article.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.id}`}
                  className={`text-sm px-3 py-1 rounded-full border ${colors.border} ${colors.borderDark} ${colors.textMuted} ${colors.textMutedDark} hover:text-gray-900 dark:hover:text-white transition-colors`}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* 返回 */}
          <nav className={`mt-8 pt-6 border-t ${colors.border} ${colors.borderDark}`}>
            <Link
              href="/"
              className={`inline-flex items-center gap-2 text-sm ${colors.textMuted} ${colors.textMutedDark} hover:text-gray-900 dark:hover:text-white transition-colors`}
            >
              <ArrowLeft size={14} />
              返回首页
            </Link>
          </nav>
        </article>
        
        {/* 右侧TOC */}
        {showTocInRight && (
          <aside className={`hidden lg:block ${sidebarWidth} shrink-0`}>
            <div className="sticky top-20">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <h3 className="font-medium uppercase tracking-wider mb-4">目录</h3>
                <TableOfContents toc={toc} />
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// ============ 分类列表 ============
function CategoryList({ categories, config = defaultConfig }: CategoryListProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme as string] || colorSchemes['light-gray'];

  const flatCategories: { category: CategoryListProps['categories'][0]; depth: number }[] = [];
  const flatten = (cats: CategoryListProps['categories'], depth = 0) => {
    cats.forEach((cat) => {
      flatCategories.push({ category: cat, depth });
      if (cat.children) flatten(cat.children as CategoryListProps['categories'], depth + 1);
    });
  };
  flatten(categories);

  return (
    <div>
      <h1 className={`text-2xl font-bold mb-6 ${colors.text} ${colors.textDark}`}>
        分类
      </h1>
      <div className={`divide-y ${colors.border} ${colors.borderDark}`}>
        {flatCategories.map(({ category, depth }) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="flex items-center justify-between py-3 hover:text-gray-900 dark:hover:text-white transition-colors"
            style={{ paddingLeft: depth * 20 }}
          >
            <div className="flex items-center gap-2">
              {depth > 0 && <ChevronRight size={12} className={colors.textMuted} />}
              <Folder size={14} className={colors.textMuted} />
              <span className={`${colors.text} ${colors.textDark}`}>{category.name}</span>
            </div>
            <span className={`text-sm ${colors.textMuted} ${colors.textMutedDark}`}>
              {category._count?.articles || 0}
            </span>
          </Link>
        ))}
      </div>
      {flatCategories.length === 0 && (
        <p className={`text-center py-8 ${colors.textMuted} ${colors.textMutedDark}`}>
          暂无分类
        </p>
      )}
    </div>
  );
}

// ============ 标签列表 ============
function TagList({ tags, config = defaultConfig }: TagListProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme as string] || colorSchemes['light-gray'];

  return (
    <div>
      <h1 className={`text-2xl font-bold mb-6 ${colors.text} ${colors.textDark}`}>
        标签
      </h1>
      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tag/${tag.slug}`}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${colors.border} ${colors.borderDark} ${colors.textMuted} ${colors.textMutedDark} hover:text-gray-900 dark:hover:text-white transition-colors`}
          >
            <Hash size={14} />
            {tag.name}
            <span className="text-xs opacity-60">({tag._count?.articles || 0})</span>
          </Link>
        ))}
      </div>
      {tags.length === 0 && (
        <p className={`text-center py-8 ${colors.textMuted} ${colors.textMutedDark}`}>
          暂无标签
        </p>
      )}
    </div>
  );
}

// ============ 搜索结果 ============
function SearchResults({ articles, total, query, config = defaultConfig }: SearchResultProps & { config?: ThemeConfig }) {
  const colors = colorSchemes[config.colorScheme as string] || colorSchemes['light-gray'];

  if (!query) return null;

  return (
    <div>
      <h1 className={`text-2xl font-bold mb-2 ${colors.text} ${colors.textDark}`}>
        搜索结果
      </h1>
      <p className={`mb-6 ${colors.textMuted} ${colors.textMutedDark}`}>
        找到 {total} 篇关于 "{query}" 的文章
      </p>
      <div>
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={{ ...article, featuredImage: null, category: null, viewCount: 0 }}
            config={{ ...config, articleListStyle: 'compact' }}
          />
        ))}
      </div>
      {articles.length === 0 && (
        <p className={`text-center py-8 ${colors.textMuted} ${colors.textMutedDark}`}>
          未找到相关文章
        </p>
      )}
    </div>
  );
}

// ============ 导出主题 ============
export const ClarityFocusTheme: ThemeComponents = {
  name: 'clarity-focus',
  displayName: '清晰聚焦',
  description: '三栏结构博客主题，视觉重心集中在中间，结构清楚但注意力始终留在内容本身',
  configOptions,
  defaultConfig,
  BlogLayout,
  ArticleCard,
  ArticleDetail,
  CategoryList,
  TagList,
  SearchResults,
};
