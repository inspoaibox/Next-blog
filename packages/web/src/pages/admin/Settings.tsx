import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { AIModel } from '../../types';
import { themes } from '../../themes';
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
  const [activeTab, setActiveTab] = useState<'site' | 'menu' | 'security' | 'ai' | 'theme' | 'plugin'>('site');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">系统设置</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'site', label: '网站设置' },
          { key: 'menu', label: '菜单管理' },
          { key: 'security', label: '安全设置' },
          { key: 'ai', label: 'AI 模型' },
          { key: 'theme', label: '主题设置' },
          { key: 'plugin', label: '插件管理' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
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
      {activeTab === 'security' && <SecuritySettings />}
      {activeTab === 'ai' && <AIModelSettings />}
      {activeTab === 'theme' && <ThemeSettings />}
      {activeTab === 'plugin' && <PluginSettings />}
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
    onError: (error: any) => {
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
    onError: (error: any) => {
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

function ThemeSettings() {
  const queryClient = useQueryClient();

  const { data: dbThemes, isLoading } = useQuery({
    queryKey: ['themes'],
    queryFn: () => api.get<any[]>('/themes'),
  });

  const activateTheme = useMutation({
    mutationFn: (id: string) => api.put(`/themes/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    },
  });

  const updateThemeConfig = useMutation({
    mutationFn: ({ id, config }: { id: string; config: any }) => 
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
  const currentConfig = activeTheme?.config ? JSON.parse(activeTheme.config) : {};
  const mergedConfig = { ...(activeThemeData?.defaultConfig || {}), ...currentConfig };

  const handleConfigChange = (key: string, value: any) => {
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
              {activeThemeData.configOptions.map((option: any) => (
                <div key={option.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {option.label}
                  </label>
                  
                  {option.type === 'select' && (
                    <select
                      value={mergedConfig[option.key] || option.default}
                      onChange={(e) => handleConfigChange(option.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
                    >
                      {option.options?.map((opt: any) => (
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

function PluginSettings() {
  const queryClient = useQueryClient();
  const { data: plugins } = useQuery({
    queryKey: ['plugins'],
    queryFn: () => api.get<any[]>('/plugins'),
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
  type: 'internal' | 'external' | 'page';
  sortOrder: number;
}

function MenuSettings() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => api.get<Record<string, string>>('/settings'),
  });

  const { data: pages } = useQuery({
    queryKey: ['pages'],
    queryFn: () => api.get<any[]>('/pages'),
  });

  // 默认菜单
  const defaultMenu: MenuItem[] = [
    { id: '1', label: '首页', url: '/', type: 'internal', sortOrder: 0 },
    { id: '2', label: '分类', url: '/categories', type: 'internal', sortOrder: 1 },
    { id: '3', label: '标签', url: '/tags', type: 'internal', sortOrder: 2 },
    { id: '4', label: '知识库', url: '/knowledge', type: 'internal', sortOrder: 3 },
    { id: '5', label: '搜索', url: '/search', type: 'internal', sortOrder: 4 },
  ];

  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenu);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({ label: '', url: '', type: 'internal' as MenuItem['type'] });

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
    onError: (error: any) => {
      setMessage({ type: 'error', text: error.message || '保存失败' });
    },
  });

  const handleSave = () => {
    updateSettings.mutate({ navMenu: JSON.stringify(menuItems) });
  };

  const handleAdd = () => {
    setEditingItem(null);
    setForm({ label: '', url: '', type: 'internal' });
    setIsModalOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({ label: item.label, url: item.url, type: item.type });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setMenuItems(menuItems.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...form }
          : item
      ));
    } else {
      const newItem: MenuItem = {
        id: Date.now().toString(),
        ...form,
        sortOrder: menuItems.length,
      };
      setMenuItems([...menuItems, newItem]);
    }
    setIsModalOpen(false);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...menuItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    newItems.forEach((item, i) => item.sortOrder = i);
    setMenuItems(newItems);
  };

  // 显示在导航的页面
  const navPages = pages?.filter(p => p.showInNav) || [];

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
            <h2 className="text-lg font-semibold">导航菜单</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleAdd}>添加菜单项</Button>
              <Button onClick={handleSave} loading={updateSettings.isPending}>保存菜单</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === menuItems.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-gray-500">{item.url}</div>
                </div>
                <Badge variant={item.type === 'external' ? 'warning' : 'default'}>
                  {item.type === 'internal' ? '内部链接' : item.type === 'external' ? '外部链接' : '页面'}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>编辑</Button>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(item.id)}>删除</Button>
                </div>
              </div>
            ))}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? '编辑菜单项' : '添加菜单项'}>
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
            onChange={(e) => setForm({ ...form, type: e.target.value as MenuItem['type'] })}
            options={[
              { value: 'internal', label: '内部链接' },
              { value: 'external', label: '外部链接' },
              { value: 'page', label: '独立页面' },
            ]}
          />
          <Input
            label="链接地址"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder={form.type === 'external' ? 'https://example.com' : '/path'}
            required
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>取消</Button>
            <Button type="submit">保存</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
