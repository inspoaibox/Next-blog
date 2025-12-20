import { prisma } from '../lib/prisma.js';
import type { PageView } from '@prisma/client';

export interface RecordViewInput {
  articleId?: string;
  path: string;
  ip?: string;
  userAgent?: string;
  referer?: string;
}

export class StatsService {
  /**
   * 记录页面访问
   */
  async recordView(input: RecordViewInput): Promise<PageView> {
    // 记录访问
    const view = await prisma.pageView.create({
      data: {
        articleId: input.articleId,
        path: input.path,
        ip: input.ip,
        userAgent: input.userAgent,
        referer: input.referer,
      },
    });

    // 如果是文章页面，更新文章浏览量
    if (input.articleId) {
      await prisma.article.update({
        where: { id: input.articleId },
        data: { viewCount: { increment: 1 } },
      });
    }

    return view;
  }

  /**
   * 获取文章浏览量
   */
  async getArticleViewCount(articleId: string): Promise<number> {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { viewCount: true },
    });
    return article?.viewCount ?? 0;
  }

  /**
   * 获取热门文章
   */
  async getPopularArticles(limit: number = 10) {
    return prisma.article.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      orderBy: { viewCount: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        publishedAt: true,
      },
    });
  }


  /**
   * 获取总体统计
   */
  async getOverallStats() {
    const [totalArticles, publishedArticles, totalViews, totalComments] = await Promise.all([
      prisma.article.count({ where: { deletedAt: null } }),
      prisma.article.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
      prisma.pageView.count(),
      prisma.comment.count({ where: { status: 'APPROVED' } }),
    ]);

    return {
      totalArticles,
      publishedArticles,
      totalViews,
      totalComments,
    };
  }

  /**
   * 获取最近访问记录
   */
  async getRecentViews(limit: number = 100): Promise<PageView[]> {
    return prisma.pageView.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * 获取按日期统计的访问量
   */
  async getViewsByDate(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const views = await prisma.pageView.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    });

    // 按日期分组
    const byDate: Record<string, number> = {};
    for (const view of views) {
      const date = view.createdAt.toISOString().split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;
    }

    return byDate;
  }
}

export const statsService = new StatsService();
