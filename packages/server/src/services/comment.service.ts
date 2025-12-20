import { prisma } from '../lib/prisma.js';
import type { Comment } from '@prisma/client';

export interface CreateCommentInput {
  content: string;
  authorName: string;
  authorEmail: string;
  articleId: string;
  userId?: string;
  parentId?: string;
}

// 垃圾评论关键词
const SPAM_KEYWORDS = ['viagra', 'casino', 'lottery', 'click here', 'free money', 'buy now'];

export class CommentService {
  /**
   * 创建评论
   */
  async create(input: CreateCommentInput): Promise<Comment> {
    // 检测垃圾评论
    const isSpam = this.detectSpam(input.content);

    return prisma.comment.create({
      data: {
        content: input.content,
        authorName: input.authorName,
        authorEmail: input.authorEmail,
        articleId: input.articleId,
        userId: input.userId,
        parentId: input.parentId,
        status: isSpam ? 'SPAM' : 'PENDING',
      },
      include: { article: true, user: true },
    });
  }

  /**
   * 检测垃圾评论
   */
  private detectSpam(content: string): boolean {
    const lowerContent = content.toLowerCase();
    return SPAM_KEYWORDS.some((keyword) => lowerContent.includes(keyword));
  }

  /**
   * 根据 ID 获取评论
   */
  async findById(id: string): Promise<Comment | null> {
    return prisma.comment.findUnique({
      where: { id },
      include: { article: true, user: true, replies: true },
    });
  }

  /**
   * 获取文章的评论
   */
  async findByArticle(
    articleId: string,
    options: { status?: string; page?: number; limit?: number } = {}
  ): Promise<{ items: Comment[]; total: number }> {
    const { status = 'APPROVED', page = 1, limit = 20 } = options;

    const where = { articleId, status, parentId: null };

    const [items, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: true,
          replies: { where: { status: 'APPROVED' }, orderBy: { createdAt: 'asc' } },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    return { items, total };
  }


  /**
   * 获取所有评论（后台管理）
   */
  async findAll(options: { status?: string; page?: number; limit?: number } = {}): Promise<{
    items: Comment[];
    total: number;
  }> {
    const { status, page = 1, limit = 20 } = options;

    const where = status ? { status } : {};

    const [items, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { article: true, user: true },
      }),
      prisma.comment.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 审核通过评论
   */
  async approve(id: string): Promise<Comment> {
    return prisma.comment.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  /**
   * 标记为垃圾评论
   */
  async markAsSpam(id: string): Promise<Comment> {
    return prisma.comment.update({
      where: { id },
      data: { status: 'SPAM' },
    });
  }

  /**
   * 移至回收站
   */
  async trash(id: string): Promise<Comment> {
    return prisma.comment.update({
      where: { id },
      data: { status: 'TRASHED' },
    });
  }

  /**
   * 删除评论
   */
  async delete(id: string): Promise<void> {
    // 先删除回复
    await prisma.comment.deleteMany({ where: { parentId: id } });
    // 再删除评论
    await prisma.comment.delete({ where: { id } });
  }

  /**
   * 获取待审核评论数量
   */
  async getPendingCount(): Promise<number> {
    return prisma.comment.count({ where: { status: 'PENDING' } });
  }
}

export const commentService = new CommentService();
