import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardContent } from '../../components/ui';
import { useBlogThemeStore } from '../../stores/blog-theme.store';
import { getTheme } from '../../themes';

interface ArticleWithHtml {
  id: string;
  title: string;
  slug: string;
  content: string;
  htmlContent?: string;
  toc?: { id: string; text: string; level: number }[];
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
  const theme = getTheme(currentTheme);
  const { BlogLayout, ArticleDetail } = theme;
  const config = getConfig();

  useEffect(() => {
    fetchActiveTheme();
  }, [fetchActiveTheme]);

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

  // 使用后端返回的目录，如果没有则从内容提取
  const toc = article.toc || extractTOC(article.content);

  // 使用后端渲染的 HTML，如果没有则前端渲染
  const htmlContent = article.htmlContent || renderMarkdown(article.content);

  return (
    <BlogLayout config={config}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏 - 目录（左侧） */}
          {toc.length > 0 && (
            <aside className="hidden lg:block lg:order-first">
              <Card className="sticky top-20">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">目录</h3>
                  <nav className="space-y-2 text-sm max-h-[70vh] overflow-y-auto">
                    {toc.map((item, index) => (
                      <a
                        key={index}
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const element = document.getElementById(item.id);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            window.history.pushState(null, '', `#${item.id}`);
                          }
                        }}
                        className="block text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
                        style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </aside>
          )}

          {/* 文章内容 - 使用主题组件 */}
          <div className={toc.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <ArticleDetail article={{ ...article, htmlContent }} config={config} />
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
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const toc: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = generateSlugId(text);
    toc.push({ id, text, level });
  }

  return toc;
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
