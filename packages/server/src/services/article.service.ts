import { prisma } from '../lib/prisma.js';
import type { Article, Prisma } from '@prisma/client';

export interface CreateArticleInput {
  title: string;
  content: string;
  excerpt?: string;
  authorId: string;
  categoryId?: string;
  tagIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
  excerpt?: string;
  categoryId?: string | null;
  tagIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100) + '-' + Date.now().toString(36);
}

export class ArticleService {
  /**
   * 创建新文章，生成唯一标识符并保存为草稿状态
   */
  async create(input: CreateArticleInput): Promise<Article> {
    const slug = generateSlug(input.title);

    const article = await prisma.article.create({
      data: {
        title: input.title,
        slug,
        content: input.content,
        excerpt: input.excerpt,
        status: 'DRAFT',
        authorId: input.authorId,
        categoryId: input.categoryId,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        tags: input.tagIds
          ? {
              create: input.tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
      },
      include: {
        tags: { include: { tag: true } },
        category: true,
        author: true,
      },
    });

    return article;
  }

  /**
   * 根据 ID 获取文章
   */
  async findById(id: string): Promise<Article | null> {
    return prisma.article.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        category: true,
        author: true,
        versions: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
  }

  /**
   * 根据 slug 获取文章
   */
  async findBySlug(slug: string): Promise<Article | null> {
    return prisma.article.findUnique({
      where: { slug },
      include: {
        tags: { include: { tag: true } },
        category: true,
        author: true,
      },
    });
  }

  /**
   * 更新文章并保存版本历史
   */
  async update(id: string, input: UpdateArticleInput): Promise<Article> {
    // 获取当前文章以保存版本
    const current = await prisma.article.findUnique({ where: { id } });
    if (!current) {
      throw new Error('Article not found');
    }

    // 保存版本历史
    await prisma.articleVersion.create({
      data: {
        articleId: id,
        title: current.title,
        content: current.content,
      },
    });

    // 更新标签关联
    if (input.tagIds) {
      await prisma.articleTag.deleteMany({ where: { articleId: id } });
      await prisma.articleTag.createMany({
        data: input.tagIds.map((tagId) => ({ articleId: id, tagId })),
      });
    }

    // 更新文章
    return prisma.article.update({
      where: { id },
      data: {
        title: input.title,
        content: input.content,
        excerpt: input.excerpt,
        categoryId: input.categoryId,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
      },
      include: {
        tags: { include: { tag: true } },
        category: true,
        author: true,
      },
    });
  }

  /**
   * 软删除文章（移至回收站）
   */
  async softDelete(id: string): Promise<Article> {
    return prisma.article.update({
      where: { id },
      data: {
        status: 'TRASHED',
        deletedAt: new Date(),
      },
    });
  }

  /**
   * 永久删除文章
   */
  async hardDelete(id: string): Promise<void> {
    await prisma.article.delete({ where: { id } });
  }

  /**
   * 恢复已删除的文章
   */
  async restore(id: string): Promise<Article> {
    return prisma.article.update({
      where: { id },
      data: {
        status: 'DRAFT',
        deletedAt: null,
      },
    });
  }

  /**
   * 发布文章
   */
  async publish(id: string): Promise<Article> {
    return prisma.article.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  /**
   * 获取已发布的文章列表（前台可见）
   */
  async findPublished(options: {
    page?: number;
    limit?: number;
    categoryId?: string;
    tagId?: string;
    search?: string;
  } = {}): Promise<{ items: Article[]; total: number }> {
    const { page = 1, limit = 10, categoryId, tagId, search } = options;

    const where: Prisma.ArticleWhereInput = {
      status: 'PUBLISHED',
      deletedAt: null,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tagId) {
      where.tags = { some: { tagId } };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          tags: { include: { tag: true } },
          category: true,
          author: true,
        },
      }),
      prisma.article.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 获取所有文章（后台管理）
   */
  async findAll(options: {
    page?: number;
    limit?: number;
    status?: string;
    authorId?: string;
  } = {}): Promise<{ items: Article[]; total: number }> {
    const { page = 1, limit = 10, status, authorId } = options;

    const where: Prisma.ArticleWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          tags: { include: { tag: true } },
          category: true,
          author: true,
        },
      }),
      prisma.article.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 增加浏览量
   */
  async incrementViewCount(id: string): Promise<void> {
    await prisma.article.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  /**
   * 获取热门文章
   */
  async findPopular(limit: number = 10): Promise<Article[]> {
    return prisma.article.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      orderBy: { viewCount: 'desc' },
      take: limit,
      include: {
        tags: { include: { tag: true } },
        category: true,
      },
    });
  }
}

export const articleService = new ArticleService();
