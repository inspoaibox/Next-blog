// 主题注册表 - 每个主题包含完整的页面组件
import { ClassicTheme } from './classic';
import { MinimalTheme } from './minimal';
import { MagazineTheme } from './magazine';
import { CyberTheme } from './cyber';
import { VibrantTheme } from './vibrant';
import { AuraNexusTheme } from './aura-nexus';
import { VibePulseTheme } from './vibe-pulse';
import { AetherBloomTheme } from './aether-bloom';
import { ChromaDimensionTheme } from './chroma-dimension';
import { SereneInkTheme } from './serene-ink';
import { ClarityFocusTheme } from './clarity-focus';

export interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    content: string;
    featuredImage?: string | null;
    publishedAt?: string | null;
    createdAt: string;
    category?: { id: string; name: string } | null;
    tags?: { id: string; name: string }[];
    viewCount?: number;
  };
}

export interface ArticleDetailProps {
  article: {
    id: string;
    title: string;
    slug: string;
    content: string;
    htmlContent?: string | null;
    featuredImage?: string | null;
    publishedAt?: string | null;
    createdAt: string;
    category?: { id: string; name: string } | null;
    tags?: { id: string; name: string }[];
    author?: { username: string } | null;
    viewCount?: number;
  };
}

export interface CategoryListProps {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    _count?: { articles: number };
    children?: Array<{
      id: string;
      name: string;
      slug: string;
      _count?: { articles: number };
    }>;
  }>;
}

export interface TagListProps {
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    _count?: { articles: number };
  }>;
}

export interface SearchResultProps {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    content: string;
    publishedAt?: string | null;
    createdAt: string;
    tags?: { id: string; name: string }[];
  }>;
  total: number;
  query: string;
}

// 项目详情页 Props
export interface ProjectDetailProps {
  project: {
    id: string;
    name: string;
    slug: string;
    description: string;
    content?: string | null;
    htmlContent?: string | null;
    techStack?: string | null;
    githubUrl?: string | null;
    demoUrl?: string | null;
    docsUrl?: string | null;
    chromeUrl?: string | null;
    firefoxUrl?: string | null;
    npmUrl?: string | null;
    featuredImage?: string | null;
    category?: { id: string; name: string } | null;
    createdAt: string;
    updatedAt: string;
  };
}

// 主题配置选项定义
export interface ThemeConfigOption {
  key: string;
  label: string;
  type: 'select' | 'boolean' | 'color' | 'number' | 'text' | 'json';
  options?: { value: string; label: string }[];
  default: any;
  description?: string;
}

// 主题配置值
export interface ThemeConfig {
  [key: string]: any;
}

export interface ThemeComponents {
  name: string;
  displayName: string;
  description: string;
  // 配置选项
  configOptions: ThemeConfigOption[];
  defaultConfig: ThemeConfig;
  // 布局
  BlogLayout: React.ComponentType<{ children: React.ReactNode; config?: ThemeConfig }>;
  // 文章相关
  ArticleCard: React.ComponentType<ArticleCardProps & { config?: ThemeConfig }>;
  ArticleDetail: React.ComponentType<ArticleDetailProps & { config?: ThemeConfig }>;
  // 分类标签
  CategoryList: React.ComponentType<CategoryListProps & { config?: ThemeConfig }>;
  TagList: React.ComponentType<TagListProps & { config?: ThemeConfig }>;
  // 搜索
  SearchResults: React.ComponentType<SearchResultProps & { config?: ThemeConfig }>;
  // 项目详情（可选，不提供则使用默认组件）
  ProjectDetail?: React.ComponentType<ProjectDetailProps & { config?: ThemeConfig }>;
}

// 所有可用主题
export const themes: Record<string, ThemeComponents> = {
  classic: ClassicTheme,
  minimal: MinimalTheme,
  magazine: MagazineTheme,
  cyber: CyberTheme,
  vibrant: VibrantTheme,
  'aura-nexus': AuraNexusTheme,
  'vibe-pulse': VibePulseTheme,
  'aether-bloom': AetherBloomTheme,
  'chroma-dimension': ChromaDimensionTheme,
  'serene-ink': SereneInkTheme,
  'clarity-focus': ClarityFocusTheme,
};

// 获取主题
export function getTheme(themeName: string): ThemeComponents {
  return themes[themeName] || themes.classic;
}
