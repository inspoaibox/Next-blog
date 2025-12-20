import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { AIModel } from '../../types';
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
} from '../../components/ui';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'security' | 'ai' | 'theme' | 'plugin'>('security');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">系统设置</h1>

      <div className="flex gap-2 mb-6">
        {[
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

      {activeTab === 'security' && <SecuritySettings />}
      {activeTab === 'ai' && <AIModelSettings />}
      {activeTab === 'theme' && <ThemeSettings />}
      {activeTab === 'plugin' && <PluginSettings />}
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
  const { data: themes } = useQuery({
    queryKey: ['themes'],
    queryFn: () => api.get<any[]>('/themes'),
  });

  const activateTheme = useMutation({
    mutationFn: (id: string) => api.put(`/themes/${id}/activate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['themes'] }),
  });

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">主题设置</h2>
      </CardHeader>
      <CardContent>
        {!themes?.length ? (
          <div className="text-center text-gray-500 py-8">暂无可用主题</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`p-4 border rounded-lg ${
                  theme.isActive
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <h3 className="font-medium mb-2">{theme.name}</h3>
                <p className="text-sm text-gray-500 mb-4">版本: {theme.version}</p>
                {theme.isActive ? (
                  <Badge variant="primary">当前使用</Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => activateTheme.mutate(theme.id)}
                  >
                    激活
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
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
