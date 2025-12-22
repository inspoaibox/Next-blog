// 共享的项目详情组件 - 可被所有主题复用或覆盖
import Link from 'next/link';
import {
  Github,
  FileText,
  ArrowLeft,
  Calendar,
  Layers,
  Chrome,
  Package,
  Globe,
} from 'lucide-react';
import type { ProjectDetailProps } from '../index';

// 解析技术栈 JSON
function parseTechStack(techStack?: string | null): string[] {
  if (!techStack) return [];
  try {
    const parsed = JSON.parse(techStack);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// 格式化日期
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface DefaultProjectDetailProps extends ProjectDetailProps {
  // 主题颜色配置
  colors?: {
    accent: string;
    accentBg: string;
    accentText: string;
    gradient: string;
  };
}

export function DefaultProjectDetail({ project, colors }: DefaultProjectDetailProps) {
  const techStack = parseTechStack(project.techStack);

  // 默认颜色
  const defaultColors = {
    accent: 'blue-600',
    accentBg: 'bg-blue-50 dark:bg-blue-900/20',
    accentText: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500 to-indigo-600',
  };
  const c = colors || defaultColors;

  // 收集所有链接
  const links = [
    { url: project.githubUrl, icon: Github, label: 'GitHub', color: 'hover:text-gray-900 dark:hover:text-white' },
    { url: project.demoUrl, icon: Globe, label: '在线演示', color: `hover:${c.accentText}` },
    { url: project.docsUrl, icon: FileText, label: '文档', color: 'hover:text-emerald-600' },
    { url: project.chromeUrl, icon: Chrome, label: 'Chrome 商店', color: 'hover:text-yellow-600' },
    { url: project.npmUrl, icon: Package, label: 'NPM', color: 'hover:text-red-600' },
  ].filter((l) => l.url);

  return (
    <article className="max-w-4xl mx-auto">
      {/* 返回链接 */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        返回项目列表
      </Link>

      {/* 头部区域 */}
      <header className="mb-8">
        {/* 分类标签 */}
        {project.category && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <Layers size={14} />
            <span>{project.category.name}</span>
          </div>
        )}

        {/* 项目名称 */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          {project.name}
        </h1>

        {/* 简介 */}
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          {project.description}
        </p>

        {/* 技术栈标签 */}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {techStack.map((tech) => (
              <span
                key={tech}
                className={`px-3 py-1 text-sm rounded-full ${c.accentBg} ${c.accentText}`}
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* 操作按钮 */}
        {links.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url!}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 ${link.color} transition-colors`}
              >
                <link.icon size={18} />
                {link.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* 特色图片 */}
      {project.featuredImage && (
        <div className="mb-8 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <img
            src={project.featuredImage}
            alt={project.name}
            className="w-full h-auto"
          />
        </div>
      )}

      {/* 详细内容 */}
      {project.htmlContent && (
        <div
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-semibold
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-code:text-sm prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:bg-gray-100 dark:prose-code:bg-gray-800
            prose-pre:rounded-xl prose-pre:bg-[#1a1a1a]
            prose-img:rounded-lg
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500
          "
          dangerouslySetInnerHTML={{ __html: project.htmlContent }}
        />
      )}

      {/* 底部信息 */}
      <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            创建于 {formatDate(project.createdAt)}
          </span>
          {project.updatedAt !== project.createdAt && (
            <span className="flex items-center gap-1">
              更新于 {formatDate(project.updatedAt)}
            </span>
          )}
        </div>
      </footer>
    </article>
  );
}
