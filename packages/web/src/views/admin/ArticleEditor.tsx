import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useArticle, useCreateArticle, useUpdateArticle } from '../../hooks/useArticles';
import { useCategoriesFlat } from '../../hooks/useCategories';
import { useTags, useCreateTag } from '../../hooks/useTags';
import { Button, Input, Card, CardContent, Select, Textarea } from '../../components/ui';
import { MarkdownEditor } from '../../components/MarkdownEditor';
import { api } from '../../lib/api';

interface ArticleEditorPageProps {
  articleId?: string;
}

export function ArticleEditorPage({ articleId }: ArticleEditorPageProps) {
  const router = useRouter();
  const isNew = !articleId;

  const { data: article, isLoading } = useArticle(articleId || '');
  const { data: categories } = useCategoriesFlat();
  const { data: tags } = useTags();
  const createTag = useCreateTag();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();

  const [newTagName, setNewTagName] = useState('');
  const [featuredImageDragging, setFeaturedImageDragging] = useState(false);
  const [featuredImageUploading, setFeaturedImageUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    featuredImage: '',
    status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED',
    categoryId: '',
    tagIds: [] as string[],
    seoTitle: '',
    seoDescription: '',
  });

  useEffect(() => {
    if (article) {
      // 处理标签数据 - 后端返回的是 ArticleTag[] 格式
      const tagIds = article.tags?.map((t: any) => t.tag?.id || t.id).filter(Boolean) || [];
      
      setForm({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt || '',
        slug: article.slug,
        featuredImage: article.featuredImage || '',
        status: article.status as 'DRAFT' | 'PUBLISHED',
        categoryId: article.categoryId || '',
        tagIds,
        seoTitle: article.seoTitle || '',
        seoDescription: article.seoDescription || '',
      });
    }
  }, [article]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isNew) {
        await createArticle.mutateAsync(form);
      } else {
        await updateArticle.mutateAsync({ id: articleId!, data: form });
      }
      router.push('/admin/articles');
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFeaturedImage(file);
  };

  const uploadFeaturedImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('只支持上传图片文件');
      return;
    }
    setFeaturedImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await api.upload<{ url: string }>('/media/upload', formData);
      handleChange('featuredImage', result.url);
    } catch (error) {
      console.error('上传失败:', error);
      alert('图片上传失败');
    } finally {
      setFeaturedImageUploading(false);
    }
  };

  const handleFeaturedImageDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFeaturedImageDragging(false);

    const files = e.dataTransfer?.files;
    if (!files?.length) return;

    const file = files[0];
    if (file.type.startsWith('image/')) {
      await uploadFeaturedImage(file);
    }
  }, []);

  const handleFeaturedImagePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await uploadFeaturedImage(file);
        }
        return;
      }
    }
  }, []);

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    const result = await createTag.mutateAsync({ name: newTagName.trim() });
    handleChange('tagIds', [...form.tagIds, result.id]);
    setNewTagName('');
  };

  if (!isNew && isLoading) {
    return <div className="p-8 text-center">加载中...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isNew ? '新建文章' : '编辑文章'}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/articles')}>
            取消
          </Button>
          <Button onClick={handleSubmit} loading={createArticle.isPending || updateArticle.isPending}>
            保存
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="space-y-4">
              <Input
                label="标题"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
              <Input
                label="别名 (Slug)"
                value={form.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="留空自动生成"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  内容 (Markdown)
                </label>
                <MarkdownEditor
                  value={form.content}
                  onChange={(value) => handleChange('content', value)}
                  onImageUpload={async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    const result = await api.upload<{ url: string }>('/media/upload', formData);
                    return result.url;
                  }}
                  placeholder="在这里输入文章内容..."
                />
              </div>
              <Textarea
                label="摘要"
                value={form.excerpt}
                onChange={(e) => handleChange('excerpt', e.target.value)}
                placeholder="留空自动从内容生成"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">SEO 设置</h3>
              <Input
                label="SEO 标题"
                value={form.seoTitle}
                onChange={(e) => handleChange('seoTitle', e.target.value)}
                placeholder="留空使用文章标题"
              />
              <Textarea
                label="SEO 描述"
                value={form.seoDescription}
                onChange={(e) => handleChange('seoDescription', e.target.value)}
                placeholder="留空使用文章摘要"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">发布设置</h3>
              <Select
                label="状态"
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
                options={[
                  { value: 'DRAFT', label: '草稿' },
                  { value: 'PUBLISHED', label: '已发布' },
                ]}
              />
              <Select
                label="分类"
                value={form.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                options={[
                  { value: '', label: '无分类' },
                  ...buildCategoryOptions(categories || []),
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">特色图</h3>
              <div
                onDragOver={(e) => { e.preventDefault(); setFeaturedImageDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setFeaturedImageDragging(false); }}
                onDrop={handleFeaturedImageDrop}
                onPaste={handleFeaturedImagePaste}
                tabIndex={0}
                className="relative"
              >
                {featuredImageUploading && (
                  <div className="absolute inset-0 z-10 bg-black/30 rounded flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">上传中...</span>
                    </div>
                  </div>
                )}
                {form.featuredImage ? (
                  <div className="relative">
                    <img
                      src={form.featuredImage}
                      alt="特色图"
                      className="w-full h-40 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange('featuredImage', '')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label 
                    className={`block border-2 border-dashed rounded p-4 text-center cursor-pointer transition-colors ${
                      featuredImageDragging 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFeaturedImageUpload}
                    />
                    <div className="space-y-2">
                      <div className="text-3xl">🖼️</div>
                      <span className="text-gray-500 block">
                        {featuredImageDragging ? '释放以上传' : '点击、拖拽或粘贴上传特色图'}
                      </span>
                      <span className="text-xs text-gray-400">支持 JPG、PNG、GIF、WebP</span>
                    </div>
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">标签</h3>
              <div className="flex gap-2">
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="输入新标签"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} disabled={!newTagName.trim()}>
                  添加
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags?.map((tag) => (
                  <label
                    key={tag.id}
                    className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                      form.tagIds.includes(tag.id)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.tagIds.includes(tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleChange('tagIds', [...form.tagIds, tag.id]);
                        } else {
                          handleChange('tagIds', form.tagIds.filter((id) => id !== tag.id));
                        }
                      }}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 构建层级分类选项
function buildCategoryOptions(
  categories: Category[],
  parentId: string | null = null,
  level: number = 0
): { value: string; label: string }[] {
  const result: { value: string; label: string }[] = [];
  const prefix = level > 0 ? '　'.repeat(level) + '└ ' : '';

  const items = categories.filter((c) => (c.parentId || null) === parentId);

  for (const item of items) {
    result.push({ value: item.id, label: prefix + item.name });
    // 递归添加子分类
    const children = buildCategoryOptions(categories, item.id, level + 1);
    result.push(...children);
  }

  return result;
}

type Category = {
  id: string;
  name: string;
  parentId?: string | null;
};
