'use client';

import { useState, useMemo } from 'react';
import type { Project, ProjectCategory } from '@/types';
import {
  Github,
  ExternalLink,
  FileText,
  Search,
  Code2,
  Layers,
  Star,
  Pin,
} from 'lucide-react';
import { useBlogThemeStore } from '@/stores/blog-theme.store';

interface Props {
  projects: Project[];
  categories: ProjectCategory[];
  template: string;
}

// 主题配色方案
const themeStyles = {
  classic: {
    bg: 'bg-stone-50 dark:bg-stone-900',
    cardBg: 'bg-white dark:bg-stone-800',
    border: 'border-stone-200 dark:border-stone-700',
    text: 'text-stone-900 dark:text-white',
    textMuted: 'text-stone-600 dark:text-stone-400',
    accent: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-100 dark:bg-amber-900/30',
    accentHover: 'hover:text-amber-700',
    gradient: 'from-amber-500 via-orange-500 to-amber-600',
    buttonActive: 'bg-amber-600 text-white shadow-lg shadow-amber-500/30',
    buttonInactive: 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:border-amber-500',
    inputFocus: 'focus:ring-amber-500',
    ctaBg: 'bg-amber-600',
    ctaHover: 'hover:bg-amber-700',
    ctaShadow: 'shadow-amber-500/20',
    ctaDecor1: 'bg-amber-500',
    ctaDecor2: 'bg-orange-500',
    iconBg: 'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    tagBg: 'bg-stone-100 dark:bg-stone-700',
    tagText: 'text-stone-600 dark:text-stone-300',
  },
  minimal: {
    bg: 'bg-white dark:bg-black',
    cardBg: 'bg-white dark:bg-gray-950',
    border: 'border-gray-100 dark:border-gray-900',
    text: 'text-gray-900 dark:text-gray-100',
    textMuted: 'text-gray-500 dark:text-gray-400',
    accent: 'text-gray-700 dark:text-gray-300',
    accentBg: 'bg-gray-100 dark:bg-gray-900',
    accentHover: 'hover:text-gray-900 dark:hover:text-white',
    gradient: 'from-gray-400 via-gray-500 to-gray-600',
    buttonActive: 'bg-gray-900 dark:bg-white text-white dark:text-gray-900',
    buttonInactive: 'bg-transparent text-gray-400 border border-gray-200 dark:border-gray-800 hover:text-gray-900 dark:hover:text-white',
    inputFocus: 'focus:ring-gray-400',
    ctaBg: 'bg-gray-900 dark:bg-white',
    ctaHover: 'hover:bg-gray-800 dark:hover:bg-gray-100',
    ctaShadow: 'shadow-gray-500/10',
    ctaDecor1: 'bg-gray-700',
    ctaDecor2: 'bg-gray-600',
    iconBg: 'bg-gray-100 dark:bg-gray-900',
    iconColor: 'text-gray-600 dark:text-gray-400',
    tagBg: 'bg-gray-50 dark:bg-gray-900',
    tagText: 'text-gray-500 dark:text-gray-400',
  },
  magazine: {
    bg: 'bg-gray-100 dark:bg-gray-950',
    cardBg: 'bg-white dark:bg-gray-900',
    border: 'border-gray-200 dark:border-gray-800',
    text: 'text-gray-900 dark:text-white',
    textMuted: 'text-gray-500 dark:text-gray-400',
    accent: 'text-violet-600 dark:text-violet-400',
    accentBg: 'bg-violet-100 dark:bg-violet-900/30',
    accentHover: 'hover:text-violet-700',
    gradient: 'from-violet-500 via-fuchsia-500 to-pink-500',
    buttonActive: 'bg-violet-600 text-white shadow-lg shadow-violet-500/30',
    buttonInactive: 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-violet-500',
    inputFocus: 'focus:ring-violet-500',
    ctaBg: 'bg-gradient-to-r from-violet-600 to-fuchsia-600',
    ctaHover: 'hover:from-violet-700 hover:to-fuchsia-700',
    ctaShadow: 'shadow-violet-500/20',
    ctaDecor1: 'bg-violet-500',
    ctaDecor2: 'bg-fuchsia-500',
    iconBg: 'bg-violet-50 dark:bg-violet-900/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
    tagBg: 'bg-gray-100 dark:bg-gray-800',
    tagText: 'text-gray-600 dark:text-gray-300',
  },
};

export function ProjectsClient({ projects, categories, template }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentTheme } = useBlogThemeStore();
  const theme = themeStyles[currentTheme as keyof typeof themeStyles] || themeStyles.classic;

  // 解析技术栈
  const parseTechStack = (techStack?: string): string[] => {
    if (!techStack) return [];
    try {
      const parsed = JSON.parse(techStack);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // 过滤项目
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        !selectedCategory || project.categoryId === selectedCategory;
      const techStack = parseTechStack(project.techStack);
      const matchesSearch =
        !searchQuery ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        techStack.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [projects, selectedCategory, searchQuery]);

  // 分离置顶和推荐项目
  const pinnedProjects = filteredProjects.filter((p) => p.isPinned);
  const featuredProjects = filteredProjects.filter(
    (p) => p.isRecommended && !p.isPinned
  );
  const regularProjects = filteredProjects.filter(
    (p) => !p.isPinned && !p.isRecommended
  );

  const containerClass =
    template === 'fullwidth'
      ? 'max-w-full px-4'
      : template === 'sidebar'
        ? 'max-w-6xl mx-auto px-4'
        : 'max-w-7xl mx-auto px-4';

  return (
    <div
      className={`min-h-screen ${theme.bg} py-12 ${containerClass} transition-colors duration-300`}
    >
      {/* 头部区域 */}
      <div className="text-center mb-16">
        <h1 className={`text-4xl font-extrabold ${theme.text} sm:text-5xl tracking-tight mb-4 ${currentTheme === 'minimal' ? 'font-extralight tracking-[0.1em]' : ''}`}>
          {currentTheme === 'magazine' ? (
            <span className={`bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>我的开源项目</span>
          ) : '我的开源项目'}
        </h1>
        <p className={`text-lg ${theme.textMuted} max-w-2xl mx-auto ${currentTheme === 'minimal' ? 'font-light' : ''}`}>
          这里展示了我参与或主导的开源项目，涵盖前端开发、后端工程以及各种效率工具。持续探索，不断输出。
        </p>
      </div>

      {/* 工具栏: 搜索与分类 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textMuted} h-5 w-5`} />
          <input
            type="text"
            placeholder="搜索项目、技术栈..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl border ${theme.border} ${theme.cardBg} ${theme.text} focus:ring-2 ${theme.inputFocus} outline-none transition-all`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !selectedCategory ? theme.buttonActive : theme.buttonInactive
            }`}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id ? theme.buttonActive : theme.buttonInactive
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 项目列表 */}
      {filteredProjects.length > 0 ? (
        <div className="space-y-8">
          {/* 置顶项目 */}
          {pinnedProjects.length > 0 && (
            <div>
              <h2 className={`text-sm font-semibold ${theme.textMuted} uppercase tracking-wider mb-4 flex items-center gap-2`}>
                <Pin size={14} />
                置顶项目
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pinnedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    parseTechStack={parseTechStack}
                    theme={theme}
                    currentTheme={currentTheme}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 推荐项目 */}
          {featuredProjects.length > 0 && (
            <div>
              <h2 className={`text-sm font-semibold ${theme.textMuted} uppercase tracking-wider mb-4 flex items-center gap-2`}>
                <Star size={14} />
                推荐项目
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    parseTechStack={parseTechStack}
                    theme={theme}
                    currentTheme={currentTheme}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 其他项目 */}
          {regularProjects.length > 0 && (
            <div>
              {(pinnedProjects.length > 0 || featuredProjects.length > 0) && (
                <h2 className={`text-sm font-semibold ${theme.textMuted} uppercase tracking-wider mb-4`}>
                  所有项目
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    parseTechStack={parseTechStack}
                    theme={theme}
                    currentTheme={currentTheme}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className={`inline-flex p-4 rounded-full ${theme.accentBg} mb-4`}>
            <Search size={32} className={theme.textMuted} />
          </div>
          <h3 className={`text-lg font-medium ${theme.text}`}>
            未找到匹配的项目
          </h3>
          <p className={theme.textMuted}>
            尝试调整搜索词或过滤器
          </p>
        </div>
      )}

      {/* 底部 CTA */}
      <div className={`mt-20 p-8 rounded-3xl ${theme.ctaBg} text-white text-center relative overflow-hidden shadow-2xl ${theme.ctaShadow}`}>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">想要交流或贡献？</h2>
          <p className="mb-6 opacity-90">
            我的所有开源项目都欢迎 Issue 和 PR，让我们一起构建更好的软件。
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-6 py-3 bg-white ${currentTheme === 'minimal' ? 'text-gray-900' : theme.accent} rounded-xl font-bold hover:bg-gray-50 transition-colors`}
          >
            访问 GitHub
            <ExternalLink size={18} />
          </a>
        </div>
        {/* 背景装饰 */}
        <div className={`absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 ${theme.ctaDecor1} rounded-full blur-3xl opacity-50`} />
        <div className={`absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 ${theme.ctaDecor2} rounded-full blur-3xl opacity-50`} />
      </div>
    </div>
  );
}

interface ThemeStyle {
  bg: string;
  cardBg: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentBg: string;
  accentHover: string;
  gradient: string;
  buttonActive: string;
  buttonInactive: string;
  inputFocus: string;
  ctaBg: string;
  ctaHover: string;
  ctaShadow: string;
  ctaDecor1: string;
  ctaDecor2: string;
  iconBg: string;
  iconColor: string;
  tagBg: string;
  tagText: string;
}

function ProjectCard({
  project,
  parseTechStack,
  theme,
  currentTheme,
}: {
  project: Project;
  parseTechStack: (techStack?: string) => string[];
  theme: ThemeStyle;
  currentTheme: string;
}) {
  const techStack = parseTechStack(project.techStack);

  return (
    <div className={`group relative flex flex-col ${theme.cardBg} rounded-2xl border ${theme.border} overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}>
      {/* 装饰边框 */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

      {/* 特色图片 */}
      {project.featuredImage && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={project.featuredImage}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        {/* 项目标题与标签 */}
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 ${theme.iconBg} rounded-lg ${theme.iconColor}`}>
            <Code2 size={24} />
          </div>
          <div className="flex gap-1">
            {project.isPinned && (
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 ${theme.accentBg} ${theme.accent} rounded`}>
                置顶
              </span>
            )}
            {project.isRecommended && (
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 ${theme.iconBg} ${theme.iconColor} rounded`}>
                推荐
              </span>
            )}
          </div>
        </div>

        <h3 className={`text-xl font-bold ${theme.text} mb-2 group-hover:${theme.accent} transition-colors ${currentTheme === 'minimal' ? 'font-light' : ''}`}>
          {project.name}
        </h3>

        <p className={`${theme.textMuted} text-sm mb-6 line-clamp-2`}>
          {project.description}
        </p>

        {/* 技术栈标签 */}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {techStack.slice(0, 5).map((tech) => (
              <span
                key={tech}
                className={`text-[11px] px-2 py-1 ${theme.tagBg} ${theme.tagText} rounded-md`}
              >
                {tech}
              </span>
            ))}
            {techStack.length > 5 && (
              <span className={`text-[11px] px-2 py-1 ${theme.tagBg} ${theme.textMuted} rounded-md`}>
                +{techStack.length - 5}
              </span>
            )}
          </div>
        )}

        {/* 分类信息 */}
        <div className={`flex items-center gap-4 mt-auto pt-4 border-t ${theme.border}`}>
          {project.category && (
            <div className={`flex items-center ${theme.textMuted} text-xs`}>
              <Layers size={14} className="mr-1" />
              {project.category.name}
            </div>
          )}
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div className={`flex border-t ${theme.border}`}>
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium ${theme.textMuted} hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
          >
            <Github size={16} />
            Code
          </a>
        )}
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium ${theme.accent} hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-l ${theme.border}`}
          >
            <ExternalLink size={16} />
            Demo
          </a>
        )}
        {project.docsUrl && (
          <a
            href={project.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium ${theme.textMuted} hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-l ${theme.border}`}
          >
            <FileText size={16} />
            Docs
          </a>
        )}
        {!project.githubUrl && !project.demoUrl && !project.docsUrl && (
          <div className={`flex-1 flex items-center justify-center py-3 text-sm ${theme.textMuted}`}>
            暂无链接
          </div>
        )}
      </div>
    </div>
  );
}
