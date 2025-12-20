import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategories';
import {
  Button,
  Card,
  CardContent,
  Input,
  Modal,
  Select,
} from '../../components/ui';
import { formatDate } from '../../lib/utils';

interface CategoryWithChildren {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  createdAt: string;
  children?: CategoryWithChildren[];
  _count?: { articles: number };
}

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', parentId: '' });

  // 获取所有顶级分类用于选择父分类
  const topLevelCategories = categories?.filter((c: CategoryWithChildren) => !c.parentId) || [];

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
    } catch {
      // error handled by mutation
    }
  };

  const handleEdit = (category: CategoryWithChildren) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个分类吗？子分类将移动到上级。')) {
      await deleteCategory.mutateAsync(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ name: '', slug: '', parentId: '' });
  };

  const renderCategory = (category: CategoryWithChildren, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    return (
      <div key={category.id}>
        <div className={`flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${level > 0 ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''}`}>
          <div className="flex-1 flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
            {level > 0 && <span className="text-gray-400">└</span>}
            <span className="font-medium">{category.name}</span>
            <span className="text-xs text-gray-400">({category.slug})</span>
          </div>
          <div className="text-sm text-gray-500 w-20 text-center">
            {category._count?.articles || 0} 篇
          </div>
          <div className="text-sm text-gray-500 w-32">
            {formatDate(category.createdAt)}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`/?category=${category.id}`, '_blank')}
            >
              预览
            </Button>
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
        </div>
        {hasChildren && category.children!.map((child) => renderCategory(child, level + 1))}
      </div>
    );
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
            <div>
              <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400">
                <div className="flex-1">名称</div>
                <div className="w-20 text-center">文章数</div>
                <div className="w-32">创建时间</div>
                <div className="w-40">操作</div>
              </div>
              {(categories as CategoryWithChildren[]).map((category) => renderCategory(category))}
            </div>
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
          <Select
            label="父分类"
            value={form.parentId}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            options={[
              { value: '', label: '无（顶级分类）' },
              ...topLevelCategories
                .filter((c: CategoryWithChildren) => c.id !== editingId)
                .map((c: CategoryWithChildren) => ({ value: c.id, label: c.name })),
            ]}
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
