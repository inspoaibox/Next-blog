import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Comment } from '../types';
import { Button, Input, Textarea, Card, CardContent } from './ui';
import { formatDateTime } from '../lib/utils';

interface CommentSectionProps {
  articleId: string;
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ['comments', articleId],
    queryFn: () => api.get<{ items: Comment[]; total: number }>(`/comments/article/${articleId}`),
  });

  const comments = data?.items;

  const submitComment = useMutation({
    mutationFn: (data: { content: string; authorName: string; authorEmail: string; authorUrl?: string }) =>
      api.post('/comments', { ...data, articleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
      setForm({ content: '', authorName: '', authorEmail: '', authorUrl: '' });
      setSubmitted(true);
    },
  });

  const [form, setForm] = useState({
    content: '',
    authorName: '',
    authorEmail: '',
    authorUrl: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim() || !form.authorName.trim() || !form.authorEmail.trim()) return;
    submitComment.mutate(form);
  };

  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold mb-6">评论</h3>

      {/* 评论表单 */}
      <Card className="mb-8">
        <CardContent className="p-6">
          {submitted ? (
            <div className="text-center py-4 text-green-600">
              评论已提交，等待审核后显示
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="写下你的评论..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="昵称 *"
                  value={form.authorName}
                  onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                  required
                />
                <Input
                  type="email"
                  placeholder="邮箱 *"
                  value={form.authorEmail}
                  onChange={(e) => setForm({ ...form, authorEmail: e.target.value })}
                  required
                />
                <Input
                  placeholder="网站 (可选)"
                  value={form.authorUrl}
                  onChange={(e) => setForm({ ...form, authorUrl: e.target.value })}
                />
              </div>
              <Button type="submit" loading={submitComment.isPending}>
                提交评论
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* 评论列表 */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">加载评论中...</div>
      ) : !comments?.length ? (
        <div className="text-center py-8 text-gray-500">暂无评论，来抢沙发吧！</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-medium">{comment.authorName}</span>
                    {comment.authorUrl && (
                      <a
                        href={comment.authorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 text-sm ml-2"
                      >
                        🔗
                      </a>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDateTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
