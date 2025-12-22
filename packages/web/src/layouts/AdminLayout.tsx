'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../stores/auth.store';
import { ThemeToggle } from '../components/ThemeToggle';
import { useEffect, useState, ReactNode } from 'react';

const menuItems = [
  { path: '/admin', label: '仪表盘', icon: '📊' },
  { path: '/admin/articles', label: '文章管理', icon: '📝' },
  { path: '/admin/categories', label: '分类管理', icon: '📁' },
  { path: '/admin/tags', label: '标签管理', icon: '🏷️' },
  { path: '/admin/pages', label: '页面管理', icon: '📄' },
  { path: '/admin/projects', label: '项目管理', icon: '🚀' },
  { path: '/admin/friends', label: '友链管理', icon: '🔗' },
  { path: '/admin/media', label: '媒体库', icon: '🖼️' },
  { path: '/admin/knowledge', label: '知识库', icon: '📚' },
  { path: '/admin/comments', label: '评论管理', icon: '💬' },
  { path: '/admin/analytics', label: '网站统计', icon: '📈' },
  { path: '/admin/ai', label: 'AI 写作', icon: '🤖' },
  { path: '/admin/settings', label: '系统设置', icon: '⚙️' },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  // 路由变化时关闭侧边栏
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleClearCache = async () => {
    setClearing(true);
    try {
      const res = await fetch('/api/revalidate', { method: 'POST' });
      
      // 检查响应类型
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // 返回的不是 JSON，可能是代理配置问题
        const text = await res.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        alert('清除失败: 服务器返回了非JSON响应，请检查Caddy代理配置，确保 /api/revalidate 路由到前端(3011)而不是后端(3012)');
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        alert('缓存已清除');
      } else {
        console.error('Cache clear failed:', data);
        alert('清除失败: ' + (data.error || '未知错误'));
      }
    } catch (err) {
      console.error('Cache clear error:', err);
      const errorMsg = err instanceof Error ? err.message : '网络错误';
      alert('清除失败: ' + errorMsg);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
        flex flex-col transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <Link href="/admin" className="text-xl font-bold">
            NextBlog 后台
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                pathname === item.path
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user?.username}
            </span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400"
            aria-label="打开菜单"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={handleClearCache}
              disabled={clearing}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1 disabled:opacity-50"
              title="清除前端缓存"
            >
              {clearing ? '清除中...' : '🔄 清除缓存'}
            </button>
            <Link
              href="/"
              target="_blank"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              查看首页
              <span>↗</span>
            </Link>
          </div>
        </div>
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
