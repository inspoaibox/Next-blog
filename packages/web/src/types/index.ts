// 文章相关类型
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'TRASHED';
  publishedAt?: string;
  scheduledAt?: string;
  viewCount: number;
  seoTitle?: string;
  seoDescription?: string;
  categoryId?: string;
  category?: Category;
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
}

// 分类
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  _count?: { articles: number };
  createdAt: string;
}

// 标签
export interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: { articles: number };
  createdAt: string;
}

// 页面
export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  sortOrder: number;
  showInNav: boolean;
  createdAt: string;
  updatedAt: string;
}

// 媒体
export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  thumbnailPath?: string;
  createdAt: string;
}

// 知识库文档
export interface KnowledgeDoc {
  id: string;
  title: string;
  slug: string;
  content: string;
  parentId?: string;
  parent?: KnowledgeDoc;
  sortOrder: number;
  children?: KnowledgeDoc[];
  createdAt: string;
  updatedAt: string;
}

// 评论
export interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  authorUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'SPAM' | 'TRASHED';
  articleId: string;
  article?: Article;
  createdAt: string;
}

// AI 模型
export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'claude' | 'qwen';
  model: string;
  apiKey: string;
  baseUrl?: string;
  isDefault: boolean;
  createdAt: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
