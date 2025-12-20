import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Comment, PaginatedResponse } from '../../types';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Badge,
  Pagination,
} from '../../components/ui';
import { formatDateTime } from '../../lib/utils';

export function CommentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', '20');
  if (status) params.set('status', status);

  const { data, isLoading } = useQuery({
    queryKey: ['comments', { page, status }],
    queryFn: () => api.get<PaginatedResponse<Comment>>(`/comments?${params}`),
  });

  const approveComment = useMutation({
    mutationFn: (id: string) => api.put(`/comments/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments'] }),
  });

  const spamComment = useMutation({
    mutationFn: (id: string) => api.put(`/comments/${id}/spam`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments'] }),
  });

  const deleteComment = useMutation({
    mutationFn: (id: string) => api.delete(`/comments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments'] }),
  });

  const statusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'danger'> = {
      pending: 'default',
      approved: 'success',
      spam: 'danger',
    };
    const labels: Record<string, string> = {
      pending: '待审核',
      approved: '已批准',
      spam: '垃圾',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">评论管理</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="">全部状态</option>
              <option value="pending">待审核</option>
              <option value="approved">已批准</option>
              <option value="spam">垃圾</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">加载中...</div>
          ) : !data?.items.length ? (
            <div className="p-8 text-center text-gray-500">暂无评论</div>
          ) : (
            <div className="space-y-4">
              {data.items.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-medium">{comment.authorName}</span>
                      <span className="text-gray-500 text-sm ml-2">{comment.authorEmail}</span>
                      {statusBadge(comment.status)}
                    </div>
                    <span className="text-gray-500 text-sm">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{comment.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      文章: {comment.article?.title || comment.articleId}
                    </span>
                    <div className="flex items-center gap-2">
                      {comment.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => approveComment.mutate(comment.id)}
                        >
                          批准
                        </Button>
                      )}
                      {comment.status !== 'spam' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => spamComment.mutate(comment.id)}
                        >
                          标记垃圾
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('确定要删除这条评论吗？')) {
                            deleteComment.mutate(comment.id);
                          }
                        }}
                        className="text-red-600"
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
