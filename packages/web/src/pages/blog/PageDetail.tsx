import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Page } from '../../types';
import { BlogLayout } from '../../layouts/BlogLayout';

export function PageDetailPage() {
  const { slug } = useParams();

  const { data: page, isLoading, error } = useQuery({
    queryKey: ['page', slug],
    queryFn: () => api.get<Page>(`/pages/public/${slug}`),
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

  if (error || !page) {
    return (
      <BlogLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">页面不存在</h1>
          <Link to="/" className="text-primary-600 hover:underline">
            返回首页
          </Link>
        </div>
      </BlogLayout>
    );
  }

  return (
    <BlogLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{page.title}</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <MarkdownContent content={page.content} />
        </div>
      </div>
    </BlogLayout>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const html = content
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/\n/gim, '<br />');

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
