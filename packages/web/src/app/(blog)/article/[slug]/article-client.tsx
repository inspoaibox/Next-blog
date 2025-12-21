'use client';

import { useState } from 'react';
import { useThemeContext } from '@/contexts/theme-context';
import { useSiteSettingsStore } from '@/stores/site-settings.store';
import { Card, CardContent } from '@/components/ui';
import { CommentSection } from '@/components/CommentSection';

interface TOCItem {
  id: string;
  text: string;
  level: number;
  children?: TOCItem[];
}

interface ArticleDetailClientProps {
  article: any;
}

export function ArticleDetailClient({ article }: ArticleDetailClientProps) {
  const { theme, themeConfig } = useThemeContext();
  const { isCommentEnabled } = useSiteSettingsStore();
  const { ArticleDetail } = theme;
  const [tocOpen, setTocOpen] = useState(false);

  // 使用后端返回的目录
  const toc = article.toc && article.toc.length > 0 
    ? article.toc 
    : article.content ? extractTOC(article.content) : [];

  // 递归渲染目录项，根据层级显示不同缩进
  const renderTocItems = (items: TOCItem[], depth: number = 0) => (
    <ul className={depth > 0 ? 'ml-3 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-2' : 'space-y-2'}>
      {items.map((item, index) => (
        <li key={`${item.id}-${index}`}>
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
            className={`block hover:text-primary-600 transition-colors line-clamp-2 ${
              depth === 0 
                ? 'text-gray-800 dark:text-gray-200 font-medium' 
                : 'text-gray-600 dark:text-gray-400 text-sm'
            }`}
            title={item.text}
          >
            {item.text}
          </a>
          {item.children && item.children.length > 0 && renderTocItems(item.children, depth + 1)}
        </li>
      ))}
    </ul>
  );

  return (
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
          <aside className="hidden lg:block lg:order-first lg:col-span-1 min-w-[200px]">
            <Card className="sticky top-20">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 text-sm">目录</h3>
                <nav className="text-sm max-h-[70vh] overflow-y-auto pr-1">
                  {renderTocItems(toc)}
                </nav>
              </CardContent>
            </Card>
          </aside>
        )}

        {/* 文章内容 */}
        <div className={toc.length > 0 ? 'lg:col-span-4' : 'lg:col-span-5'}>
          <ArticleDetail article={article} config={themeConfig} />
          
          {/* 评论区 */}
          {isCommentEnabled() && (
            <CommentSection articleId={article.id} />
          )}
        </div>
      </div>
    </div>
  );
}

// 从内容提取目录
function extractTOC(content: string): TOCItem[] {
  if (!content) return [];
  
  // 移除代码块，避免匹配代码块内的 #
  const contentWithoutCode = content.replace(/```[\s\S]*?```/g, '');
  // 只匹配行首的 #，且 # 后必须有空格
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const flatToc: TOCItem[] = [];
  const idCounter: Record<string, number> = {};
  let match;

  while ((match = headingRegex.exec(contentWithoutCode)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const baseId = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5\s-]/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
    
    // 处理重复 ID，添加计数后缀
    let id = baseId;
    if (idCounter[baseId] !== undefined) {
      idCounter[baseId]++;
      id = `${baseId}-${idCounter[baseId]}`;
    } else {
      idCounter[baseId] = 0;
    }
    
    flatToc.push({ id, text, level });
  }

  return buildTocTree(flatToc);
}

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
      stack[stack.length - 1].children!.push(newItem);
    }
    stack.push(newItem);
  }

  return result;
}
