import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            博客系统
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              登录
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">欢迎来到博客系统</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            一个功能完整的个人博客平台
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/admin"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              进入后台
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
