import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategories';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui';
import { formatDate } from '../../lib/utils';

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', parentId: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: form.name,
        slug: form.slug || undefined,
        parentId: form.parentId || undefined,
      };
      if (editingId) {
        await updateCategory.mutateAsync({ id: editingId, data });
      } else {
        await createCategory.mutateAsync(data);
      }
      closeModal();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个分类吗？')) {
      await deleteCategory.mutateAsync(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ name: '', slug: '', parentId: '' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">分类管理</h1>
        <Button onClick={() => setIsModalOpen(true)}>新建分类</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">加载中...</div>
          ) : !categories?.length ? (
            <div className="p-8 text-center text-gray-500">暂无分类</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>别名</TableHead>
                  <TableHead>文章数</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-gray-500">{category.slug}</TableCell>
                    <TableCell>{category._count?.articles || 0}</TableCell>
                    <TableCell>{formatDate(category.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                          编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? '编辑分类' : '新建分类'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="名称"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="别名 (Slug)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="留空自动生成"
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              取消
            </Button>
            <Button type="submit" loading={createCategory.isPending || updateCategory.isPending}>
              保存
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
