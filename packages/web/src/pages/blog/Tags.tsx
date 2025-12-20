import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Tag } from '../../types';
import { Badge, Card, CardContent } from '../../components/ui';
import { BlogLayout } from '../../layouts/BlogLayout';

export function TagsPage() {
  const { data: tags, isLoading } = useQuery({
    queryKey: ['public-tags'],
    queryFn: () => api.get<Tag[]>('/tags'),
  });

  return (
    <BlogLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">标签</h1>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : !tags?.length ? (
          <div className="text-center py-12 text-gray-500">暂无标签</div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <Link key={tag.id} to={`/?tag=${tag.id}`}>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <span className="font-medium">{tag.name}</span>
                      <Badge variant="default">{tag._count?.articles || 0}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </BlogLayout>
  );
}
