import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { KnowledgeDoc } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui';
import { BlogLayout } from '../../layouts/BlogLayout';

export function KnowledgeBasePage() {
  const { data: docs, isLoading } = useQuery({
    queryKey: ['public-knowledge'],
    queryFn: () => api.get<KnowledgeDoc[]>('/knowledge/public'),
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">知识库</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 文档树 */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <h2 className="font-semibold">文档目录</h2>
            </CardHeader>
            <CardContent className="p-2">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">加载中...</div>
              ) : !docs?.length ? (
                <div className="p-4 text-center text-gray-500">暂无文档</div>
              ) : (
                <div className="space-y-1">{renderTree(docs)}</div>
              )}
            </CardContent>
          </Card>

          {/* 文档内容 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="font-semibold">{selectedDoc?.title || '选择文档'}</h2>
            </CardHeader>
            <CardContent>
              {selectedDoc ? (
                <div className="prose dark:prose-invert max-w-none">
                  <MarkdownContent content={selectedDoc.content} />
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  从左侧选择一个文档查看内容
                </div>
              )}
            </CardContent>
          </Card>
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
