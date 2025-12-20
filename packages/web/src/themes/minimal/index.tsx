// 极简主题 - 纯净简约，大量留白，专注阅读
import { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../../components/ThemeToggle';
import { SearchBox } from '../../components/SearchBox';
import { formatDate, truncate } from '../../lib/utils';
import { useSiteSettingsStore, NavMenuItem } from '../../stores/site-settings.store';
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
    key: 'contentWidth',
    label: '内容宽度',
    type: 'select',
    options: [
      { value: 'narrow', label: '窄（阅读优化）' },
      { value: 'medium', label: '中等' },
      { value: 'wide', label: '宽' },
    ],
    default: 'narrow',
    description: '文章内容区域的宽度',
  },
  {
    key: 'showDividers',
    label: '显示分隔线',
    type: 'boolean',
    default: true,
    description: '在文章之间显示分隔线',
  },
  {
    key: 'headerStyle',
    label: '头部样式',
    type: 'select',
    options: [
      { value: 'minimal', label: '极简' },
      { value: 'centered', label: '居中大标题' },
    ],
    default: 'minimal',
    description: '页面头部的显示样式',
  },
  {
    key: 'fontWeight',
    label: '字体粗细',
    type: 'select',
    options: [
      { value: 'light', label: '细体' },
      { value: 'normal', label: '常规' },
    ],
    default: 'light',
    description: '正文字体的粗细',
  },
  {
    key: 'showReadingTime',
    label: '显示阅读时间',
    type: 'boolean',
    default: false,
    description: '在文章卡片显示预计阅读时间',
  },
];

const defaultConfig: ThemeConfig = {
  contentWidth: 'narrow',
  showDividers: true,
  headerStyle: 'minimal',
  fontWeight: 'light',
  showReadingTime: false,
};

// 宽度映射
const widthClasses: Record<string, string> = {
  narrow: 'max-w-xl',
  medium: 'max-w-2xl',
  wide: 'max-w-3xl',
};

// ============ 布局 - 窄宽度居中 ============
function BlogLayout({ children, config = defaultConfig }: { children: ReactNode; config?: ThemeConfig }) {
  const widthClass = widthClasses[config.contentWidth] || widthClasses.narrow;
  const isLargeHeader = config.headerStyle === 'centered';
  const { settings, fetchSettings, getNavMenu } = useSiteSettingsStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const siteName = settings.siteName || 'NextBlog';
  const footerText = settings.footerText?.replace('{year}', new Date().getFullYear().toString()) 
    || `© ${new Date().getFullYear()} ${siteName}`;
  const navMenu = getNavMenu();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      <header className={`${isLargeHeader ? 'py-12 md:py-20' : 'py-10 md:py-16'} px-4`}>
        <div className={`${widthClass} mx-auto text-center`}>
          <Link to="/" className={`${isLargeHeader ? 'text-3xl md:text-5xl' : 'text-2xl md:text-4xl'} font-extralight tracking-[0.2em] uppercase`}>
            {siteName}
          </Link>
          <div className={`w-12 h-px bg-gray-300 dark:bg-gray-700 mx-auto ${isLargeHeader ? 'mt-6 md:mt-8' : 'mt-4 md:mt-6'}`} />
        </div>
      </header>

      <nav className={`${widthClass} mx-auto px-4 mb-8 md:mb-16`}>
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center justify-center gap-4 text-xs tracking-[0.1em] uppercase flex-wrap">
          {navMenu.map((item, index) => (
            <MinimalNavItem key={item.id} item={item} showDot={index > 0} />
          ))}
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <SearchBox />
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <ThemeToggle />
        </div>
        {/* Mobile Nav */}
        <div className="md:hidden flex items-center justify-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-xs tracking-[0.1em] uppercase text-gray-400"
          >
            {mobileMenuOpen ? '关闭' : '菜单'}
          </button>
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <SearchBox />
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <ThemeToggle />
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col items-center gap-3 text-xs tracking-[0.1em] uppercase">
            {navMenu.map((item) => (
              <MinimalMobileNavItem key={item.id} item={item} onClose={() => setMobileMenuOpen(false)} />
            ))}
          </div>
        )}
      </nav>

      <main className={`${widthClass} mx-auto px-4 pb-24`}>{children}</main>

      <footer className="py-16 text-center">
        <div className="w-8 h-px bg-gray-200 dark:bg-gray-800 mx-auto mb-6" />
        <p className="text-xs text-gray-400 tracking-[0.1em] inline-flex items-center gap-2">
          {footerText}
          <a
            href="https://github.com/inspoaibox/Next-blog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 transition-colors"
            aria-label="GitHub"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </a>
        </p>
      </footer>
    </div>
  );
}

// 计算阅读时间
function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').length;
  return Math.ceil(words / wordsPerMinute);
}

// 极简主题桌面端导航项（支持三级下拉）
function MinimalNavItem({ item, showDot }: { item: NavMenuItem; showDot: boolean }) {
  const [open, setOpen] = useState(false);
  const [subOpen, setSubOpen] = useState<string | null>(null);
  const hasChildren = item.children && item.children.length > 0;

  const linkClass = "text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap";

  if (!hasChildren) {
    return (
      <span className="flex items-center gap-4">
        {showDot && <span className="text-gray-300 dark:text-gray-700">·</span>}
        {item.type === 'external' ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {item.label}
          </a>
        ) : (
          <Link to={item.url} className={linkClass}>
            {item.label}
          </Link>
        )}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-4">
      {showDot && <span className="text-gray-300 dark:text-gray-700">·</span>}
      <div 
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => { setOpen(false); setSubOpen(null); }}
      >
        <button className={`${linkClass} flex items-center gap-1`}>
          {item.label}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 py-2 bg-white dark:bg-gray-900 rounded shadow-lg border border-gray-100 dark:border-gray-800 min-w-[140px] z-50 text-left normal-case tracking-normal">
            {item.children!.map((child) => {
              const hasGrandChildren = child.children && child.children.length > 0;
              
              if (hasGrandChildren) {
                return (
                  <div 
                    key={child.id} 
                    className="relative"
                    onMouseEnter={() => setSubOpen(child.id)}
                    onMouseLeave={() => setSubOpen(null)}
                  >
                    <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                      <span>{child.label}</span>
                      <svg className="w-3 h-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {subOpen === child.id && (
                      <div className="absolute left-full top-0 ml-1 py-2 bg-white dark:bg-gray-900 rounded shadow-lg border border-gray-100 dark:border-gray-800 min-w-[140px] z-50">
                        {child.children!.map((grandChild) => (
                          grandChild.type === 'external' ? (
                            <a key={grandChild.id} href={grandChild.url} target="_blank" rel="noopener noreferrer"
                              className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                              {grandChild.label}
                            </a>
                          ) : (
                            <Link key={grandChild.id} to={grandChild.url}
                              className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                              {grandChild.label}
                            </Link>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return child.type === 'external' ? (
                <a key={child.id} href={child.url} target="_blank" rel="noopener noreferrer"
                  className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                  {child.label}
                </a>
              ) : (
                <Link key={child.id} to={child.url}
                  className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </span>
  );
}

// 极简主题移动端导航项（支持三级展开）
function MinimalMobileNavItem({ item, onClose, level = 0 }: { item: NavMenuItem; onClose: () => void; level?: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const indent = level > 0 ? `pl-${level * 4}` : '';

  if (!hasChildren) {
    return item.type === 'external' ? (
      <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={onClose}
        className={`text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ${indent}`}>
        {level > 0 && '└ '}{item.label}
      </a>
    ) : (
      <Link to={item.url} onClick={onClose}
        className={`text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ${indent}`}>
        {level > 0 && '└ '}{item.label}
      </Link>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${indent}`}>
      <button 
        onClick={() => setExpanded(!expanded)}
        className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
      >
        {level > 0 && '└ '}{item.label}
        <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="flex flex-col items-center gap-2 text-[10px]">
          {item.children!.map((child) => (
            <MinimalMobileNavItem key={child.id} item={child} onClose={onClose} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ 文章卡片 - 极简列表 ============
function ArticleCard({ article, config = defaultConfig }: ArticleCardProps & { config?: ThemeConfig }) {
  const fontClass = config.fontWeight === 'light' ? 'font-light' : 'font-normal';
  const showDivider = config.showDividers;

  return (
    <article className={`py-10 ${showDivider ? 'border-b border-gray-100 dark:border-gray-900 last:border-0' : ''}`}>
      <time className="text-xs text-gray-400 tracking-wide uppercase">
        {formatDate(article.publishedAt || article.createdAt)}
        {config.showReadingTime && (
          <span className="ml-3">· {getReadingTime(article.content)} 分钟阅读</span>
        )}
      </time>
      <Link to={`/article/${article.slug}`}>
        <h2 className={`text-xl ${fontClass} mt-3 mb-4 hover:text-gray-500 transition-colors leading-relaxed`}>
          {article.title}
        </h2>
      </Link>
      <p className={`text-gray-500 text-sm leading-loose ${fontClass}`}>
        {truncate(article.excerpt || article.content, 180)}
      </p>
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
        {article.category && (
          <Link to={`/?category=${article.category.id}`} className="hover:text-gray-600 transition-colors">
            {article.category.name}
          </Link>
        )}
        {article.tags?.slice(0, 2).map((tag) => (
          <Link key={tag.id} to={`/?tag=${tag.id}`} className="hover:text-gray-600 transition-colors">
            #{tag.name}
          </Link>
        ))}
      </div>
    </article>
  );
}

// ============ 文章详情 - 居中大标题 ============
function ArticleDetail({ article, config = defaultConfig }: ArticleDetailProps & { config?: ThemeConfig }) {
  const fontClass = config.fontWeight === 'light' ? 'font-light' : 'font-normal';

  return (
    <article>
      <header className="text-center mb-16">
        <time className="text-xs text-gray-400 tracking-[0.15em] uppercase">
          {formatDate(article.publishedAt || article.createdAt)}
          {config.showReadingTime && (
            <span className="ml-3">· {getReadingTime(article.content)} 分钟阅读</span>
          )}
        </time>
        <h1 className="text-3xl font-extralight mt-6 mb-8 leading-relaxed">{article.title}</h1>
        <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
          {article.author && <span>{article.author.username}</span>}
          {article.category && (
            <Link to={`/?category=${article.category.id}`} className="hover:text-gray-600">{article.category.name}</Link>
          )}
          <span>{article.viewCount || 0} 阅读</span>
        </div>
        <div className="w-16 h-px bg-gray-200 dark:bg-gray-800 mx-auto mt-8" />
      </header>

      <div className={`prose prose-sm dark:prose-invert max-w-none 
        prose-headings:${fontClass} prose-headings:tracking-wide
        prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-p:leading-loose prose-p:${fontClass}
        prose-a:text-gray-900 dark:prose-a:text-gray-100 prose-a:no-underline prose-a:border-b prose-a:border-gray-300`}
        dangerouslySetInnerHTML={{ __html: article.htmlContent || article.content }} />

      {article.tags && article.tags.length > 0 && (
        <footer className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-900">
          <div className="flex flex-wrap justify-center gap-4">
            {article.tags.map((tag) => (
              <Link key={tag.id} to={`/?tag=${tag.id}`} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                #{tag.name}
              </Link>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
}

// ============ 分类列表 - 简洁列表 ============
function CategoryList({ categories, config = defaultConfig }: CategoryListProps & { config?: ThemeConfig }) {
  const fontClass = config.fontWeight === 'light' ? 'font-light' : 'font-normal';

  const renderCategory = (category: any, isChild = false) => (
    <Link
      key={category.id}
      to={`/?category=${category.id}`}
      className={`flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-900 hover:text-gray-500 transition-colors group ${isChild ? 'pl-6' : ''}`}
    >
      <span className={fontClass}>
        {isChild && <span className="text-gray-300 mr-2">└</span>}
        {category.name}
      </span>
      <span className="text-xs text-gray-400 group-hover:text-gray-600">{category._count?.articles || 0}</span>
    </Link>
  );

  return (
    <div>
      <h1 className="text-2xl font-extralight tracking-wide text-center mb-12">分类</h1>
      <div className="space-y-0">
        {categories.map((category) => (
          <div key={category.id}>
            {renderCategory(category)}
            {category.children?.map((child: any) => renderCategory(child, true))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ 标签列表 - 简洁标签 ============
function TagList({ tags }: TagListProps & { config?: ThemeConfig }) {
  return (
    <div>
      <h1 className="text-2xl font-extralight tracking-wide text-center mb-12">标签</h1>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
        {tags.map((tag) => (
          <Link key={tag.id} to={`/?tag=${tag.id}`}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
            #{tag.name}
            <span className="text-xs ml-1 text-gray-300">({tag._count?.articles || 0})</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ============ 搜索结果 - 简洁列表 ============
function SearchResults({ articles, total, query, config = defaultConfig }: SearchResultProps & { config?: ThemeConfig }) {
  const fontClass = config.fontWeight === 'light' ? 'font-light' : 'font-normal';
  const showDivider = config.showDividers;

  if (!query) return null;
  return (
    <div>
      <p className="text-center text-gray-400 text-sm mb-12">
        找到 {total} 篇关于 "{query}" 的文章
      </p>
      <div className="space-y-8">
        {articles.map((article) => (
          <div key={article.id} className={`py-6 ${showDivider ? 'border-b border-gray-100 dark:border-gray-900' : ''}`}>
            <Link to={`/article/${article.slug}`}>
              <h2 className={`${fontClass} text-lg hover:text-gray-500 transition-colors`}>{article.title}</h2>
            </Link>
            <p className={`text-gray-500 text-sm mt-2 ${fontClass} leading-relaxed`}>
              {truncate(article.excerpt || article.content, 120)}
            </p>
            <time className="text-xs text-gray-400 mt-3 block">
              {formatDate(article.publishedAt || article.createdAt)}
            </time>
          </div>
        ))}
      </div>
    </div>
  );
}

export const MinimalTheme: ThemeComponents = {
  name: 'minimal',
  displayName: '极简主题',
  description: '纯净简约，大量留白，专注阅读体验',
  configOptions,
  defaultConfig,
  BlogLayout,
  ArticleCard,
  ArticleDetail,
  CategoryList,
  TagList,
  SearchResults,
};
