import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { KnowledgeDoc } from '../../types';
import { Button, Card, CardContent, CardHeader, Input, Modal, Select, Textarea } from '../../components/ui';

interface KnowledgeDocWithHtml extends KnowledgeDoc {
  htmlContent?: string;
}

export function KnowledgePage() {
  const queryClient = useQueryClient();
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const { data: docs, isLoading } = useQuery({
    queryKey: ['knowledge'],
    queryFn: () => api.get<KnowledgeDoc[]>('/knowledge'),
  });

  // 获取选中文档的详情（包含渲染后的 HTML）
  const { data: selectedDoc } = useQuery({
    queryKey: ['knowledge', selectedDocId],
    queryFn: () => api.get<KnowledgeDocWithHtml>(`/knowledge/${selectedDocId}`),
    enabled: !!selectedDocId,
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
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDoc | null>(null);
  const [form, setForm] = useState({ title: '', content: '', parentId: '' });
  const [folderForm, setFolderForm] = useState({ title: '', parentId: '' });
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleModalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const title = file.name.replace(/\.(md|txt|markdown)$/i, '');
        setForm({ ...form, title: form.title || title, content });
        setUploadedFileName(file.name);
      };
      reader.readAsText(file);
    }
  };

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
    setUploadedFileName('');
    if (modalFileInputRef.current) modalFileInputRef.current.value = '';
  };

  const openFolderModal = (parentId = '', editDoc?: KnowledgeDoc) => {
    if (editDoc) {
      setEditingId(editDoc.id);
      setFolderForm({ title: editDoc.title, parentId: editDoc.parentId || '' });
    } else {
      setEditingId(null);
      setFolderForm({ title: '', parentId });
    }
    setIsFolderModalOpen(true);
  };

  const closeFolderModal = () => {
    setIsFolderModalOpen(false);
    setEditingId(null);
    setFolderForm({ title: '', parentId: '' });
  };

  const handleFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc.mutateAsync({ id: editingId, data: { title: folderForm.title, parentId: folderForm.parentId } });
      } else {
        await createDoc.mutateAsync({ title: folderForm.title, content: '', parentId: folderForm.parentId });
      }
      closeFolderModal();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  // 扁平化文档列表用于父目录选择
  const flattenDocs = (items: KnowledgeDoc[], prefix = ''): { id: string; title: string }[] => {
    const result: { id: string; title: string }[] = [];
    for (const doc of items) {
      result.push({ id: doc.id, title: prefix + doc.title });
      if (doc.children?.length) {
        result.push(...flattenDocs(doc.children, prefix + '　'));
      }
    }
    return result;
  };

  const flatDocs = docs ? flattenDocs(docs) : [];

  // 简单的 Markdown 渲染
  const renderMarkdown = (content: string) => {
    const html = content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">$1</code>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/\n/gim, '<br />');
    return html;
  };

  const renderTree = (items: KnowledgeDoc[], level = 0) => {
    return items.map((doc) => {
      const isFolder = doc.children && doc.children.length > 0;
      const hasNoContent = !doc.content || doc.content.trim() === '';
      return (
        <div key={doc.id}>
          <div
            className={`group flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg transition-colors ${
              selectedDoc?.id === doc.id
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            <span className="text-gray-400">{isFolder || hasNoContent ? '📁' : '📄'}</span>
            <span className="flex-1 truncate" onClick={() => setSelectedDoc(doc)}>
              {doc.title}
            </span>
            <div className="hidden group-hover:flex items-center gap-1">
              {(isFolder || hasNoContent) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openFolderModal('', doc);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-500"
                  title="编辑目录"
                >
                  ✏️
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(doc.id);
                }}
                className="p-1 text-gray-400 hover:text-red-500"
                title="删除"
              >
                🗑️
              </button>
            </div>
          </div>
          {doc.children && doc.children.length > 0 && renderTree(doc.children, level + 1)}
        </div>
      );
    });
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
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">文档目录</h2>
              <Button size="sm" variant="outline" onClick={() => openFolderModal()}>
                新建目录
              </Button>
            </div>
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
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedDoc.content || '') }}
              />
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
          {!editingId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                上传文档 (可选)
              </label>
              <div className="flex items-center gap-2">
                <input
                  ref={modalFileInputRef}
                  type="file"
                  accept=".md,.txt,.markdown"
                  className="hidden"
                  onChange={handleModalFileUpload}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => modalFileInputRef.current?.click()}>
                  选择文件
                </Button>
                {uploadedFileName && (
                  <span className="text-sm text-gray-500">{uploadedFileName}</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">支持 .md, .txt 文件，上传后自动填充标题和内容</p>
            </div>
          )}
          <Input
            label="标题"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Select
            label="父目录"
            value={form.parentId}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            options={[
              { value: '', label: '无 (根目录)' },
              ...flatDocs
                .filter((d) => d.id !== editingId) // 不能选择自己作为父目录
                .map((d) => ({ value: d.id, label: d.title })),
            ]}
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

      <Modal isOpen={isFolderModalOpen} onClose={closeFolderModal} title={editingId ? '编辑目录' : '新建目录'}>
        <form onSubmit={handleFolderSubmit} className="space-y-4">
          <Input
            label="目录名称"
            value={folderForm.title}
            onChange={(e) => setFolderForm({ ...folderForm, title: e.target.value })}
            required
          />
          <Select
            label="父目录"
            value={folderForm.parentId}
            onChange={(e) => setFolderForm({ ...folderForm, parentId: e.target.value })}
            options={[
              { value: '', label: '无 (根目录)' },
              ...flatDocs
                .filter((d) => d.id !== editingId)
                .map((d) => ({ value: d.id, label: d.title })),
            ]}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={closeFolderModal}>
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
