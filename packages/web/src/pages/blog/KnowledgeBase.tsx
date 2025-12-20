import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { KnowledgeDoc } from '../../types';
import { useBlogThemeStore } from '../../stores/blog-theme.store';
import { getTheme } from '../../themes';

export function KnowledgeBasePage() {
  const { currentTheme, fetchActiveTheme } = useBlogThemeStore();
  const theme = getTheme(currentTheme);
  const { BlogLayout } = theme;

  useEffect(() => {
    fetchActiveTheme();
  }, [fetchActiveTheme]);

  const { data: docs, isLoading } = useQuery({
    queryKey: ['public-knowledge'],
    queryFn: () => api.get<KnowledgeDoc[]>('/knowledge'),
  });

  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDoc | null>(null);

  const renderTree = (items: KnowledgeDoc[], level = 0) => {
    return items.map((doc) => (
      <div key={doc.id}>
        <div
          onClick={() => setSelectedDoc(doc)}
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg transition-colors ${
            selectedDoc?.id === doc.id
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          <span className="text-gray-400">{doc.children?.length ? '📁' : '📄'}</span>
          <span className="flex-1 truncate">{doc.title}</span>
        </div>
        {doc.children && doc.children.length > 0 && renderTree(doc.children, level + 1)}
      </div>
    ));
  };

  return (
    <BlogLayout>
      <h1 className="text-2xl font-bold mb-8">📚 知识库</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 文档树 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold">文档目录</h2>
          </div>
          <div className="p-2">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">加载中...</div>
            ) : !docs?.length ? (
              <div className="p-4 text-center text-gray-500">暂无文档</div>
            ) : (
              <div className="space-y-1">{renderTree(docs)}</div>
            )}
          </div>
        </div>

        {/* 文档内容 */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold">{selectedDoc?.title || '选择文档'}</h2>
          </div>
          <div className="p-6">
            {selectedDoc ? (
              <div className="prose dark:prose-invert max-w-none">
                <MarkdownContent content={selectedDoc.content} />
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">从左侧选择一个文档查看内容</div>
            )}
          </div>
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
