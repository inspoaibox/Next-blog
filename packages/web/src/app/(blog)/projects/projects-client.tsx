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
import { useThemeContext } from '@/contexts/theme-context';
import { useSiteSettingsContext } from '@/contexts/site-settings-context';

interface Props {
  projects: Project[];
  categories: ProjectCategory[];
  template: string;
}

// 项目页面配置接口
interface ProjectsPageConfig {
  title?: string;
  subtitle?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
}

// 主题配色
const themeColors = {
  classic: {
    gradient: 'from-amber-500 via-orange-500 to-amber-600',
    accentText: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-50 dark:bg-amber-900/20',
    buttonActive: 'bg-amber-600 text-white',
    buttonHover: 'hover:border-amber-500',
  },
  minimal: {
    gradient: 'from-gray-500 via-gray-600 to-gray-700',
    accentText: 'text-gray-600 dark:text-gray-400',
    accentBg: 'bg-gray-100 dark:bg-gray-800',
    buttonActive: 'bg-gray-800 dark:bg-white text-white dark:text-gray-900',
    buttonHover: 'hover:border-gray-500',
  },
  magazine: {
    gradient: 'from-violet-500 via-fuchsia-500 to-pink-500',
    accentText: 'text-violet-600 dark:text-violet-400',
    accentBg: 'bg-violet-50 dark:bg-violet-900/20',
    buttonActive: 'bg-violet-600 text-white',
    buttonHover: 'hover:border-violet-500',
  },
};

// 默认配置
const defaultConfig: ProjectsPageConfig = {
  title: '我的开源项目',
  subtitle: '这里展示了我参与或主导的开源项目，涵盖前端开发、后端工程以及各种效率工具。',
  ctaTitle: '想要交流或贡献？',
  ctaDescription: '我的所有开源项目都欢迎 Issue 和 PR，让我们一起构建更好的软件。',
  ctaButtonText: '访问 GitHub',
  ctaButtonLink: 'https://github.com',
};

export function ProjectsClient({ projects, categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { themeName } = useThemeContext();
  const { settings } = useSiteSettingsContext();
  const colors = themeColors[themeName as keyof typeof themeColors] || themeColors.classic;

  // 解析页面配置
  let config: ProjectsPageConfig = defaultConfig;
  try {
    if (settings.projectsPageContent) {
      config = { ...defaultConfig, ...JSON.parse(settings.projectsPageContent) };
    }
  } catch {
    // 使用默认配置
  }

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
      const matchesCategory = !selectedCategory || project.categoryId === selectedCategory;
      const techStack = parseTechStack(project.techStack);
      const matchesSearch =
        !searchQuery ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [projects, selectedCategory, searchQuery]);

  // 分离置顶和推荐项目
  const pinnedProjects = filteredProjects.filter((p) => p.isPinned);
  const featuredProjects = filteredProjects.filter((p) => p.isRecommended && !p.isPinned);
  const regularProjects = filteredProjects.filter((p) => !p.isPinned && !p.isRecommended);

  return (
    <div className="py-8">
      {/* 头部区域 */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          <span className={`bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
            {config.title}
          </span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          {config.subtitle}
        </p>
      </div>

      {/* 工具栏 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="搜索项目、技术栈..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !selectedCategory
                ? colors.buttonActive
                : `bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 ${colors.buttonHover}`
            }`}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? colors.buttonActive
                  : `bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 ${colors.buttonHover}`
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
          {pinnedProjects.length > 0 && (
            <ProjectSection
              title="置顶项目"
              icon={<Pin size={14} />}
              projects={pinnedProjects}
              parseTechStack={parseTechStack}
              colors={colors}
            />
          )}
          {featuredProjects.length > 0 && (
            <ProjectSection
              title="推荐项目"
              icon={<Star size={14} />}
              projects={featuredProjects}
              parseTechStack={parseTechStack}
              colors={colors}
            />
          )}
          {regularProjects.length > 0 && (
            <ProjectSection
              title={pinnedProjects.length > 0 || featuredProjects.length > 0 ? '所有项目' : undefined}
              projects={regularProjects}
              parseTechStack={parseTechStack}
              colors={colors}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className={`inline-flex p-4 rounded-full ${colors.accentBg} mb-4`}>
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">未找到匹配的项目</h3>
          <p className="text-gray-500 dark:text-gray-400">尝试调整搜索词或过滤器</p>
        </div>
      )}

      {/* 底部 CTA */}
      <div className={`mt-16 p-8 rounded-2xl bg-gradient-to-r ${colors.gradient} text-white text-center relative overflow-hidden`}>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">{config.ctaTitle}</h2>
          <p className="mb-6 opacity-90">{config.ctaDescription}</p>
          <a
            href={config.ctaButtonLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            {config.ctaButtonText}
            <ExternalLink size={18} />
          </a>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
      </div>
    </div>
  );
}

interface ColorScheme {
  gradient: string;
  accentText: string;
  accentBg: string;
  buttonActive: string;
  buttonHover: string;
}

function ProjectSection({
  title,
  icon,
  projects,
  parseTechStack,
  colors,
}: {
  title?: string;
  icon?: React.ReactNode;
  projects: Project[];
  parseTechStack: (techStack?: string) => string[];
  colors: ColorScheme;
}) {
  return (
    <div>
      {title && (
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          {icon}
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} parseTechStack={parseTechStack} colors={colors} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  parseTechStack,
  colors,
}: {
  project: Project;
  parseTechStack: (techStack?: string) => string[];
  colors: ColorScheme;
}) {
  const techStack = parseTechStack(project.techStack);

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* 顶部装饰 */}
      <div className={`h-1 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

      {/* 特色图片 */}
      {project.featuredImage && (
        <div className="h-40 overflow-hidden">
          <img
            src={project.featuredImage}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-5">
        {/* 标题与标签 */}
        <div className="flex justify-between items-start mb-3">
          <div className={`p-2 ${colors.accentBg} rounded-lg ${colors.accentText}`}>
            <Code2 size={20} />
          </div>
          <div className="flex gap-1">
            {project.isPinned && (
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 ${colors.accentBg} ${colors.accentText} rounded`}>
                置顶
              </span>
            )}
            {project.isRecommended && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                推荐
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {project.name}
        </h3>

        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* 技术栈 */}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {techStack.slice(0, 4).map((tech) => (
              <span key={tech} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                {tech}
              </span>
            ))}
            {techStack.length > 4 && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded">
                +{techStack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* 分类 */}
        {project.category && (
          <div className="flex items-center text-gray-400 text-xs mb-4">
            <Layers size={12} className="mr-1" />
            {project.category.name}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex border-t border-gray-100 dark:border-gray-700 -mx-5 -mb-5 mt-4">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Github size={14} /> Code
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm ${colors.accentText} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-l border-gray-100 dark:border-gray-700`}
            >
              <ExternalLink size={14} /> Demo
            </a>
          )}
          {project.docsUrl && (
            <a
              href={project.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-l border-gray-100 dark:border-gray-700"
            >
              <FileText size={14} /> Docs
            </a>
          )}
          {!project.githubUrl && !project.demoUrl && !project.docsUrl && (
            <div className="flex-1 flex items-center justify-center py-3 text-sm text-gray-400">
              暂无链接
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
