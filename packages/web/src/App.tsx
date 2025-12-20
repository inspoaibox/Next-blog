import { Routes, Route } from 'react-router-dom';

// 页面组件
import { HomePage } from './pages/Home';
import { LoginPage } from './pages/Login';
import { AdminLayout } from './layouts/AdminLayout';
import { DashboardPage } from './pages/admin/Dashboard';
import { ArticlesPage } from './pages/admin/Articles';
import { ArticleEditorPage } from './pages/admin/ArticleEditor';
import { CategoriesPage } from './pages/admin/Categories';
import { TagsPage } from './pages/admin/Tags';
import { PagesPage } from './pages/admin/Pages';
import { MediaPage } from './pages/admin/Media';
import { KnowledgePage } from './pages/admin/Knowledge';
import { CommentsPage } from './pages/admin/Comments';
import { AIWritingPage } from './pages/admin/AIWriting';
import { SettingsPage } from './pages/admin/Settings';

// 前台页面
import { ArticleListPage } from './pages/blog/ArticleList';
import { ArticleDetailPage } from './pages/blog/ArticleDetail';
import { CategoriesPage as BlogCategoriesPage } from './pages/blog/Categories';
import { TagsPage as BlogTagsPage } from './pages/blog/Tags';
import { SearchPage } from './pages/blog/Search';
import { PageDetailPage } from './pages/blog/PageDetail';
import { KnowledgeBasePage } from './pages/blog/KnowledgeBase';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Routes>
        {/* 前台路由 */}
        <Route path="/" element={<ArticleListPage />} />
        <Route path="/article/:slug" element={<ArticleDetailPage />} />
        <Route path="/categories" element={<BlogCategoriesPage />} />
        <Route path="/tags" element={<BlogTagsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/page/:slug" element={<PageDetailPage />} />
        <Route path="/knowledge" element={<KnowledgeBasePage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* 后台路由 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="articles/new" element={<ArticleEditorPage />} />
          <Route path="articles/:id" element={<ArticleEditorPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="tags" element={<TagsPage />} />
          <Route path="pages" element={<PagesPage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="knowledge" element={<KnowledgePage />} />
          <Route path="comments" element={<CommentsPage />} />
          <Route path="ai" element={<AIWritingPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
