import { prisma } from '../lib/prisma.js';
import type { Article, Prisma } from '@prisma/client';

export interface CreateArticleInput {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
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
  slug?: string;
  featuredImage?: string | null;
  status?: string;
  categoryId?: string | null;
  tagIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

function generateSlug(title: string): string {
  // 将中文转换为拼音，保留英文和数字
  const pinyin = title
    .toLowerCase()
    // 移除特殊字符，保留中文、英文、数字
    .replace(/[^\w\u4e00-\u9fa5\s]/g, '')
    .trim();
  
  // 简单的中文转拼音映射（常用字）- 实际生产环境建议使用 pinyin 库
  // 这里使用时间戳确保唯一性
  const slug = pinyin
    .replace(/[\u4e00-\u9fa5]+/g, '') // 移除中文字符
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
  
  // 如果 slug 为空（全是中文），使用时间戳
  const base = slug || 'article';
  return base + '-' + Date.now().toString(36);
}

export class ArticleService {
  /**
   * 创建新文章，生成唯一标识符并默认发布
   */
  async create(input: CreateArticleInput): Promise<Article> {
    const slug = generateSlug(input.title);
    // 空字符串转为 undefined，避免外键约束错误
    const categoryId = input.categoryId || undefined;
    const featuredImage = input.featuredImage || undefined;

    const article = await prisma.article.create({
      data: {
        title: input.title,
        slug,
        content: input.content,
        excerpt: input.excerpt,
        featuredImage,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        authorId: input.authorId,
        categoryId,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        tags: input.tagIds?.length
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
      if (input.tagIds.length > 0) {
        await prisma.articleTag.createMany({
          data: input.tagIds.map((tagId) => ({ articleId: id, tagId })),
        });
      }
    }

    // 如果 slug 为空，自动生成
    let slug = input.slug;
    if (slug === '' || slug === undefined || slug === null) {
      slug = generateSlug(input.title || current.title);
    }

    // 空字符串转为 null，避免外键约束错误
    const categoryId = input.categoryId === '' ? null : input.categoryId;

    // 处理特色图：undefined 表示不更新，null 或空字符串表示清除，其他值表示设置
    const featuredImageUpdate = input.featuredImage === undefined 
      ? {} 
      : { featuredImage: input.featuredImage || null };

    // 更新文章
    return prisma.article.update({
      where: { id },
      data: {
        title: input.title,
        content: input.content,
        excerpt: input.excerpt,
        slug,
        status: input.status,
        categoryId,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        ...featuredImageUpdate,
        // 如果状态变为已发布且之前未发布，设置发布时间
        ...(input.status === 'PUBLISHED' && current.status !== 'PUBLISHED' 
          ? { publishedAt: new Date() } 
          : {}),
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

    // 如果指定了分类，查询该分类及其所有子分类的文章
    if (categoryId) {
      const childCategories = await prisma.category.findMany({
        where: { parentId: categoryId },
        select: { id: true },
      });
      const categoryIds = [categoryId, ...childCategories.map((c: { id: string }) => c.id)];
      where.categoryId = { in: categoryIds };
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
