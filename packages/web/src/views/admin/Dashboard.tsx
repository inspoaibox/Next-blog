import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader } from '../../components/ui';
import { formatDate } from '../../lib/utils';
import type { Article, Comment } from '../../types';

interface Stats {
  totalArticles: number;
  publishedArticles: number;
  totalViews: number;
  totalComments: number;
  pendingComments: number;
  totalCategories: number;
  totalTags: number;
}

export function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get<Stats>('/stats'),
  });

  const { data: recentArticles } = useQuery({
    queryKey: ['recent-articles'],
    queryFn: () => api.get<{ items: Article[] }>('/articles?page=1&limit=5'),
  });

  const { data: recentComments } = useQuery({
    queryKey: ['recent-comments'],
    queryFn: () => api.get<{ items: Comment[] }>('/comments?page=1&limit=5'),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="文章数" value={stats?.totalArticles || 0} icon="📝" />
        <StatCard title="分类数" value={stats?.totalCategories || 0} icon="📁" />
        <StatCard title="标签数" value={stats?.totalTags || 0} icon="🏷️" />
        <StatCard title="评论数" value={stats?.totalComments || 0} icon="💬" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="已发布" value={stats?.publishedArticles || 0} icon="✅" color="green" />
        <StatCard title="总浏览" value={stats?.totalViews || 0} icon="👁️" color="blue" />
        <StatCard title="待审评论" value={stats?.pendingComments || 0} icon="⏳" color="yellow" />
        <StatCard title="草稿" value={(stats?.totalArticles || 0) - (stats?.publishedArticles || 0)} icon="📋" color="gray" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">最近文章</h2>
              <Link href="/admin/articles" className="text-sm text-primary-600 hover:underline">
                查看全部
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!recentArticles?.items?.length ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                暂无文章
              </p>
            ) : (
              <div className="space-y-3">
                {recentArticles.items.map((article) => (
                  <Link
                    key={article.id}
                    href={`/admin/articles/${article.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{article.title}</p>
                      <p className="text-sm text-gray-500">{formatDate(article.createdAt)}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      article.status === 'PUBLISHED' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {article.status === 'PUBLISHED' ? '已发布' : '草稿'}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">最近评论</h2>
              <Link href="/admin/comments" className="text-sm text-primary-600 hover:underline">
                查看全部
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!recentComments?.items?.length ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                暂无评论
              </p>
            ) : (
              <div className="space-y-3">
                {recentComments.items.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{comment.authorName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        comment.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : comment.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {comment.status === 'APPROVED' ? '已批准' : comment.status === 'PENDING' ? '待审核' : '垃圾'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  color = 'default' 
}: { 
  title: string; 
  value: number; 
  icon: string;
  color?: 'default' | 'green' | 'blue' | 'yellow' | 'gray';
}) {
  const colorClasses = {
    default: 'bg-white dark:bg-gray-800',
    green: 'bg-green-50 dark:bg-green-900/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
    gray: 'bg-gray-50 dark:bg-gray-700',
  };

  return (
    <Card className={colorClasses[color]}>
      <CardContent className="flex items-center gap-4">
        <div className="text-3xl">{icon}</div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
