import { useState } from 'react';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '../../hooks/useTags';
import {
  Button,
  Card,
  CardContent,
  Input,
  Modal,
  Badge,
} from '../../components/ui';

export function TagsPage() {
  const { data: tags, isLoading } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTag.mutateAsync({ id: editingId, data: form });
      } else {
        await createTag.mutateAsync(form);
      }
      closeModal();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleEdit = (tag: any) => {
    setEditingId(tag.id);
    setForm({ name: tag.name, slug: tag.slug });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个标签吗？')) {
      await deleteTag.mutateAsync(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ name: '', slug: '' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">标签管理</h1>
        <Button onClick={() => setIsModalOpen(true)}>新建标签</Button>
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">加载中...</div>
          ) : !tags?.length ? (
            <div className="p-8 text-center text-gray-500">暂无标签</div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="group flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  <span className="font-medium">{tag.name}</span>
                  <Badge variant="default">{tag._count?.articles || 0}</Badge>
                  <div className="hidden group-hover:flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleEdit(tag)}
                      className="text-gray-500 hover:text-primary-600"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? '编辑标签' : '新建标签'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="名称"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="别名"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="留空自动生成"
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              取消
            </Button>
            <Button type="submit" loading={createTag.isPending || updateTag.isPending}>
              保存
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
