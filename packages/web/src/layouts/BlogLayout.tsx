import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

interface BlogLayoutProps {
  children: ReactNode;
}

export function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            博客系统
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              首页
            </Link>
            <Link to="/categories" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              分类
            </Link>
            <Link to="/tags" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              标签
            </Link>
            <Link to="/search" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              搜索
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} 博客系统. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
