import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { KnowledgeDoc } from '../../types';
import { Button, Card, CardContent, CardHeader, Input, Modal, Textarea } from '../../components/ui';

export function KnowledgePage() {
  const queryClient = useQueryClient();
  const { data: docs, isLoading } = useQuery({
    queryKey: ['knowledge'],
    queryFn: () => api.get<KnowledgeDoc[]>('/knowledge'),
  });

  const createDoc = useMutation({
    mutationFn: (data: Partial<KnowledgeDoc>) => api.post('/knowledge', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledge'] }),
  });

  const updateDoc = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<KnowledgeDoc> }) =>
      api.put(`/knowledge/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledge'] }),
  });

  const deleteDoc = useMutation({
    mutationFn: (id: string) => api.delete(`/knowledge/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledge'] }),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDoc | null>(null);
  const [form, setForm] = useState({ title: '', content: '', parentId: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc.mutateAsync({ id: editingId, data: form });
      } else {
        await createDoc.mutateAsync(form);
      }
      closeModal();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleEdit = (doc: KnowledgeDoc) => {
    setEditingId(doc.id);
    setForm({
      title: doc.title,
      content: doc.content,
      parentId: doc.parentId || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个文档吗？')) {
      await deleteDoc.mutateAsync(id);
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ title: '', content: '', parentId: '' });
  };

  const renderTree = (items: KnowledgeDoc[], level = 0) => {
    return items.map((doc) => (
      <div key={doc.id}>
        <div
          onClick={() => setSelectedDoc(doc)}
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg transition-colors ${
            selectedDoc?.id === doc.id
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          <span className="text-gray-400">{doc.children?.length ? '📁' : '📄'}</span>
          <span className="flex-1 truncate">{doc.title}</span>
        </div>
        {doc.children && doc.children.length > 0 && renderTree(doc.children, level + 1)}
      </div>
    ));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">知识库</h1>
        <Button onClick={() => setIsModalOpen(true)}>新建文档</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 文档树 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="font-semibold">文档目录</h2>
          </CardHeader>
          <CardContent className="p-2">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">加载中...</div>
            ) : !docs?.length ? (
              <div className="p-4 text-center text-gray-500">暂无文档</div>
            ) : (
              <div className="space-y-1">{renderTree(docs)}</div>
            )}
          </CardContent>
        </Card>

        {/* 文档内容 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{selectedDoc?.title || '选择文档'}</h2>
              {selectedDoc && (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(selectedDoc)}>
                    编辑
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(selectedDoc.id)}
                  >
                    删除
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedDoc ? (
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap">{selectedDoc.content}</pre>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                从左侧选择一个文档查看内容
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? '编辑文档' : '新建文档'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="标题"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Textarea
            label="内容 (Markdown)"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="min-h-[300px]"
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              取消
            </Button>
            <Button type="submit" loading={createDoc.isPending || updateDoc.isPending}>
              保存
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
