// 服务端 API 调用（用于 SSR）
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3012';

interface FetchOptions {
  revalidate?: number | false;
  tags?: string[];
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api${endpoint}`, {
      next: {
        revalidate: options.revalidate ?? 60,
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
    revalidate: hasFilters ? 10 : 60,
    tags: ['articles'],
  });
}

export async function getArticleBySlug(slug: string) {
  return fetchAPI<any>(`/articles/${slug}`, {
    revalidate: 60,
    tags: ['articles', `article-${slug}`],
  });
}

export async function getPopularArticles(limit = 5) {
  return fetchAPI<any[]>(`/articles/popular?limit=${limit}`, {
    revalidate: 300,
    tags: ['articles'],
  });
}

// 分类相关
export async function getCategories() {
  return fetchAPI<any[]>('/categories', {
    revalidate: 300,
    tags: ['categories'],
  });
}

export async function getCategoryBySlug(slug: string) {
  return fetchAPI<any>(`/categories/slug/${slug}`, {
    revalidate: 300,
    tags: ['categories'],
  });
}

// 标签相关
export async function getTags() {
  return fetchAPI<any[]>('/tags', {
    revalidate: 300,
    tags: ['tags'],
  });
}

export async function getTagBySlug(slug: string) {
  return fetchAPI<any>(`/tags/slug/${slug}`, {
    revalidate: 300,
    tags: ['tags'],
  });
}

// 设置相关
export async function getPublicSettings() {
  return fetchAPI<Record<string, string>>('/settings/public', {
    revalidate: 300,
    tags: ['settings'],
  });
}

// 主题相关
export async function getActiveTheme() {
  return fetchAPI<any>('/themes/active', {
    revalidate: 300,
    tags: ['themes'],
  });
}

// 知识库相关
export async function getKnowledgeDocs() {
  return fetchAPI<any[]>('/knowledge', {
    revalidate: 300,
    tags: ['knowledge'],
  });
}

export async function getKnowledgeDocBySlug(slug: string) {
  return fetchAPI<any>(`/knowledge/${slug}`, {
    revalidate: 300,
    tags: ['knowledge'],
  });
}

// 页面相关
export async function getPageBySlug(slug: string) {
  return fetchAPI<any>(`/pages/slug/${slug}`, {
    revalidate: 300,
    tags: ['pages'],
  });
}
