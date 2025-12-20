import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Page } from '../../types';
import {
  Button,
  Card,
  CardContent,
  Input,
  Modal,
  Textarea,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui';
import { formatDate } from '../../lib/utils';

export function PagesPage() {
  const queryClient = useQueryClient();
  const { data: pages, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: () => api.get<Page[]>('/pages'),
  });

  const createPage = useMutation({
    mutationFn: (data: Partial<Page>) => api.post<Page>('/pages', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });

  const updatePage = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Page> }) =>
      api.put<Page>(`/pages/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });

  const deletePage = useMutation({
    mutationFn: (id: string) => api.delete(`/pages/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    isPublished: true,
    showInNav: false,
    order: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePage.mutateAsync({ id: editingId, data: form });
      } else {
        await createPage.mutateAsync(form);
      }
      closeModal();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleEdit = (page: Page) => {
    setEditingId(page.id);
    setForm({
      title: page.title,
      slug: page.slug,
      content: page.content,
      isPublished: page.isPublished,
      showInNav: page.showInNav,
      order: page.order,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个页面吗？')) {
      await deletePage.mutateAsync(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ title: '', slug: '', content: '', isPublished: true, showInNav: false, order: 0 });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">页面管理</h1>
        <Button onClick={() => setIsModalOpen(true)}>新建页面</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">加载中...</div>
          ) : !pages?.length ? (
            <div className="p-8 text-center text-gray-500">暂无页面</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>链接</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>导航</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell className="text-gray-500">/{page.slug}</TableCell>
                    <TableCell>
                      <Badge variant={page.isPublished ? 'success' : 'default'}>
                        {page.isPublished ? '已发布' : '草稿'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {page.showInNav && <Badge variant="primary">显示</Badge>}
                    </TableCell>
                    <TableCell>{formatDate(page.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(page)}>
                          编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(page.id)}
                          className="text-red-600"
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? '编辑页面' : '新建页面'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="标题"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Input
            label="链接"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="留空自动生成"
          />
          <Textarea
            label="内容 (Markdown)"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="min-h-[200px]"
          />
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="rounded"
              />
              <span>发布</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.showInNav}
                onChange={(e) => setForm({ ...form, showInNav: e.target.checked })}
                className="rounded"
              />
              <span>显示在导航</span>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              取消
            </Button>
            <Button type="submit" loading={createPage.isPending || updatePage.isPending}>
              保存
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
