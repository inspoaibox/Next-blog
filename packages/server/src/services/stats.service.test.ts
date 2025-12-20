import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { StatsService } from './stats.service.js';
import { ArticleService } from './article.service.js';

const prisma = new PrismaClient();
const statsService = new StatsService();
const articleService = new ArticleService();

let testUserId: string;

beforeAll(async () => {
  await prisma.pageView.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.articleTag.deleteMany({});
  await prisma.articleVersion.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.user.deleteMany({ where: { username: { startsWith: 'stats-test-' } } });

  const user = await prisma.user.create({
    data: {
      username: 'stats-test-' + Date.now(),
      passwordHash: 'test-hash',
      role: 'ADMIN',
    },
  });
  testUserId = user.id;
});

afterEach(async () => {
  await prisma.pageView.deleteMany({});
  await prisma.articleTag.deleteMany({});
  await prisma.articleVersion.deleteMany({});
  await prisma.article.deleteMany({});
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { username: { startsWith: 'stats-test-' } } });
  await prisma.$disconnect();
});

describe('StatsService', () => {
  /**
   * **Feature: blog-system, Property 25: 浏览量统计**
   * **Validates: Requirements 11.1**
   */
  it('Property 25: 浏览量统计', async () => {
    // 创建并发布文章
    const article = await articleService.create({
      title: 'Test Article',
      content: 'Test content',
      authorId: testUserId,
    });
    await articleService.publish(article.id);

    // 初始浏览量为 0
    const initialCount = await statsService.getArticleViewCount(article.id);
    expect(initialCount).toBe(0);

    // 记录访问
    await statsService.recordView({
      articleId: article.id,
      path: `/articles/${article.slug}`,
    });

    // 浏览量增加
    const newCount = await statsService.getArticleViewCount(article.id);
    expect(newCount).toBe(1);

    // 再次访问
    await statsService.recordView({
      articleId: article.id,
      path: `/articles/${article.slug}`,
    });

    const finalCount = await statsService.getArticleViewCount(article.id);
    expect(finalCount).toBe(2);
  }, 60000);

  /**
   * **Feature: blog-system, Property 26: 热门文章排序**
   * **Validates: Requirements 11.2**
   */
  it('Property 26: 热门文章排序', async () => {
    // 创建多篇文章
    const article1 = await articleService.create({
      title: 'Article 1',
      content: 'Content 1',
      authorId: testUserId,
    });
    await articleService.publish(article1.id);

    const article2 = await articleService.create({
      title: 'Article 2',
      content: 'Content 2',
      authorId: testUserId,
    });
    await articleService.publish(article2.id);

    // 给 article2 更多浏览量
    await statsService.recordView({ articleId: article2.id, path: '/a2' });
    await statsService.recordView({ articleId: article2.id, path: '/a2' });
    await statsService.recordView({ articleId: article2.id, path: '/a2' });

    // 给 article1 较少浏览量
    await statsService.recordView({ articleId: article1.id, path: '/a1' });

    // 获取热门文章
    const popular = await statsService.getPopularArticles();

    // 验证按浏览量降序排列
    expect(popular[0].id).toBe(article2.id);
    expect(popular[0].viewCount).toBe(3);
    expect(popular[1].id).toBe(article1.id);
    expect(popular[1].viewCount).toBe(1);
  }, 60000);
});
