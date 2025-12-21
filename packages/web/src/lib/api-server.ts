// 服务端 API 调用（用于 SSR）
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3012';

// 缓存时间配置（秒），可通过环境变量覆盖，设为 0 禁用缓存
const CACHE_TIME = {
  default: Number(process.env.CACHE_DEFAULT) || 60, // 默认缓存时间
  settings: Number(process.env.CACHE_SETTINGS) || 60, // 网站设置、幻灯片、菜单等
  articles: Number(process.env.CACHE_ARTICLES) || 60, // 文章列表、文章详情
  static: Number(process.env.CACHE_STATIC) || 300, // 分类、标签、主题、知识库等变化少的数据
};

interface FetchOptions {
  revalidate?: number | false;
  tags?: string[];
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api${endpoint}`, {
      next: {
        revalidate: options.revalidate ?? CACHE_TIME.default,
        tags: options.tags,
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    // 后端返回格式为 { success: true, data: ... }
    return json.data ?? json;
  } catch (error) {
    return null;
  }
}

// 文章相关 - 公开接口使用 /published
export async function getArticles(params?: {
  page?: number;
  limit?: number;
  categoryId?: string;
  tagId?: string;
  search?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params?.tagId) searchParams.set('tagId', params.tagId);
  if (params?.search) searchParams.set('search', params.search);
  
  const query = searchParams.toString();
  // 当有筛选条件时，使用较短的缓存时间
  const hasFilters = params?.categoryId || params?.tagId || params?.search;
  return fetchAPI<{ items: any[]; total: number }>(`/articles/published${query ? `?${query}` : ''}`, {
    revalidate: hasFilters ? 10 : CACHE_TIME.articles,
    tags: ['articles'],
  });
}

export async function getArticleBySlug(slug: string) {
  return fetchAPI<any>(`/articles/${slug}`, {
    revalidate: CACHE_TIME.articles,
    tags: ['articles', `article-${slug}`],
  });
}

export async function getPopularArticles(limit = 5) {
  return fetchAPI<any[]>(`/articles/popular?limit=${limit}`, {
    revalidate: CACHE_TIME.static,
    tags: ['articles'],
  });
}

// 分类相关
export async function getCategories() {
  return fetchAPI<any[]>('/categories', {
    revalidate: CACHE_TIME.static,
    tags: ['categories'],
  });
}

export async function getCategoryBySlug(slug: string) {
  return fetchAPI<any>(`/categories/slug/${slug}`, {
    revalidate: CACHE_TIME.static,
    tags: ['categories'],
  });
}

// 标签相关
export async function getTags() {
  return fetchAPI<any[]>('/tags', {
    revalidate: CACHE_TIME.static,
    tags: ['tags'],
  });
}

export async function getTagBySlug(slug: string) {
  return fetchAPI<any>(`/tags/slug/${slug}`, {
    revalidate: CACHE_TIME.static,
    tags: ['tags'],
  });
}

// 设置相关
export async function getPublicSettings() {
  return fetchAPI<Record<string, string>>('/settings/public', {
    revalidate: CACHE_TIME.settings,
    tags: ['settings'],
  });
}

// 主题相关
export async function getActiveTheme() {
  return fetchAPI<any>('/themes/active', {
    revalidate: CACHE_TIME.settings, // 主题切换需要较快生效
    tags: ['themes'],
  });
}

// 知识库相关
export async function getKnowledgeDocs() {
  return fetchAPI<any[]>('/knowledge', {
    revalidate: CACHE_TIME.static,
    tags: ['knowledge'],
  });
}

export async function getKnowledgeDocBySlug(slug: string) {
  return fetchAPI<any>(`/knowledge/${slug}`, {
    revalidate: CACHE_TIME.static,
    tags: ['knowledge'],
  });
}

// 页面相关
export async function getPageBySlug(slug: string) {
  return fetchAPI<any>(`/pages/slug/${slug}`, {
    revalidate: CACHE_TIME.static,
    tags: ['pages'],
  });
}


// 项目相关
export async function getPublishedProjects(categoryId?: string) {
  const query = categoryId ? `?categoryId=${categoryId}` : '';
  return fetchAPI<any[]>(`/projects/published${query}`, {
    revalidate: CACHE_TIME.static,
    tags: ['projects'],
  });
}

export async function getProjectCategories() {
  return fetchAPI<any[]>('/project-categories', {
    revalidate: CACHE_TIME.static,
    tags: ['project-categories'],
  });
}

// 友链相关
export async function getFriendLinks() {
  return fetchAPI<any[]>('/friend-links/public', {
    revalidate: CACHE_TIME.static,
    tags: ['friend-links'],
  });
}

// 公开统计数据
export interface PublicStats {
  totalArticles: number;
  totalViews: number;
  totalCategories: number;
  totalTags: number;
  totalComments: number;
  recentArticlesCount: number;
  runningDays: number;
  lastUpdated: string;
}

export async function getPublicStats() {
  return fetchAPI<PublicStats>('/stats/public', {
    revalidate: CACHE_TIME.settings,
    tags: ['stats'],
  });
}
