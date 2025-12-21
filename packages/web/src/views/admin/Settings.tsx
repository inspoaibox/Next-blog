import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { AIModel } from '../../types';
import { themes, type ThemeConfigOption } from '../../themes';
import { useCategoriesFlat } from '../../hooks/useCategories';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Select,
  Modal,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Textarea,
} from '../../components/ui';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    'site' | 'menu' | 'slider' | 'seo' | 'security' | 'ai' | 'theme' | 'plugin' | 'help'
  >('site');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">系统设置</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'site', label: '网站设置' },
          { key: 'menu', label: '菜单管理' },
          { key: 'slider', label: '幻灯片' },
          { key: 'seo', label: 'SEO 优化' },
          { key: 'security', label: '安全设置' },
          { key: 'ai', label: 'AI 模型' },
          { key: 'theme', label: '主题设置' },
          { key: 'plugin', label: '插件管理' },
          { key: 'help', label: '帮助中心' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'site' | 'menu' | 'slider' | 'seo' | 'security' | 'ai' | 'theme' | 'plugin' | 'help')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'site' && <SiteSettings />}
      {activeTab === 'menu' && <MenuSettings />}
      {activeTab === 'slider' && <SliderSettings />}
      {activeTab === 'seo' && <SEOSettings />}
      {activeTab === 'security' && <SecuritySettings />}
      {activeTab === 'ai' && <AIModelSettings />}
      {activeTab === 'theme' && <ThemeSettings />}
      {activeTab === 'plugin' && <PluginSettings />}
      {activeTab === 'help' && <HelpCenter />}
    </div>
  );
}

function SiteSettings() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => api.get<Record<string, string>>('/settings'),
  });

  const [form, setForm] = useState({
    siteName: '',
    siteDescription: '',
    siteKeywords: '',
    siteUrl: '',
    siteLogo: '',
    siteFavicon: '',
    footerText: '',
    seoDefaultTitle: '',
    seoDefaultDescription: '',
    socialGithub: '',
    socialTwitter: '',
    socialWeibo: '',
    allowedMediaTypes: '',
    commentEnabled: 'true',
    homeArticleCount: '12',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        siteName: settings.siteName || '',
        siteDescription: settings.siteDescription || '',
        siteKeywords: settings.siteKeywords || '',
        siteUrl: settings.siteUrl || '',
        siteLogo: settings.siteLogo || '',
        siteFavicon: settings.siteFavicon || '',
        footerText: settings.footerText || '',
        seoDefaultTitle: settings.seoDefaultTitle || '',
        seoDefaultDescription: settings.seoDefaultDescription || '',
        socialGithub: settings.socialGithub || '',
        socialTwitter: settings.socialTwitter || '',
        socialWeibo: settings.socialWeibo || '',
        allowedMediaTypes: settings.allowedMediaTypes || 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf',
        commentEnabled: settings.commentEnabled ?? 'true',
        homeArticleCount: settings.homeArticleCount || '12',
      });
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: (data: Record<string, string>) => api.put('/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      setMessage({ type: 'success', text: '设置保存成功' });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: Error) => {
      setMessage({ type: 'error', text: error.message || '保存失败' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(form);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        {message && (
          <div className={`mb-6 p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* 基本信息 */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold">基本信息</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="网站名称"
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                placeholder="NextBlog"
              />
              <Input
                label="网站地址"
                value={form.siteUrl}
                onChange={(e) => setForm({ ...form, siteUrl: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <Textarea
              label="网站描述"
              value={form.siteDescription}
              onChange={(e) => setForm({ ...form, siteDescription: e.target.value })}
              placeholder="下一个博客，记录精彩生活"
            />
            <Input
              label="网站关键词"
              value={form.siteKeywords}
              onChange={(e) => setForm({ ...form, siteKeywords: e.target.value })}
              placeholder="博客,技术,生活,分享（用逗号分隔）"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="网站 Logo URL"
                value={form.siteLogo}
                onChange={(e) => setForm({ ...form, siteLogo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
              <Input
                label="网站 Favicon URL"
                value={form.siteFavicon}
                onChange={(e) => setForm({ ...form, siteFavicon: e.target.value })}
                placeholder="https://example.com/favicon.ico"
              />
            </div>
            <Input
              label="页脚文字"
              value={form.footerText}
              onChange={(e) => setForm({ ...form, footerText: e.target.value })}
              placeholder="© {year} NextBlog. All rights reserved.（{year} 会自动替换为当前年份）"
            />
            <Input
              label="首页文章数量"
              type="number"
              value={form.homeArticleCount}
              onChange={(e) => setForm({ ...form, homeArticleCount: e.target.value })}
              placeholder="12"
            />
            <p className="text-xs text-gray-500 -mt-2">
              首页每页显示的文章数量，默认为 12 篇
            </p>
          </CardContent>
        </Card>

        {/* SEO 设置 */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold">SEO 设置</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="默认 SEO 标题"
              value={form.seoDefaultTitle}
              onChange={(e) => setForm({ ...form, seoDefaultTitle: e.target.value })}
              placeholder="留空则使用网站名称"
            />
            <Textarea
              label="默认 SEO 描述"
              value={form.seoDefaultDescription}
              onChange={(e) => setForm({ ...form, seoDefaultDescription: e.target.value })}
              placeholder="留空则使用网站描述"
            />
          </CardContent>
        </Card>

        {/* 社交链接 */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold">社交链接</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="GitHub"
                value={form.socialGithub}
                onChange={(e) => setForm({ ...form, socialGithub: e.target.value })}
                placeholder="https://github.com/username"
              />
              <Input
                label="Twitter"
                value={form.socialTwitter}
                onChange={(e) => setForm({ ...form, socialTwitter: e.target.value })}
                placeholder="https://twitter.com/username"
              />
              <Input
                label="微博"
                value={form.socialWeibo}
                onChange={(e) => setForm({ ...form, socialWeibo: e.target.value })}
                placeholder="https://weibo.com/username"
              />
            </div>
          </CardContent>
        </Card>

        {/* 媒体设置 */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold">媒体设置</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="允许上传的文件类型"
              value={form.allowedMediaTypes}
              onChange={(e) => setForm({ ...form, allowedMediaTypes: e.target.value })}
              placeholder="image/jpeg,image/png,image/gif,image/webp,application/pdf"
            />
            <p className="text-xs text-gray-500">
              用逗号分隔 MIME 类型。常用类型：image/jpeg, image/png, image/gif, image/webp, image/svg+xml, application/pdf
            </p>
          </CardContent>
        </Card>

        {/* 评论设置 */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold">评论设置</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">启用评论功能</div>
                <p className="text-sm text-gray-500">开启后，访客可以在文章底部发表评论</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, commentEnabled: form.commentEnabled === 'true' ? 'false' : 'true' })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.commentEnabled === 'true' ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.commentEnabled === 'true' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={updateSettings.isPending}>
            保存设置
          </Button>
        </div>
      </form>
    </div>
  );
}

function SecuritySettings() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const changePassword = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.put('/auth/password', data),
    onSuccess: () => {
      setMessage({ type: 'success', text: '密码修改成功' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: Error) => {
      setMessage({ type: 'error', text: error.message || '密码修改失败' });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: '两次输入的新密码不一致' });
      return;
    }

    if (form.newPassword.length < 6) {
      setMessage({ type: 'error', text: '新密码长度至少6位' });
      return;
    }

    await changePassword.mutateAsync({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">修改密码</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          {message && (
            <div
              className={`p-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          <Input
            label="当前密码"
            type="password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            required
          />

          <Input
            label="新密码"
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            placeholder="至少6位"
            required
          />

          <Input
            label="确认新密码"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
          />

          <Button type="submit" loading={changePassword.isPending}>
            修改密码
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AIModelSettings() {
  const queryClient = useQueryClient();
  const { data: models, isLoading } = useQuery({
    queryKey: ['ai-models'],
    queryFn: () => api.get<AIModel[]>('/ai/models'),
  });

  const createModel = useMutation({
    mutationFn: (data: Partial<AIModel>) => api.post('/ai/models', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-models'] }),
  });

  const deleteModel = useMutation({
    mutationFn: (id: string) => api.delete(`/ai/models/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-models'] }),
  });

  const setDefault = useMutation({
    mutationFn: (id: string) => api.put(`/ai/models/${id}/default`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-models'] }),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    provider: 'openai' as 'openai' | 'claude' | 'qwen',
    model: '',
    apiKey: '',
    baseUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createModel.mutateAsync(form);
    setIsModalOpen(false);
    setForm({ name: '', provider: 'openai' as const, model: '', apiKey: '', baseUrl: '' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">AI 模型配置</h2>
          <Button onClick={() => setIsModalOpen(true)}>添加模型</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : !models?.length ? (
          <div className="p-8 text-center text-gray-500">暂无配置的模型</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>提供商</TableHead>
                <TableHead>模型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell>{model.provider}</TableCell>
                  <TableCell>{model.model}</TableCell>
                  <TableCell>
                    {model.isDefault && <Badge variant="primary">默认</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {!model.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDefault.mutate(model.id)}
                        >
                          设为默认
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('确定要删除这个模型吗？')) {
                            deleteModel.mutate(model.id);
                          }
                        }}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="添加 AI 模型">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="名称"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Select
            label="提供商"
            value={form.provider}
            onChange={(e) => setForm({ ...form, provider: e.target.value as 'openai' | 'claude' | 'qwen' })}
            options={[
              { value: 'openai', label: 'OpenAI' },
              { value: 'claude', label: 'Claude' },
              { value: 'qwen', label: '通义千问' },
            ]}
          />
          <Input
            label="模型"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            placeholder="如 gpt-4, claude-3-opus"
            required
          />
          <Input
            label="API Key"
            type="password"
            value={form.apiKey}
            onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
            required
          />
          <Input
            label="Base URL (可选)"
            value={form.baseUrl}
            onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
            placeholder="自定义 API 地址"
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button type="submit" loading={createModel.isPending}>
              保存
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

// 快速链接编辑器组件
function QuickLinksEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [links, setLinks] = useState<Array<{ label: string; url: string }>>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState({ label: '', url: '' });

  useEffect(() => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        setLinks(parsed);
      }
    } catch {
      setLinks([]);
    }
  }, [value]);

  const handleAdd = () => {
    if (form.label && form.url) {
      const newLinks = [...links, { label: form.label, url: form.url }];
      setLinks(newLinks);
      onChange(JSON.stringify(newLinks));
      setForm({ label: '', url: '' });
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setForm(links[index]);
  };

  const handleUpdate = () => {
    if (editingIndex !== null && form.label && form.url) {
      const newLinks = [...links];
      newLinks[editingIndex] = { label: form.label, url: form.url };
      setLinks(newLinks);
      onChange(JSON.stringify(newLinks));
      setEditingIndex(null);
      setForm({ label: '', url: '' });
    }
  };

  const handleDelete = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
    onChange(JSON.stringify(newLinks));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;
    const newLinks = [...links];
    [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
    setLinks(newLinks);
    onChange(JSON.stringify(newLinks));
  };

  return (
    <div className="space-y-3">
      {/* 链接列表 */}
      <div className="space-y-2">
        {links.map((link, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex flex-col gap-1">
              <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▲</button>
              <button onClick={() => handleMove(index, 'down')} disabled={index === links.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▼</button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{link.label}</div>
              <div className="text-xs text-gray-500 truncate">{link.url}</div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => handleEdit(index)}>编辑</Button>
            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(index)}>删除</Button>
          </div>
        ))}
      </div>

      {/* 添加/编辑表单 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="链接名称"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
        <input
          type="text"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          placeholder="链接地址"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
        {editingIndex !== null ? (
          <>
            <Button size="sm" onClick={handleUpdate}>更新</Button>
            <Button size="sm" variant="outline" onClick={() => { setEditingIndex(null); setForm({ label: '', url: '' }); }}>取消</Button>
          </>
        ) : (
          <Button size="sm" onClick={handleAdd}>添加</Button>
        )}
      </div>
    </div>
  );
}

interface DbTheme {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  config: Record<string, unknown>;
}

function ThemeSettings() {
  const queryClient = useQueryClient();

  const { data: dbThemes, isLoading } = useQuery({
    queryKey: ['themes'],
    queryFn: () => api.get<DbTheme[]>('/themes'),
  });

  const activateTheme = useMutation({
    mutationFn: (id: string) => api.put(`/themes/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    },
  });

  const updateThemeConfig = useMutation({
    mutationFn: ({ id, config }: { id: string; config: Record<string, unknown> }) => 
      api.put(`/themes/${id}`, { config }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    },
  });

  const deleteTheme = useMutation({
    mutationFn: (id: string) => api.delete(`/themes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    },
  });

  // 使用前端主题定义
  const frontendThemes = themes;

  // 有效的主题名称（前端支持的）
  const validThemeNames = Object.keys(frontendThemes);

  // 过滤出有效主题和无效主题
  const validThemeList = dbThemes?.filter((t) => validThemeNames.includes(t.name)) || [];
  const invalidThemeList = dbThemes?.filter((t) => !validThemeNames.includes(t.name)) || [];

  // 获取当前激活的主题
  const activeTheme = validThemeList.find((t) => t.isActive);
  const activeThemeName = activeTheme?.name || 'classic';
  const activeThemeData = frontendThemes[activeThemeName];

  // 解析当前主题配置
  const currentConfig = activeTheme?.config 
    ? (typeof activeTheme.config === 'string' ? JSON.parse(activeTheme.config) : activeTheme.config) 
    : {};
  const mergedConfig = { ...(activeThemeData?.defaultConfig || {}), ...currentConfig };

  const handleConfigChange = (key: string, value: unknown) => {
    if (!activeTheme) return;
    const newConfig = { ...mergedConfig, [key]: value };
    updateThemeConfig.mutate({ id: activeTheme.id, config: newConfig });
  };

  return (
    <div className="space-y-6">
      {/* 主题选择 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">选择主题</h2>
            <p className="text-sm text-gray-500">选择博客前台展示风格</p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">加载中...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {validThemeList.map((theme) => {
                const themeData = frontendThemes[theme.name];
                if (!themeData) return null;
                
                return (
                  <div
                    key={theme.id}
                    className={`relative overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                      theme.isActive
                        ? 'border-primary-500 shadow-lg shadow-primary-500/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => !theme.isActive && activateTheme.mutate(theme.id)}
                  >
                    {/* 预览区域 */}
                    <div className={`h-32 flex items-center justify-center text-6xl ${
                      theme.name === 'classic' ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20' :
                      theme.name === 'minimal' ? 'bg-white dark:bg-gray-900' :
                      'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                    }`}>
                      {theme.name === 'classic' ? '📰' : theme.name === 'minimal' ? '✨' : '🎨'}
                    </div>
                    
                    {/* 信息区域 */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{themeData.displayName}</h3>
                        {theme.isActive && (
                          <Badge variant="primary">当前使用</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{themeData.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 无效主题列表 */}
          {invalidThemeList.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 mb-4">⚠️ 以下主题已失效，可以删除：</h3>
              <div className="space-y-2">
                {invalidThemeList.map((theme) => (
                  <div key={theme.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">{theme.name}</span>
                    <Button size="sm" variant="outline" className="text-red-600"
                      onClick={() => confirm(`确定要删除主题 "${theme.name}" 吗？`) && deleteTheme.mutate(theme.id)}>
                      删除
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 主题配置 */}
      {activeTheme && activeThemeData?.configOptions?.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">主题配置 - {activeThemeData.displayName}</h2>
              <p className="text-sm text-gray-500">自定义主题的显示效果</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeThemeData.configOptions.map((option: ThemeConfigOption) => (
                <div key={option.key} className={`space-y-2 ${option.type === 'json' ? 'md:col-span-2' : ''}`}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {option.label}
                  </label>
                  
                  {option.type === 'select' && (
                    <select
                      value={mergedConfig[option.key] || option.default}
                      onChange={(e) => handleConfigChange(option.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
                    >
                      {option.options?.map((opt: { value: string; label: string }) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  )}
                  
                  {option.type === 'boolean' && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mergedConfig[option.key] ?? option.default}
                        onChange={(e) => handleConfigChange(option.key, e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {mergedConfig[option.key] ? '已启用' : '已禁用'}
                      </span>
                    </label>
                  )}

                  {option.type === 'text' && (
                    <input
                      type="text"
                      value={mergedConfig[option.key] || option.default || ''}
                      onChange={(e) => handleConfigChange(option.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
                      placeholder={option.default || ''}
                    />
                  )}

                  {option.type === 'json' && (
                    <QuickLinksEditor
                      value={mergedConfig[option.key] || option.default}
                      onChange={(value) => handleConfigChange(option.key, value)}
                    />
                  )}
                  
                  {option.description && (
                    <p className="text-xs text-gray-500">{option.description}</p>
                  )}
                </div>
              ))}
            </div>
            
            {updateThemeConfig.isPending && (
              <div className="mt-4 text-sm text-primary-600">保存中...</div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          💡 提示：修改配置后会自动保存，刷新博客前台页面即可看到效果。
        </p>
      </div>
    </div>
  );
}

interface Plugin {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  isEnabled: boolean;
}

function PluginSettings() {
  const queryClient = useQueryClient();
  const { data: plugins } = useQuery({
    queryKey: ['plugins'],
    queryFn: () => api.get<Plugin[]>('/plugins'),
  });

  const enablePlugin = useMutation({
    mutationFn: (id: string) => api.put(`/plugins/${id}/enable`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plugins'] }),
  });

  const disablePlugin = useMutation({
    mutationFn: (id: string) => api.put(`/plugins/${id}/disable`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plugins'] }),
  });

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">插件管理</h2>
      </CardHeader>
      <CardContent>
        {!plugins?.length ? (
          <div className="text-center text-gray-500 py-8">暂无已安装插件</div>
        ) : (
          <div className="space-y-4">
            {plugins.map((plugin) => (
              <div
                key={plugin.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{plugin.name}</h3>
                  <p className="text-sm text-gray-500">版本: {plugin.version}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={plugin.isEnabled ? 'success' : 'default'}>
                    {plugin.isEnabled ? '已启用' : '已禁用'}
                  </Badge>
                  {plugin.isEnabled ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => disablePlugin.mutate(plugin.id)}
                    >
                      禁用
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => enablePlugin.mutate(plugin.id)}
                    >
                      启用
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


interface MenuItem {
  id: string;
  label: string;
  url: string;
  type: 'internal' | 'external' | 'page' | 'category';
  sortOrder: number;
  visible?: boolean;
  children?: MenuItem[];
}

interface PageItem {
  id: string;
  title: string;
  slug: string;
  showInNav?: boolean;
}

function MenuSettings() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { data: settings, isLoading: settingsLoading, error: settingsError } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => api.get<Record<string, string>>('/settings'),
  });

  const { data: pages, isLoading: pagesLoading, error: pagesError } = useQuery({
    queryKey: ['pages'],
    queryFn: () => api.get<PageItem[]>('/pages'),
  });

  const { data: categories } = useCategoriesFlat();

  // 默认菜单
  const defaultMenu: MenuItem[] = [
    { id: '1', label: '首页', url: '/', type: 'internal', sortOrder: 0, visible: true },
    { id: '2', label: '分类', url: '/categories', type: 'internal', sortOrder: 1, visible: true },
    { id: '3', label: '标签', url: '/tags', type: 'internal', sortOrder: 2, visible: true },
    { id: '4', label: '知识库', url: '/knowledge', type: 'internal', sortOrder: 3, visible: true },
    { id: '5', label: '搜索', url: '/search', type: 'internal', sortOrder: 4, visible: true },
  ];

  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenu);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [grandParentId, setGrandParentId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: '', url: '', type: 'internal' as MenuItem['type'], visible: true });

  useEffect(() => {
    if (settings?.navMenu) {
      try {
        const parsed = JSON.parse(settings.navMenu);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMenuItems(parsed);
        }
      } catch {
        // 使用默认菜单
      }
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: (data: Record<string, string>) => api.put('/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      setMessage({ type: 'success', text: '菜单保存成功' });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: Error) => {
      setMessage({ type: 'error', text: error.message || '保存失败' });
    },
  });

  const handleSave = () => {
    updateSettings.mutate({ navMenu: JSON.stringify(menuItems) });
  };

  const handleAdd = (parentItemId?: string, grandParentItemId?: string) => {
    setEditingItem(null);
    setParentId(parentItemId || null);
    setGrandParentId(grandParentItemId || null);
    setForm({ label: '', url: '', type: 'internal', visible: true });
    setIsModalOpen(true);
  };

  const handleEdit = (item: MenuItem, parentItemId?: string, grandParentItemId?: string) => {
    setEditingItem(item);
    setParentId(parentItemId || null);
    setGrandParentId(grandParentItemId || null);
    setForm({ label: item.label, url: item.url, type: item.type, visible: item.visible !== false });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, parentItemId?: string, grandParentItemId?: string) => {
    if (grandParentItemId) {
      // 删除三级菜单
      setMenuItems(menuItems.map(item => 
        item.id === parentItemId 
          ? { 
              ...item, 
              children: item.children?.map(child =>
                child.id === grandParentItemId
                  ? { ...child, children: child.children?.filter(c => c.id !== id) }
                  : child
              )
            }
          : item
      ));
    } else if (parentItemId) {
      // 删除二级菜单
      setMenuItems(menuItems.map(item => 
        item.id === parentItemId 
          ? { ...item, children: item.children?.filter(c => c.id !== id) }
          : item
      ));
    } else {
      // 删除一级菜单
      setMenuItems(menuItems.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: MenuItem = {
      id: editingItem?.id || Date.now().toString(),
      ...form,
      sortOrder: 0,
    };

    if (grandParentId) {
      // 添加/编辑三级菜单
      setMenuItems(menuItems.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            children: item.children?.map(child => {
              if (child.id === grandParentId) {
                if (editingItem) {
                  return {
                    ...child,
                    children: child.children?.map(c => c.id === editingItem.id ? newItem : c),
                  };
                } else {
                  return {
                    ...child,
                    children: [...(child.children || []), newItem],
                  };
                }
              }
              return child;
            }),
          };
        }
        return item;
      }));
    } else if (parentId) {
      // 添加/编辑二级菜单
      setMenuItems(menuItems.map(item => {
        if (item.id === parentId) {
          if (editingItem) {
            return {
              ...item,
              children: item.children?.map(c => c.id === editingItem.id ? newItem : c),
            };
          } else {
            return {
              ...item,
              children: [...(item.children || []), newItem],
            };
          }
        }
        return item;
      }));
    } else {
      // 添加/编辑顶级菜单
      if (editingItem) {
        setMenuItems(menuItems.map(item => 
          item.id === editingItem.id ? { ...item, ...form } : item
        ));
      } else {
        setMenuItems([...menuItems, { ...newItem, sortOrder: menuItems.length }]);
      }
    }
    setIsModalOpen(false);
  };

  const toggleVisibility = (id: string, parentItemId?: string, grandParentItemId?: string) => {
    if (grandParentItemId) {
      // 切换三级菜单可见性
      setMenuItems(menuItems.map(item => {
        if (item.id === parentItemId) {
          return {
            ...item,
            children: item.children?.map(child => {
              if (child.id === grandParentItemId) {
                return {
                  ...child,
                  children: child.children?.map(c => 
                    c.id === id ? { ...c, visible: c.visible === false ? true : false } : c
                  ),
                };
              }
              return child;
            }),
          };
        }
        return item;
      }));
    } else if (parentItemId) {
      // 切换二级菜单可见性
      setMenuItems(menuItems.map(item => {
        if (item.id === parentItemId) {
          return {
            ...item,
            children: item.children?.map(c => 
              c.id === id ? { ...c, visible: c.visible === false ? true : false } : c
            ),
          };
        }
        return item;
      }));
    } else {
      // 切换一级菜单可见性
      setMenuItems(menuItems.map(item => 
        item.id === id ? { ...item, visible: item.visible === false ? true : false } : item
      ));
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down', parentItemId?: string, grandParentItemId?: string) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (grandParentItemId) {
      // 移动三级菜单
      setMenuItems(menuItems.map(item => {
        if (item.id === parentItemId) {
          return {
            ...item,
            children: item.children?.map(child => {
              if (child.id === grandParentItemId && child.children) {
                const newChildren = [...child.children];
                if (targetIndex < 0 || targetIndex >= newChildren.length) return child;
                [newChildren[index], newChildren[targetIndex]] = [newChildren[targetIndex], newChildren[index]];
                return { ...child, children: newChildren };
              }
              return child;
            }),
          };
        }
        return item;
      }));
    } else if (parentItemId) {
      // 移动二级菜单
      setMenuItems(menuItems.map(item => {
        if (item.id === parentItemId && item.children) {
          const newChildren = [...item.children];
          if (targetIndex < 0 || targetIndex >= newChildren.length) return item;
          [newChildren[index], newChildren[targetIndex]] = [newChildren[targetIndex], newChildren[index]];
          return { ...item, children: newChildren };
        }
        return item;
      }));
    } else {
      // 移动一级菜单
      const newItems = [...menuItems];
      if (targetIndex < 0 || targetIndex >= newItems.length) return;
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      newItems.forEach((item, i) => item.sortOrder = i);
      setMenuItems(newItems);
    }
  };

  // 显示在导航的页面
  const navPages = pages?.filter(p => p.showInNav) || [];

  const renderMenuItem = (item: MenuItem, index: number, parentItemId?: string, grandParentId?: string) => {
    const level = grandParentId ? 2 : parentItemId ? 1 : 0;
    const bgClass = level === 0 ? 'bg-gray-50 dark:bg-gray-800' : level === 1 ? 'pl-10 bg-gray-50/50 dark:bg-gray-800/30' : 'pl-16 bg-gray-50/30 dark:bg-gray-800/20';
    const parentItems = grandParentId 
      ? menuItems.find(m => m.id === parentItemId)?.children?.find(c => c.id === grandParentId)?.children 
      : parentItemId 
        ? menuItems.find(m => m.id === parentItemId)?.children 
        : menuItems;
    const itemCount = parentItems?.length || 0;

    return (
      <div key={item.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
        <div className={`flex items-center gap-4 p-3 ${bgClass} rounded-lg ${item.visible === false ? 'opacity-50' : ''}`}>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => moveItem(index, 'up', parentItemId, grandParentId)}
              disabled={index === 0}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
            >
              ▲
            </button>
            <button
              onClick={() => moveItem(index, 'down', parentItemId, grandParentId)}
              disabled={index === itemCount - 1}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
            >
              ▼
            </button>
          </div>
          <div className="flex-1">
            <div className="font-medium flex items-center gap-2">
              {level > 0 && <span className="text-gray-400">{'└'.repeat(level)}</span>}
              {item.label}
              {item.visible === false && <span className="text-xs text-gray-400">(隐藏)</span>}
            </div>
            <div className="text-sm text-gray-500">{item.url}</div>
          </div>
          <Badge variant={item.type === 'external' ? 'warning' : item.type === 'category' ? 'primary' : 'default'}>
            {item.type === 'internal' ? '内部' : item.type === 'external' ? '外部' : item.type === 'category' ? '分类' : '页面'}
          </Badge>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleVisibility(item.id, parentItemId, grandParentId)}
              className={item.visible === false ? 'text-green-600' : 'text-gray-500'}
            >
              {item.visible === false ? '显示' : '隐藏'}
            </Button>
            {level < 2 && (
              <Button variant="ghost" size="sm" onClick={() => handleAdd(parentItemId || item.id, parentItemId ? item.id : undefined)}>
                添加子菜单
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => handleEdit(item, parentItemId, grandParentId)}>编辑</Button>
            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(item.id, parentItemId, grandParentId)}>删除</Button>
          </div>
        </div>
        {item.children && item.children.length > 0 && (
          <div className="ml-4">
            {item.children.map((child, childIndex) => renderMenuItem(child, childIndex, parentItemId || item.id, parentItemId ? item.id : undefined))}
          </div>
        )}
      </div>
    );
  };

  // 显示加载状态
  if (settingsLoading || pagesLoading) {
    return <div className="text-center py-8 text-gray-500">加载中...</div>;
  }

  // 显示错误状态
  if (settingsError || pagesError) {
    return (
      <div className="p-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
        加载失败: {((settingsError || pagesError) as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-3 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">导航菜单</h2>
              <p className="text-sm text-gray-500 mt-1">支持三级菜单，点击"添加子菜单"创建下拉菜单</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleAdd()}>添加菜单项</Button>
              <Button onClick={handleSave} loading={updateSettings.isPending}>保存菜单</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {menuItems.map((item, index) => renderMenuItem(item, index))}
          </div>
        </CardContent>
      </Card>

      {navPages.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">显示在导航的页面</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              以下页面已设置"显示在导航"，你可以将它们添加到上方的导航菜单中：
            </p>
            <div className="flex flex-wrap gap-2">
              {navPages.map(page => (
                <Button
                  key={page.id}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const exists = menuItems.some(item => item.url === `/page/${page.slug}`);
                    if (!exists) {
                      setMenuItems([...menuItems, {
                        id: Date.now().toString(),
                        label: page.title,
                        url: `/page/${page.slug}`,
                        type: 'page',
                        sortOrder: menuItems.length,
                      }]);
                    }
                  }}
                >
                  + {page.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          💡 提示：修改菜单后需要点击"保存菜单"按钮，刷新博客前台页面即可看到效果。
        </p>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? '编辑菜单项' : (grandParentId ? '添加三级菜单' : parentId ? '添加二级菜单' : '添加菜单项')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="显示名称"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            required
          />
          <Select
            label="链接类型"
            value={form.type}
            onChange={(e) => {
              const newType = e.target.value as MenuItem['type'];
              setForm({ ...form, type: newType, url: '' });
            }}
            options={[
              { value: 'internal', label: '内部链接' },
              { value: 'external', label: '外部链接' },
              { value: 'page', label: '独立页面' },
              { value: 'category', label: '文章分类' },
            ]}
          />
          {form.type === 'page' && pages && pages.length > 0 ? (
            <Select
              label="选择页面"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              options={[
                { value: '', label: '-- 请选择页面 --' },
                ...pages.map(p => ({ value: `/page/${p.slug}`, label: p.title })),
              ]}
            />
          ) : form.type === 'category' && categories && categories.length > 0 ? (
            <Select
              label="选择分类"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              options={[
                { value: '', label: '-- 请选择分类 --' },
                ...buildCategoryOptions(categories),
              ]}
            />
          ) : (
            <Input
              label="链接地址"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder={form.type === 'external' ? 'https://example.com' : '/path'}
              required
            />
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>取消</Button>
            <Button type="submit">保存</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// 构建层级分类选项
function buildCategoryOptions(
  categories: Array<{ id: string; name: string; parentId?: string | null }>,
  parentId: string | null = null,
  level: number = 0
): { value: string; label: string }[] {
  const result: { value: string; label: string }[] = [];
  const prefix = level > 0 ? '　'.repeat(level) + '└ ' : '';

  const items = categories.filter((c) => (c.parentId || null) === parentId);

  for (const item of items) {
    result.push({ value: `/?category=${item.id}`, label: prefix + item.name });
    const children = buildCategoryOptions(categories, item.id, level + 1);
    result.push(...children);
  }

  return result;
}


// 幻灯片设置
interface SliderItem {
  id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  sortOrder: number;
}

function SliderSettings() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => api.get<Record<string, string>>('/settings'),
  });

  const [sliderEnabled, setSliderEnabled] = useState(true);
  const [sliderStyle, setSliderStyle] = useState<'full' | 'cards' | 'minimal'>('full');
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SliderItem | null>(null);
  const [form, setForm] = useState({ title: '', description: '', image: '', link: '' });

  useEffect(() => {
    if (settings) {
      setSliderEnabled(settings.sliderEnabled !== 'false');
      setSliderStyle((settings.sliderStyle as 'full' | 'cards' | 'minimal') || 'full');
      if (settings.sliderItems) {
        try {
          setSliderItems(JSON.parse(settings.sliderItems));
        } catch {
          // ignore
        }
      }
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: (data: Record<string, string>) => api.put('/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      setMessage({ type: 'success', text: '幻灯片设置保存成功' });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: Error) => {
      setMessage({ type: 'error', text: error.message || '保存失败' });
    },
  });

  const handleSave = () => {
    updateSettings.mutate({
      sliderEnabled: String(sliderEnabled),
      sliderStyle,
      sliderItems: JSON.stringify(sliderItems),
    });
  };

  const handleAdd = () => {
    setEditingItem(null);
    setForm({ title: '', description: '', image: '', link: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (item: SliderItem) => {
    setEditingItem(item);
    setForm({ title: item.title, description: item.description || '', image: item.image, link: item.link || '' });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setSliderItems(sliderItems.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setSliderItems(sliderItems.map(item => 
        item.id === editingItem.id ? { ...item, ...form } : item
      ));
    } else {
      setSliderItems([...sliderItems, {
        id: Date.now().toString(),
        ...form,
        sortOrder: sliderItems.length,
      }]);
    }
    setIsModalOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.upload<{ url: string }>('/media/upload', formData);
      setForm({ ...form, image: response.url });
    } catch (err) {
      const error = err as Error;
      setMessage({ type: 'error', text: error.message || '上传失败' });
    } finally {
      setUploading(false);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...sliderItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setSliderItems(newItems);
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-3 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">首页幻灯片</h2>
              <p className="text-sm text-gray-500 mt-1">设置首页顶部的轮播海报</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleAdd}>添加幻灯片</Button>
              <Button onClick={handleSave} loading={updateSettings.isPending}>保存设置</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sliderEnabled}
                onChange={(e) => setSliderEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span>启用幻灯片</span>
            </label>
            <Select
              label="展示样式"
              value={sliderStyle}
              onChange={(e) => setSliderStyle(e.target.value as 'full' | 'cards' | 'minimal')}
              options={[
                { value: 'full', label: '全宽轮播' },
                { value: 'cards', label: '卡片网格' },
                { value: 'minimal', label: '简约横幅' },
              ]}
            />
          </div>

          {sliderItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无幻灯片，点击"添加幻灯片"开始创建
            </div>
          ) : (
            <div className="space-y-3">
              {sliderItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▲</button>
                    <button onClick={() => moveItem(index, 'down')} disabled={index === sliderItems.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▼</button>
                  </div>
                  <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.title}</div>
                    {item.description && <div className="text-sm text-gray-500 truncate">{item.description}</div>}
                    {item.link && <div className="text-xs text-primary-600 truncate">{item.link}</div>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>编辑</Button>
                    <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(item.id)}>删除</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? '编辑幻灯片' : '添加幻灯片'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="描述（可选）" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">图片</label>
            <div className="flex gap-2">
              <Input 
                value={form.image} 
                onChange={(e) => setForm({ ...form, image: e.target.value })} 
                placeholder="输入图片地址或上传本地图片" 
                className="flex-1"
              />
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <span className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {uploading ? '上传中...' : '上传'}
                </span>
              </label>
            </div>
            {form.image && (
              <div className="mt-2">
                <img src={form.image} alt="预览" className="h-24 rounded object-cover" />
              </div>
            )}
          </div>
          <Input label="链接地址（可选）" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="点击跳转的链接" />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>取消</Button>
            <Button type="submit">保存</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// SEO 优化设置
function SEOSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">SEO 优化说明</h2>
          <p className="text-sm text-gray-500 mt-1">
            本博客使用 Next.js 服务端渲染，搜索引擎可以直接抓取完整内容
          </p>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none text-sm">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                SEO 已自动优化
              </div>
              <p className="text-green-600 dark:text-green-300 text-sm">
                Next.js 服务端渲染确保搜索引擎爬虫可以获取完整的页面内容和元数据，无需额外配置。
              </p>
            </div>
            
            <h3 className="text-base font-medium mt-4 mb-2">自动包含的 SEO 优化：</h3>
            <ul className="space-y-1">
              <li>✓ 完整的 meta 标签（title, description, keywords）</li>
              <li>✓ Open Graph 标签（社交分享优化）</li>
              <li>✓ 服务端渲染的完整 HTML 内容</li>
              <li>✓ 语义化 HTML 结构</li>
              <li>✓ 自动生成的 sitemap</li>
            </ul>

            <h3 className="text-base font-medium mt-6 mb-2">SEO 最佳实践：</h3>
            <ul className="space-y-1">
              <li>• 在"网站设置"中填写完整的网站名称和描述</li>
              <li>• 为每篇文章添加有意义的标题和摘要</li>
              <li>• 使用合适的分类和标签组织内容</li>
              <li>• 为文章添加特色图片提升社交分享效果</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 帮助中心
function HelpCenter() {
  const [activeSection, setActiveSection] = useState<'theme' | 'plugin'>('theme');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">开发者文档</h2>
          <p className="text-sm text-gray-500">了解如何开发自定义主题和插件</p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveSection('theme')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'theme' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              主题开发
            </button>
            <button
              onClick={() => setActiveSection('plugin')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'plugin' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              插件开发
            </button>
          </div>

          {activeSection === 'theme' && (
            <div className="prose dark:prose-invert max-w-none">
              <h3>主题开发指南</h3>
              <p>NextBlog 支持自定义主题，每个主题是一个独立的 React 组件集合。</p>
              
              <h4>1. 主题结构</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`packages/web/src/themes/your-theme/
├── index.tsx      # 主题入口文件
└── styles.css     # 可选的样式文件`}
              </pre>

              <h4>2. 主题接口</h4>
              <p>每个主题需要导出以下组件：</p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`export interface ThemeComponents {
  name: string;           // 主题标识
  displayName: string;    // 显示名称
  description: string;    // 主题描述
  configOptions: ThemeConfigOption[];  // 配置选项
  defaultConfig: ThemeConfig;          // 默认配置
  BlogLayout: React.FC;   // 布局组件
  ArticleCard: React.FC;  // 文章卡片
  ArticleDetail: React.FC; // 文章详情
  CategoryList: React.FC; // 分类列表
  TagList: React.FC;      // 标签列表
  SearchResults: React.FC; // 搜索结果
}`}
              </pre>

              <h4>3. 获取站点设置和导航菜单</h4>
              <p>在主题组件中使用 <code>useSiteSettingsContext</code> 获取站点设置和导航菜单数据：</p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { useSiteSettingsContext } from '@/contexts/site-settings-context';

function BlogLayout({ children, config }) {
  // 从 Context 获取设置和导航菜单（SSR 安全）
  const { settings, navMenu } = useSiteSettingsContext();
  
  const siteName = settings.siteName || 'NextBlog';
  const footerText = settings.footerText?.replace(
    '{year}', 
    new Date().getFullYear().toString()
  );

  return (
    <div>
      <header>
        <h1>{siteName}</h1>
        <DesktopNavMenu items={navMenu} />
      </header>
      <main>{children}</main>
      <footer>{footerText}</footer>
    </div>
  );
}`}
              </pre>
              <p className="text-amber-600 dark:text-amber-400">
                ⚠️ 注意：不要在主题组件中使用 <code>useSiteSettingsStore</code>，
                这会导致 SSR 水合错误。始终使用 <code>useSiteSettingsContext</code>。
              </p>

              <h4>4. 配置选项</h4>
              <p>主题可以定义可配置的选项，用户可以在后台自定义：</p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`const configOptions: ThemeConfigOption[] = [
  {
    key: 'primaryColor',
    label: '主题色',
    type: 'select',
    options: [
      { value: 'blue', label: '蓝色' },
      { value: 'green', label: '绿色' },
    ],
    default: 'blue',
    description: '主题的主要颜色',
  },
  {
    key: 'showSidebar',
    label: '显示侧边栏',
    type: 'boolean',
    default: true,
  },
];`}
              </pre>

              <h4>5. 使用主题配置</h4>
              <p>组件通过 <code>config</code> 属性接收主题配置：</p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`function ArticleCard({ article, config }) {
  // 使用配置值
  const showImage = config.showFeaturedImage !== false;
  const colorClass = colorClasses[config.primaryColor];
  
  return (
    <article className={colorClass}>
      {showImage && article.featuredImage && (
        <img src={article.featuredImage} alt={article.title} />
      )}
      <h2>{article.title}</h2>
    </article>
  );
}`}
              </pre>

              <h4>6. 注册主题</h4>
              <p>在 <code>packages/web/src/themes/index.ts</code> 中注册你的主题：</p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { YourTheme } from './your-theme';

export const themes: Record<string, ThemeComponents> = {
  classic: ClassicTheme,
  minimal: MinimalTheme,
  magazine: MagazineTheme,
  'your-theme': YourTheme,  // 添加你的主题
};`}
              </pre>

              <h4>7. 示例主题</h4>
              <p>参考现有主题的实现：</p>
              <ul>
                <li><code>classic</code> - 经典两栏布局，支持侧边栏、作者卡片、快速链接</li>
                <li><code>minimal</code> - 极简风格，大量留白，专注阅读</li>
                <li><code>magazine</code> - 杂志风格，大图卡片网格，渐变配色</li>
              </ul>
            </div>
          )}

          {activeSection === 'plugin' && (
            <div className="prose dark:prose-invert max-w-none">
              <h3>插件开发指南</h3>
              <p>NextBlog 插件系统允许你扩展博客功能。</p>
              
              <h4>1. 插件结构</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`plugins/your-plugin/
├── package.json   # 插件元信息
├── index.ts       # 插件入口
├── server/        # 后端代码（可选）
│   └── routes.ts
└── client/        # 前端代码（可选）
    └── components.tsx`}
              </pre>

              <h4>2. 插件元信息 (package.json)</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "name": "your-plugin",
  "version": "1.0.0",
  "description": "插件描述",
  "main": "index.ts",
  "nextblog": {
    "hooks": ["beforePublish", "afterPublish"],
    "settings": [
      {
        "key": "apiKey",
        "label": "API Key",
        "type": "string"
      }
    ]
  }
}`}
              </pre>

              <h4>3. 可用钩子</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b">钩子名称</th>
                    <th className="text-left p-2 border-b">触发时机</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="p-2 border-b">beforePublish</td><td className="p-2 border-b">文章发布前</td></tr>
                  <tr><td className="p-2 border-b">afterPublish</td><td className="p-2 border-b">文章发布后</td></tr>
                  <tr><td className="p-2 border-b">beforeSave</td><td className="p-2 border-b">保存前</td></tr>
                  <tr><td className="p-2 border-b">afterSave</td><td className="p-2 border-b">保存后</td></tr>
                  <tr><td className="p-2 border-b">onComment</td><td className="p-2 border-b">收到评论时</td></tr>
                  <tr><td className="p-2 border-b">onPageView</td><td className="p-2 border-b">页面访问时</td></tr>
                </tbody>
              </table>

              <h4>4. 插件入口示例</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// index.ts
export default {
  name: 'your-plugin',
  
  // 插件激活时调用
  activate(context) {
    console.log('Plugin activated');
  },
  
  // 插件停用时调用
  deactivate() {
    console.log('Plugin deactivated');
  },
  
  // 钩子处理
  hooks: {
    async beforePublish(article) {
      // 在文章发布前执行
      return article;
    },
    
    async afterPublish(article) {
      // 在文章发布后执行
      // 例如：推送到第三方平台
    },
  },
};`}
              </pre>

              <h4>5. 添加后端路由</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// server/routes.ts
import { Router } from 'express';

export function registerRoutes(router: Router) {
  router.get('/your-plugin/data', async (req, res) => {
    res.json({ message: 'Hello from plugin' });
  });
}`}
              </pre>

              <h4>6. 安装插件</h4>
              <p>将插件文件夹放入 <code>plugins/</code> 目录，然后在后台"插件管理"中启用。</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">常见问题</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <details className="group">
              <summary className="cursor-pointer font-medium p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">如何备份数据？</summary>
              <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
                数据库文件位于 <code>packages/server/prisma/dev.db</code>（开发环境）或 <code>prod.db</code>（生产环境）。
                定期复制此文件即可完成备份。上传的媒体文件位于 <code>packages/server/uploads/</code> 目录。
              </div>
            </details>
            <details className="group">
              <summary className="cursor-pointer font-medium p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">如何修改端口？</summary>
              <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
                修改 <code>packages/server/.env</code> 中的 <code>PORT</code> 变量，以及 <code>packages/web/vite.config.ts</code> 中的代理配置。
              </div>
            </details>
            <details className="group">
              <summary className="cursor-pointer font-medium p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">如何配置反向代理？</summary>
              <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
                参考 <code>docs/DEPLOYMENT.md</code> 中的 Nginx 或 Caddy 配置示例。记得设置 <code>ALLOWED_ORIGINS</code> 环境变量。
              </div>
            </details>
            <details className="group">
              <summary className="cursor-pointer font-medium p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">忘记管理员密码怎么办？</summary>
              <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
                运行 <code>npm run db:seed</code> 重置管理员账户为默认密码 <code>admin123</code>。
              </div>
            </details>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">相关链接</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="https://github.com/inspoaibox/Next-blog" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <span className="text-2xl">📦</span>
              <div>
                <div className="font-medium">GitHub 仓库</div>
                <div className="text-sm text-gray-500">查看源代码</div>
              </div>
            </a>
            <a href="https://github.com/inspoaibox/Next-blog/issues" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <span className="text-2xl">🐛</span>
              <div>
                <div className="font-medium">问题反馈</div>
                <div className="text-sm text-gray-500">报告 Bug 或建议</div>
              </div>
            </a>
            <a href="https://github.com/inspoaibox/Next-blog/discussions" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <span className="text-2xl">💬</span>
              <div>
                <div className="font-medium">社区讨论</div>
                <div className="text-sm text-gray-500">交流与分享</div>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
