import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { ThemeToggle } from '../components/ThemeToggle';
import { useEffect } from 'react';

const menuItems = [
  { path: '/admin', label: '仪表盘', icon: '📊' },
  { path: '/admin/articles', label: '文章管理', icon: '📝' },
  { path: '/admin/categories', label: '分类管理', icon: '📁' },
  { path: '/admin/tags', label: '标签管理', icon: '🏷️' },
  { path: '/admin/pages', label: '页面管理', icon: '📄' },
  { path: '/admin/media', label: '媒体库', icon: '🖼️' },
  { path: '/admin/knowledge', label: '知识库', icon: '📚' },
  { path: '/admin/comments', label: '评论管理', icon: '💬' },
  { path: '/admin/ai', label: 'AI 写作', icon: '🤖' },
  { path: '/admin/settings', label: '系统设置', icon: '⚙️' },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/admin" className="text-xl font-bold">
            博客后台
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
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
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
