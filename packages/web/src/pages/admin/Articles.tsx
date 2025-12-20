import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useArticles, useDeleteArticle, usePublishArticle } from '../../hooks/useArticles';
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

  const { data, isLoading } = useArticles({ page, pageSize: 10, search, status });
  const deleteArticle = useDeleteArticle();
  const publishArticle = usePublishArticle();

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这篇文章吗？')) {
      await deleteArticle.mutateAsync(id);
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
        <Link to="/admin/articles/new">
          <Button>新建文章</Button>
        </Link>
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
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="">全部状态</option>
              <option value="DRAFT">草稿</option>
              <option value="PUBLISHED">已发布</option>
              <option value="SCHEDULED">定时</option>
              <option value="TRASHED">回收站</option>
            </select>
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
                        to={`/admin/articles/${article.id}`}
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
                        <Link to={`/admin/articles/${article.id}`}>
                          <Button variant="ghost" size="sm">编辑</Button>
                        </Link>
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
