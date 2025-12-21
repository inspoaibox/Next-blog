import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Page } from '../../types';
import {
  Button,
  Card,
  CardContent,
  Input,
  Modal,
  Textarea,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui';
import { formatDate } from '../../lib/utils';
import { Plus, Trash2 } from 'lucide-react';

const BUILTIN_PAGES = [
  { key: 'about', name: '关于页面', path: '/about' },
  { key: 'projects', name: '项目页面', path: '/projects' },
  { key: 'friends', name: '友链页面', path: '/friends' },
];

const TEMPLATES = [
  { value: 'standard', label: '标准布局' },
  { value: 'fullwidth', label: '全宽布局' },
  { value: 'sidebar', label: '侧边栏布局' },
];

export function PagesPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom'>('builtin');
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [aboutContent, setAboutContent] = useState('');
  
  const { data: pages, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: () => api.get<Page[]>('/pages'),
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get<Record<string, string>>('/settings'),
  });

  const updateSetting = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      api.put('/settings', { key, value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const togglePageEnabled = (pageKey: string) => {
    const key = `${pageKey}PageEnabled`;
    const current = settings?.[key] !== 'false';
    updateSetting.mutate({ key, value: current ? 'false' : 'true' });
  };

  const updateTemplate = (pageKey: string, template: string) => {
    updateSetting.mutate({ key: `${pageKey}PageTemplate`, value: template });
  };

  const openAboutEditor = () => {
    setAboutContent(settings?.aboutPageContent || '');
    setAboutModalOpen(true);
  };

  const createPage = useMutation({
    mutationFn: (data: Partial<Page>) => api.post<Page>('/pages', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message || '创建失败');
    },
  });

  const updatePage = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Page> }) =>
      api.put<Page>(`/pages/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message || '更新失败');
    },
  });

  const deletePage = useMutation({
    mutationFn: (id: string) => api.delete(`/pages/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    showInNav: false,
    sortOrder: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!form.title.trim()) {
      setError('标题不能为空');
      return;
    }
    
    try {
      if (editingId) {
        await updatePage.mutateAsync({ id: editingId, data: form });
      } else {
        await createPage.mutateAsync(form);
      }
      closeModal();
    } catch (err) {
      // 错误已在 mutation 的 onError 中处理
      console.error('保存失败:', err);
    }
  };

  const handleEdit = (page: Page) => {
    setEditingId(page.id);
    setForm({
      title: page.title,
      slug: page.slug,
      content: page.content,
      showInNav: page.showInNav,
      sortOrder: page.sortOrder,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个页面吗？')) {
      await deletePage.mutateAsync(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ title: '', slug: '', content: '', showInNav: false, sortOrder: 0 });
    setError(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">页面管理</h1>
        <Button onClick={() => setIsModalOpen(true)}>新建页面</Button>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('builtin')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'builtin'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          内置页面
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'custom'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          自定义页面
        </button>
      </div>

      {activeTab === 'builtin' ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>页面</TableHead>
                  <TableHead>路径</TableHead>
                  <TableHead>模板</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {BUILTIN_PAGES.map((page) => {
                  const enabled = settings?.[`${page.key}PageEnabled`] !== 'false';
                  const template = settings?.[`${page.key}PageTemplate`] || 'standard';
                  return (
                    <TableRow key={page.key}>
                      <TableCell className="font-medium">{page.name}</TableCell>
                      <TableCell className="text-gray-500">{page.path}</TableCell>
                      <TableCell>
                        <select
                          value={template}
                          onChange={(e) => updateTemplate(page.key, e.target.value)}
                          className="px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
                        >
                          {TEMPLATES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={enabled ? 'success' : 'default'}>
                          {enabled ? '已启用' : '已禁用'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePageEnabled(page.key)}
                          >
                            {enabled ? '禁用' : '启用'}
                          </Button>
                          {page.key === 'about' && (
                            <Button variant="ghost" size="sm" onClick={openAboutEditor}>
                              编辑内容
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">加载中...</div>
            ) : !pages?.length ? (
              <div className="p-8 text-center text-gray-500">暂无页面</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标题</TableHead>
                    <TableHead>链接</TableHead>
                    <TableHead>导航</TableHead>
                    <TableHead>排序</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell className="text-gray-500">/{page.slug}</TableCell>
                      <TableCell>
                        {page.showInNav && <Badge variant="primary">显示</Badge>}
                      </TableCell>
                      <TableCell>{page.sortOrder}</TableCell>
                      <TableCell>{formatDate(page.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(page)}>
                            编辑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(page.id)}
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
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? '编辑页面' : '新建页面'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}
          <Input
            label="标题"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Input
            label="链接"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="留空自动生成"
          />
          <Textarea
            label="内容 (Markdown)"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="min-h-[200px]"
          />
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 whitespace-nowrap">
              <input
                type="checkbox"
                checked={form.showInNav}
                onChange={(e) => setForm({ ...form, showInNav: e.target.checked })}
                className="rounded"
              />
              <span>显示在导航</span>
            </label>
            <div className="w-24">
              <Input
                label="排序"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              取消
            </Button>
            <Button type="submit" loading={createPage.isPending || updatePage.isPending}>
              保存
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={aboutModalOpen} onClose={() => setAboutModalOpen(false)} title="编辑关于页面" size="xl">
        <AboutPageEditor
          content={aboutContent}
          onChange={setAboutContent}
          onSave={() => {
            updateSetting.mutate({ key: 'aboutPageContent', value: aboutContent });
            setAboutModalOpen(false);
          }}
          onCancel={() => setAboutModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

// 关于页面编辑器组件
interface AboutConfig {
  name?: string;
  avatar?: string;
  slogan?: string;
  location?: string;
  joinDate?: string;
  email?: string;
  github?: string;
  twitter?: string;
  bio?: string;
  skills?: Array<{ category: string; icon: string; items: string[] }>;
  timeline?: Array<{ year: string; title: string; company: string; description: string; type: 'work' | 'education' }>;
  hobbies?: Array<{ name: string; description: string; icon: string }>;
  stats?: Array<{ value: string; label: string }>;
}

const defaultAboutConfig: AboutConfig = {
  name: '博主名称',
  slogan: '"代码是写给人看的，顺便给机器执行。"',
  location: '中国',
  joinDate: '2024',
  bio: '你好！欢迎来到我的博客。这里记录着我的技术探索和生活感悟。',
  skills: [
    { category: 'Frontend', icon: 'code', items: ['React', 'Next.js', 'TypeScript'] },
    { category: 'Backend', icon: 'terminal', items: ['Node.js', 'Go', 'PostgreSQL'] },
  ],
  timeline: [],
  hobbies: [
    { name: '咖啡', description: '寻找城市中最好喝的咖啡', icon: 'coffee' },
  ],
  stats: [
    { value: '10+', label: '开源项目' },
    { value: '50+', label: '文章发布' },
  ],
};

function AboutPageEditor({
  content,
  onChange,
  onSave,
  onCancel,
}: {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'basic' | 'skills' | 'timeline' | 'hobbies' | 'stats'>('basic');
  
  // 解析配置
  let config: AboutConfig = defaultAboutConfig;
  try {
    if (content) {
      config = { ...defaultAboutConfig, ...JSON.parse(content) };
    }
  } catch {
    // 向后兼容：如果是纯文本，作为 bio
    if (content && !content.startsWith('{')) {
      config = { ...defaultAboutConfig, bio: content };
    }
  }

  const updateConfig = (updates: Partial<AboutConfig>) => {
    const newConfig = { ...config, ...updates };
    onChange(JSON.stringify(newConfig, null, 2));
  };

  const tabs = [
    { key: 'basic', label: '基本信息' },
    { key: 'skills', label: '技术栈' },
    { key: 'timeline', label: '经历' },
    { key: 'hobbies', label: '兴趣爱好' },
    { key: 'stats', label: '统计数据' },
  ];

  return (
    <div className="space-y-4">
      {/* Tab 切换 */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 基本信息 */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="名称" value={config.name || ''} onChange={(e) => updateConfig({ name: e.target.value })} />
            <Input label="头像URL" value={config.avatar || ''} onChange={(e) => updateConfig({ avatar: e.target.value })} placeholder="https://..." />
          </div>
          <Input label="座右铭" value={config.slogan || ''} onChange={(e) => updateConfig({ slogan: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="位置" value={config.location || ''} onChange={(e) => updateConfig({ location: e.target.value })} />
            <Input label="加入年份" value={config.joinDate || ''} onChange={(e) => updateConfig({ joinDate: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="邮箱" value={config.email || ''} onChange={(e) => updateConfig({ email: e.target.value })} />
            <Input label="GitHub" value={config.github || ''} onChange={(e) => updateConfig({ github: e.target.value })} placeholder="https://github.com/..." />
            <Input label="Twitter" value={config.twitter || ''} onChange={(e) => updateConfig({ twitter: e.target.value })} placeholder="https://twitter.com/..." />
          </div>
          <Textarea label="个人简介" value={config.bio || ''} onChange={(e) => updateConfig({ bio: e.target.value })} className="min-h-[150px]" />
        </div>
      )}

      {/* 技术栈 */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          {config.skills?.map((skill, idx) => (
            <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={skill.category}
                  onChange={(e) => {
                    const newSkills = [...(config.skills || [])];
                    newSkills[idx] = { ...skill, category: e.target.value };
                    updateConfig({ skills: newSkills });
                  }}
                  placeholder="分类名称"
                  className="flex-1"
                />
                <select
                  value={skill.icon}
                  onChange={(e) => {
                    const newSkills = [...(config.skills || [])];
                    newSkills[idx] = { ...skill, icon: e.target.value };
                    updateConfig({ skills: newSkills });
                  }}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="code">代码</option>
                  <option value="terminal">终端</option>
                  <option value="cpu">CPU</option>
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => {
                    const newSkills = config.skills?.filter((_, i) => i !== idx);
                    updateConfig({ skills: newSkills });
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <Input
                value={skill.items.join(', ')}
                onChange={(e) => {
                  const newSkills = [...(config.skills || [])];
                  newSkills[idx] = { ...skill, items: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) };
                  updateConfig({ skills: newSkills });
                }}
                placeholder="技能列表，用逗号分隔"
              />
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => {
              updateConfig({
                skills: [...(config.skills || []), { category: '新分类', icon: 'code', items: [] }],
              });
            }}
          >
            <Plus size={16} className="mr-1" /> 添加分类
          </Button>
        </div>
      )}

      {/* 经历 */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {config.timeline?.map((item, idx) => (
            <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={item.year}
                  onChange={(e) => {
                    const newTimeline = [...(config.timeline || [])];
                    newTimeline[idx] = { ...item, year: e.target.value };
                    updateConfig({ timeline: newTimeline });
                  }}
                  placeholder="时间段"
                  className="w-40"
                />
                <select
                  value={item.type}
                  onChange={(e) => {
                    const newTimeline = [...(config.timeline || [])];
                    newTimeline[idx] = { ...item, type: e.target.value as 'work' | 'education' };
                    updateConfig({ timeline: newTimeline });
                  }}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="work">工作</option>
                  <option value="education">教育</option>
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 ml-auto"
                  onClick={() => {
                    const newTimeline = config.timeline?.filter((_, i) => i !== idx);
                    updateConfig({ timeline: newTimeline });
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={item.title}
                  onChange={(e) => {
                    const newTimeline = [...(config.timeline || [])];
                    newTimeline[idx] = { ...item, title: e.target.value };
                    updateConfig({ timeline: newTimeline });
                  }}
                  placeholder="职位/学历"
                />
                <Input
                  value={item.company}
                  onChange={(e) => {
                    const newTimeline = [...(config.timeline || [])];
                    newTimeline[idx] = { ...item, company: e.target.value };
                    updateConfig({ timeline: newTimeline });
                  }}
                  placeholder="公司/学校"
                />
              </div>
              <Textarea
                value={item.description}
                onChange={(e) => {
                  const newTimeline = [...(config.timeline || [])];
                  newTimeline[idx] = { ...item, description: e.target.value };
                  updateConfig({ timeline: newTimeline });
                }}
                placeholder="描述"
                className="min-h-[60px]"
              />
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => {
              updateConfig({
                timeline: [...(config.timeline || []), { year: '', title: '', company: '', description: '', type: 'work' }],
              });
            }}
          >
            <Plus size={16} className="mr-1" /> 添加经历
          </Button>
        </div>
      )}

      {/* 兴趣爱好 */}
      {activeTab === 'hobbies' && (
        <div className="space-y-4">
          {config.hobbies?.map((hobby, idx) => (
            <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <select
                value={hobby.icon}
                onChange={(e) => {
                  const newHobbies = [...(config.hobbies || [])];
                  newHobbies[idx] = { ...hobby, icon: e.target.value };
                  updateConfig({ hobbies: newHobbies });
                }}
                className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="coffee">☕ 咖啡</option>
                <option value="music">🎵 音乐</option>
                <option value="camera">📷 摄影</option>
              </select>
              <Input
                value={hobby.name}
                onChange={(e) => {
                  const newHobbies = [...(config.hobbies || [])];
                  newHobbies[idx] = { ...hobby, name: e.target.value };
                  updateConfig({ hobbies: newHobbies });
                }}
                placeholder="名称"
                className="w-32"
              />
              <Input
                value={hobby.description}
                onChange={(e) => {
                  const newHobbies = [...(config.hobbies || [])];
                  newHobbies[idx] = { ...hobby, description: e.target.value };
                  updateConfig({ hobbies: newHobbies });
                }}
                placeholder="描述"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={() => {
                  const newHobbies = config.hobbies?.filter((_, i) => i !== idx);
                  updateConfig({ hobbies: newHobbies });
                }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => {
              updateConfig({
                hobbies: [...(config.hobbies || []), { name: '', description: '', icon: 'coffee' }],
              });
            }}
          >
            <Plus size={16} className="mr-1" /> 添加爱好
          </Button>
        </div>
      )}

      {/* 统计数据 */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {config.stats?.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Input
                  value={stat.value}
                  onChange={(e) => {
                    const newStats = [...(config.stats || [])];
                    newStats[idx] = { ...stat, value: e.target.value };
                    updateConfig({ stats: newStats });
                  }}
                  placeholder="数值"
                  className="w-24"
                />
                <Input
                  value={stat.label}
                  onChange={(e) => {
                    const newStats = [...(config.stats || [])];
                    newStats[idx] = { ...stat, label: e.target.value };
                    updateConfig({ stats: newStats });
                  }}
                  placeholder="标签"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => {
                    const newStats = config.stats?.filter((_, i) => i !== idx);
                    updateConfig({ stats: newStats });
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              updateConfig({
                stats: [...(config.stats || []), { value: '', label: '' }],
              });
            }}
          >
            <Plus size={16} className="mr-1" /> 添加统计
          </Button>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" onClick={onCancel}>取消</Button>
        <Button onClick={onSave}>保存</Button>
      </div>
    </div>
  );
}
