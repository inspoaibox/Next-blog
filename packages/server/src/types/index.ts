// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Article types
export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'TRASHED';

// Comment types
export type CommentStatus = 'PENDING' | 'APPROVED' | 'SPAM' | 'TRASHED';

// User roles
export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

// AI Generation result
export interface AIGenerateResult {
  title: string;
  content: string;
  tags: string[];
  tokensUsed: number;
}
