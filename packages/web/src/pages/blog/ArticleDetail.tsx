import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardContent } from '../../components/ui';
import { useBlogThemeStore } from '../../stores/blog-theme.store';
import { useSiteSettingsStore } from '../../stores/site-settings.store';
import { getTheme } from '../../themes';
import { CommentSection } from '../../components/CommentSection';

interface ArticleWithHtml {
  id: string;
  title: string;
  slug: string;
  content: string;
  htmlContent?: string;
  toc?: TOCItem[];
  publishedAt?: string | null;
  createdAt: string;
  category?: { id: string; name: string } | null;
  tags?: { id: string; name: string }[];
  author?: { username: string } | null;
  viewCount?: number;
}

export function ArticleDetailPage() {
  const { slug } = useParams();
  const { currentTheme, fetchActiveTheme, getConfig } = useBlogThemeStore();
  const { fetchSettings, isCommentEnabled } = useSiteSettingsStore();
  const theme = getTheme(currentTheme);
  const { BlogLayout, ArticleDetail } = theme;
  const config = getConfig();
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    fetchActiveTheme();
    fetchSettings();
  }, [fetchActiveTheme, fetchSettings]);

  const {
    data: article,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => api.get<ArticleWithHtml>(`/articles/${slug}`),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <BlogLayout>
        <div className="max-w-4xl mx-auto text-center py-12 text-gray-500">加载中...</div>
      </BlogLayout>
    );
  }

  if (error || !article) {
    return (
      <BlogLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">文章不存在</h1>
          <Link to="/" className="text-primary-600 hover:underline">
            返回首页
          </Link>
        </div>
      </BlogLayout>
    );
  }

  // 使用后端返回的目录（已经是层级结构），如果没有则从内容提取并构建层级
  const toc = article.toc && article.toc.length > 0 
    ? article.toc 
    : buildTocTree(extractTOC(article.content));

  // 使用后端渲染的 HTML，如果没有则前端渲染
  const htmlContent = article.htmlContent || renderMarkdown(article.content);

  // 递归渲染目录项
  const renderTocItems = (items: TOCItem[], depth: number = 0) => (
    <ul className={depth > 0 ? 'ml-3 mt-1 space-y-1' : 'space-y-2'}>
      {items.map((item, index) => (
        <li key={index}>
          <a
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              setTocOpen(false);
              const element = document.getElementById(item.id);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                window.history.pushState(null, '', `#${item.id}`);
              }
            }}
            className="block text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
          >
            {item.text}
          </a>
          {item.children && item.children.length > 0 && renderTocItems(item.children, depth + 1)}
        </li>
      ))}
    </ul>
  );

  return (
    <BlogLayout config={config}>
      <div className="max-w-6xl mx-auto">
        {/* Mobile TOC Toggle */}
        {toc.length > 0 && (
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setTocOpen(!tocOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <span className="font-medium">目录</span>
              <svg
                className={`w-5 h-5 transition-transform ${tocOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {tocOpen && (
              <nav className="mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">
                {renderTocItems(toc)}
              </nav>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* 侧边栏 - 目录（左侧，仅桌面端） */}
          {toc.length > 0 && (
            <aside className="hidden lg:block lg:order-first lg:col-span-1">
              <Card className="sticky top-20">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">目录</h3>
                  <nav className="text-sm max-h-[70vh] overflow-y-auto min-w-[180px]">
                    {renderTocItems(toc)}
                  </nav>
                </CardContent>
              </Card>
            </aside>
          )}

          {/* 文章内容 - 使用主题组件 */}
          <div className={toc.length > 0 ? 'lg:col-span-4' : 'lg:col-span-5'}>
            <ArticleDetail article={{ ...article, htmlContent }} config={config} />
            
            {/* 评论区 */}
            {isCommentEnabled() && (
              <CommentSection articleId={article.id} />
            )}
          </div>
        </div>
      </div>
    </BlogLayout>
  );
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
  children?: TOCItem[];
}

// 生成 slug ID（与后端保持一致）
function generateSlugId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractTOC(content: string): TOCItem[] {
  // 先移除代码块，避免匹配代码块内的 #
  const contentWithoutCode = content.replace(/```[\s\S]*?```/g, '');
  
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const flatToc: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(contentWithoutCode)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = generateSlugId(text);
    flatToc.push({ id, text, level });
  }

  return flatToc;
}

// 将扁平 TOC 转换为层级结构
function buildTocTree(flatToc: TOCItem[]): TOCItem[] {
  const result: TOCItem[] = [];
  const stack: TOCItem[] = [];

  for (const item of flatToc) {
    const newItem: TOCItem = { ...item, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      result.push(newItem);
    } else {
      if (!stack[stack.length - 1].children) {
        stack[stack.length - 1].children = [];
      }
      stack[stack.length - 1].children!.push(newItem);
    }
    stack.push(newItem);
  }

  return result;
}

// 前端备用渲染（当后端没有返回 htmlContent 时使用）
function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.+)$/gim, (_, text) => `<h3 id="${generateSlugId(text)}">${text}</h3>`)
    .replace(/^## (.+)$/gim, (_, text) => `<h2 id="${generateSlugId(text)}">${text}</h2>`)
    .replace(/^# (.+)$/gim, (_, text) => `<h1 id="${generateSlugId(text)}">${text}</h1>`)
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/```(\w*)\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/\n/gim, '<br />');
}
