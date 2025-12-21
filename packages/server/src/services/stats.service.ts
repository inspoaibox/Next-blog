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
    const [
      totalArticles, 
      publishedArticles, 
      totalViews, 
      totalComments,
      pendingComments,
      totalCategories,
      totalTags,
    ] = await Promise.all([
      prisma.article.count({ where: { deletedAt: null } }),
      prisma.article.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
      prisma.pageView.count(),
      prisma.comment.count({ where: { status: 'APPROVED' } }),
      prisma.comment.count({ where: { status: 'PENDING' } }),
      prisma.category.count(),
      prisma.tag.count(),
    ]);

    return {
      totalArticles,
      publishedArticles,
      totalViews,
      totalComments,
      pendingComments,
      totalCategories,
      totalTags,
    };
  }

  /**
   * 获取公开统计数据（供前台主题使用）
   */
  async getPublicStats() {
    const [
      totalArticles,
      totalViews,
      totalCategories,
      totalTags,
      totalComments,
      recentArticlesCount,
      serverStartTime,
    ] = await Promise.all([
      prisma.article.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
      prisma.pageView.count(),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.comment.count({ where: { status: 'APPROVED' } }),
      // 最近30天发布的文章数
      prisma.article.count({
        where: {
          status: 'PUBLISHED',
          deletedAt: null,
          publishedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      // 获取最早的文章发布时间作为"运行时间"参考
      prisma.article.findFirst({
        where: { status: 'PUBLISHED', deletedAt: null },
        orderBy: { publishedAt: 'asc' },
        select: { publishedAt: true },
      }),
    ]);

    // 计算运行天数（从第一篇文章发布开始）
    const firstPublishDate = serverStartTime?.publishedAt;
    const runningDays = firstPublishDate 
      ? Math.floor((Date.now() - firstPublishDate.getTime()) / (24 * 60 * 60 * 1000))
      : 0;

    return {
      totalArticles,
      totalViews,
      totalCategories,
      totalTags,
      totalComments,
      recentArticlesCount,
      runningDays,
      lastUpdated: new Date().toISOString(),
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
