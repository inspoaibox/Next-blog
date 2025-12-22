// 共享的项目详情组件 - 可被所有主题复用或覆盖
'use client';

import { useState, useEffect } from 'react';
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
  List,
} from 'lucide-react';
import { useThemeColorScheme } from '@/contexts/theme-context';
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

// TOC 项目接口
interface TocItem {
  id: string;
  text: string;
  level: number;
}

// 从 HTML 内容中提取标题
function extractHeadings(html: string): TocItem[] {
  if (typeof window === 'undefined') return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3, h4');

  return Array.from(headings).map((heading, index) => ({
    id: heading.id || `heading-${index}`,
    text: heading.textContent || '',
    level: parseInt(heading.tagName[1]),
  }));
}

export function DefaultProjectDetail({ project }: ProjectDetailProps) {
  const techStack = parseTechStack(project.techStack);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // 使用主题配色方案
  const colors = useThemeColorScheme();

  // 提取目录
  useEffect(() => {
    if (project.htmlContent) {
      const items = extractHeadings(project.htmlContent);
      setTocItems(items);
    }
  }, [project.htmlContent]);

  // 监听滚动，高亮当前标题
  useEffect(() => {
    if (tocItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tocItems]);

  // 收集所有链接
  const links = [
    {
      url: project.githubUrl,
      icon: Github,
      label: 'GitHub',
      color: 'hover:text-gray-900 dark:hover:text-white',
    },
    { url: project.demoUrl, icon: Globe, label: '在线演示', color: colors.buttonHover },
    { url: project.docsUrl, icon: FileText, label: '文档', color: 'hover:text-emerald-600' },
    { url: project.chromeUrl, icon: Chrome, label: 'Chrome 商店', color: 'hover:text-yellow-600' },
    { url: project.npmUrl, icon: Package, label: 'NPM', color: 'hover:text-red-600' },
  ].filter((l) => l.url);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-8 items-start">
        {/* 左侧固定 TOC - 仅桌面端 */}
        {tocItems.length > 0 && (
          <aside className="hidden xl:block w-56 shrink-0 sticky top-24">
            <div className={`p-4 ${colors.accentBg} backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700`}>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                <List size={14} />
                目录
              </h3>
              <nav className="text-sm max-h-[70vh] overflow-y-auto pr-1">
                <ul className="space-y-2">
                  {tocItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => scrollToHeading(item.id)}
                        className={`block w-full text-left py-1 transition-colors line-clamp-2 ${
                          item.level === 1
                            ? ''
                            : item.level === 2
                              ? 'ml-3 text-sm'
                              : 'ml-6 text-xs'
                        } ${
                          activeId === item.id
                            ? `${colors.accentText} font-medium`
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        title={item.text}
                      >
                        {item.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>
        )}

        {/* 主内容区 */}
        <article className="flex-1 min-w-0">
        {/* 返回链接 */}
        <Link
          href="/projects"
          className={`inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors`}
        >
          <ArrowLeft size={16} />
          返回项目列表
        </Link>

        {/* 头部区域 */}
        <header className="mb-8">
          {project.category && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <Layers size={14} />
              <span>{project.category.name}</span>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {project.name}
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{project.description}</p>

          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className={`px-3 py-1 text-sm rounded-full ${colors.accentBg} ${colors.accentText}`}
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

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
            <img src={project.featuredImage} alt={project.name} className="w-full h-auto" />
          </div>
        )}

        {/* 详细内容 */}
        {project.htmlContent && (
          <div
            id="project-content"
            className={`prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-semibold prose-headings:scroll-mt-20
              prose-a:no-underline hover:prose-a:underline
              prose-code:text-sm prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:rounded-xl prose-pre:bg-[#1a1a1a]
              prose-img:rounded-lg
              prose-blockquote:border-l-4
              [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit
              prose-a:${colors.accentText}
              prose-code:${colors.accentBg}
              prose-blockquote:border-${colors.accent}-500
            `}
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
              <span className="flex items-center gap-1">更新于 {formatDate(project.updatedAt)}</span>
            )}
          </div>
        </footer>
        </article>
      </div>
    </div>
  );
}
