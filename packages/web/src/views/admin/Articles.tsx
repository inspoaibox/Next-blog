import { useState } from 'react';
import Link from 'next/link';
import { useArticles, useDeleteArticle, usePublishArticle } from '../../hooks/useArticles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
} from '../../components/ui';
import { formatDate } from '../../lib/utils';

export function ArticlesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'trash'>('all');
  const queryClient = useQueryClient();

  const effectiveStatus = activeTab === 'trash' ? 'TRASHED' : status;
  const { data, isLoading } = useArticles({ page, pageSize: 10, search, status: effectiveStatus });
  const deleteArticle = useDeleteArticle();
  const publishArticle = usePublishArticle();

  const restoreArticle = useMutation({
    mutationFn: (id: string) => api.post(`/articles/${id}/restore`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['articles'] }),
  });

  const permanentDeleteArticle = useMutation({
    mutationFn: (id: string) => api.delete(`/articles/${id}/permanent`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['articles'] }),
  });

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这篇文章吗？')) {
      await deleteArticle.mutateAsync(id);
    }
  };

  const handleRestore = async (id: string) => {
    await restoreArticle.mutateAsync(id);
  };

  const handlePermanentDelete = async (id: string) => {
    if (confirm('确定要永久删除这篇文章吗？此操作不可恢复！')) {
      await permanentDeleteArticle.mutateAsync(id);
    }
  };

  const handlePublish = async (id: string) => {
    await publishArticle.mutateAsync(id);
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      DRAFT: 'default',
      PUBLISHED: 'success',
      SCHEDULED: 'warning',
      TRASHED: 'danger',
    };
    const labels: Record<string, string> = {
      DRAFT: '草稿',
      PUBLISHED: '已发布',
      SCHEDULED: '定时',
      TRASHED: '回收站',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">文章管理</h1>
        <Link href="/admin/articles/new">
          <Button>新建文章</Button>
        </Link>
      </div>

      {/* 标签页切换 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setActiveTab('all'); setStatus(''); setPage(1); }}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          全部文章
        </button>
        <button
          onClick={() => { setActiveTab('trash'); setPage(1); }}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'trash' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          回收站
        </button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Input
              placeholder="搜索文章..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            {activeTab === 'all' && (
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="">全部状态</option>
                <option value="DRAFT">草稿</option>
                <option value="PUBLISHED">已发布</option>
                <option value="SCHEDULED">定时</option>
              </select>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">加载中...</div>
          ) : !data?.items.length ? (
            <div className="p-8 text-center text-gray-500">暂无文章</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>浏览量</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="text-primary-600 hover:underline"
                      >
                        {article.title}
                      </Link>
                    </TableCell>
                    <TableCell>{statusBadge(article.status)}</TableCell>
                    <TableCell>{article.category?.name || '-'}</TableCell>
                    <TableCell>{article.viewCount}</TableCell>
                    <TableCell>{formatDate(article.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {activeTab === 'trash' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRestore(article.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              恢复
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePermanentDelete(article.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              永久删除
                            </Button>
                          </>
                        ) : (
                          <>
                            <Link href={`/admin/articles/${article.id}`}>
                              <Button variant="ghost" size="sm">编辑</Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/article/${article.slug}`, '_blank')}
                            >
                              预览
                            </Button>
                            {article.status === 'DRAFT' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePublish(article.id)}
                              >
                                发布
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(article.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              删除
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
