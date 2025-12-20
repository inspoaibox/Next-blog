import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Article } from '../../types';
import { Badge, Card, CardContent } from '../../components/ui';
import { formatDate } from '../../lib/utils';
import { BlogLayout } from '../../layouts/BlogLayout';

export function ArticleDetailPage() {
  const { slug } = useParams();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => api.get<Article>(`/articles/public/${slug}`),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <BlogLayout>
        <div className="max-w-4xl mx-auto text-center py-12 text-gray-500">
          加载中...
        </div>
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

  // 从内容中提取目录
  const toc = extractTOC(article.content);

  return (
    <BlogLayout>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 文章内容 */}
          <article className="lg:col-span-3">
            <header className="mb-8">
              <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                {article.category && (
                  <Link
                    to={`/?category=${article.category.id}`}
                    className="text-primary-600 hover:underline"
                  >
                    {article.category.name}
                  </Link>
                )}
                <span>阅读 {article.viewCount}</span>
              </div>
              
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  {article.tags.map((tag) => (
                    <Link key={tag.id} to={`/?tag=${tag.id}`}>
                      <Badge variant="default">{tag.name}</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </header>

            <div className="prose dark:prose-invert max-w-none">
              <MarkdownContent content={article.content} />
            </div>
          </article>

          {/* 侧边栏 - 目录 */}
          {toc.length > 0 && (
            <aside className="hidden lg:block">
              <Card className="sticky top-4">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">目录</h3>
                  <nav className="space-y-2 text-sm">
                    {toc.map((item, index) => (
                      <a
                        key={index}
                        href={`#${item.id}`}
                        className="block text-gray-600 dark:text-gray-400 hover:text-primary-600"
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

function extractTOC(content: string): TOCItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const toc: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2];
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    toc.push({ id, text, level });
  }

  return toc;
}

function MarkdownContent({ content }: { content: string }) {
  // 简单的 Markdown 渲染
  const html = content
    .replace(/^### (.*$)/gim, '<h3 id="$1">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 id="$1">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 id="$1">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/```(\w*)\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/\n/gim, '<br />');

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
