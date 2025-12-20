'use client';

import { useState } from 'react';
import Link from 'next/link';

interface KnowledgeDoc {
  id: string;
  title: string;
  slug: string;
  content: string;
  children?: KnowledgeDoc[];
}

interface KnowledgeClientProps {
  docs: KnowledgeDoc[];
}

export function KnowledgeClient({ docs }: KnowledgeClientProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const renderDocTree = (items: KnowledgeDoc[], level = 0) => (
    <ul className={level > 0 ? 'ml-4 mt-2' : 'space-y-2'}>
      {items.map((doc) => {
        const hasChildren = doc.children && doc.children.length > 0;
        const isExpanded = expandedIds.includes(doc.id);

        return (
          <li key={doc.id}>
            <div className="flex items-center gap-2">
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(doc.id)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              {!hasChildren && <span className="w-6" />}
              <Link
                href={`/knowledge/${doc.slug}`}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                {doc.title}
              </Link>
            </div>
            {hasChildren && isExpanded && renderDocTree(doc.children!, level + 1)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">知识库</h1>
      
      {docs.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          {renderDocTree(docs)}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          暂无知识库文档
        </div>
      )}
    </div>
  );
}
