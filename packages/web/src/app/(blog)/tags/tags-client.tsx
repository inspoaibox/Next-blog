'use client';

import Link from 'next/link';
import { useThemeContext } from '@/contexts/theme-context';

interface TagsClientProps {
  tags: any[];
}

export function TagsClient({ tags }: TagsClientProps) {
  const { theme, themeConfig } = useThemeContext();
  const { TagList } = theme;

  // 如果主题有自定义 TagList 组件，使用它
  if (TagList) {
    return <TagList tags={tags} config={themeConfig} />;
  }

  // 默认标签云
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">标签云</h1>
      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tag/${tag.slug}`}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
          >
            {tag.name}
            {tag._count?.articles !== undefined && (
              <span className="ml-2 text-gray-500">({tag._count.articles})</span>
            )}
          </Link>
        ))}
      </div>

      {tags.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          暂无标签
        </div>
      )}
    </div>
  );
}
