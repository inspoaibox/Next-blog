'use client';

import Link from 'next/link';

interface KnowledgeDocClientProps {
  doc: {
    id: string;
    title: string;
    slug: string;
    content: string;
    htmlContent?: string;
  };
}

export function KnowledgeDocClient({ doc }: KnowledgeDocClientProps) {
  return (
    <div>
      <div className="mb-4">
        <Link href="/knowledge" className="text-primary-600 hover:underline">
          ← 返回知识库
        </Link>
      </div>

      <article className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-6">{doc.title}</h1>
        
        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: doc.htmlContent || doc.content }}
        />
      </article>
    </div>
  );
}
