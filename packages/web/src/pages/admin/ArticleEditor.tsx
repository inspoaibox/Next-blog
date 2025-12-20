import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useArticle, useCreateArticle, useUpdateArticle } from '../../hooks/useArticles';
import { useCategories } from '../../hooks/useCategories';
import { useTags } from '../../hooks/useTags';
import { Button, Input, Card, CardContent, Select, Textarea } from '../../components/ui';

export function ArticleEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const { data: article, isLoading } = useArticle(id || '');
  const { data: categories } = useCategories();
  const { data: tags } = useTags();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();

  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    status: 'draft' as const,
    categoryId: '',
    tagIds: [] as string[],
    seoTitle: '',
    seoDescription: '',
  });

  useEffect(() => {
    if (article) {
      setForm({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt || '',
        slug: article.slug,
        status: article.status as 'draft',
        categoryId: article.categoryId || '',
        tagIds: article.tags?.map((t) => t.id) || [],
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
        await updateArticle.mutateAsync({ id: id!, data: form });
      }
      navigate('/admin/articles');
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (!isNew && isLoading) {
    return <div className="p-8 text-center">加载中...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isNew ? '新建文章' : '编辑文章'}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/articles')}>
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
              <Textarea
                label="内容 (Markdown)"
                value={form.content}
                onChange={(e) => handleChange('content', e.target.value)}
                className="min-h-[400px] font-mono"
                required
              />
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
                  { value: 'draft', label: '草稿' },
                  { value: 'published', label: '已发布' },
                ]}
              />
              <Select
                label="分类"
                value={form.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                options={[
                  { value: '', label: '无分类' },
                  ...(categories?.map((c) => ({ value: c.id, label: c.name })) || []),
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">标签</h3>
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
