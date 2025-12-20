import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Category } from '../../types';
import { Card, CardContent } from '../../components/ui';
import { BlogLayout } from '../../layouts/BlogLayout';

export function CategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['public-categories'],
    queryFn: () => api.get<Category[]>('/categories'),
  });

  return (
    <BlogLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">分类</h1>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : !categories?.length ? (
          <div className="text-center py-12 text-gray-500">暂无分类</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Link key={category.id} to={`/?category=${category.id}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-2">{category.name}</h2>
                    {category.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        {category.description}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      {category._count?.articles || 0} 篇文章
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </BlogLayout>
  );
}
