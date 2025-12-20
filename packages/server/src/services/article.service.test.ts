import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { PrismaClient } from '@prisma/client';
import { ArticleService } from './article.service.js';

const prisma = new PrismaClient();
const articleService = new ArticleService();

let testUserId: string;

beforeAll(async () => {
  // 清理并创建测试用户
  await prisma.articleVersion.deleteMany({});
  await prisma.articleTag.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.user.deleteMany({ where: { username: { startsWith: 'article-test-' } } });
  
  const user = await prisma.user.create({
    data: {
      username: 'article-test-' + Date.now(),
      passwordHash: 'test-hash',
      role: 'ADMIN',
    },
  });
  testUserId = user.id;
});

afterEach(async () => {
  // 每个测试后清理文章
  await prisma.articleVersion.deleteMany({});
  await prisma.articleTag.deleteMany({});
  await prisma.article.deleteMany({});
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { username: { startsWith: 'article-test-' } } });
  await prisma.$disconnect();
});

describe('ArticleService', () => {
  /**
   * **Feature: blog-system, Property 3: 文章创建生成唯一标识符**
   * **Validates: Requirements 2.1**
   */
  it('Property 3: 文章创建生成唯一标识符', async () => {
    const ids = new Set<string>();
    const slugs = new Set<string>();

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          content: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        async ({ title, content }) => {
          const article = await articleService.create({
            title,
            content,
            authorId: testUserId,
          });

          expect(article.id).toBeDefined();
          expect(article.slug).toBeDefined();
          expect(article.status).toBe('DRAFT');
          expect(ids.has(article.id)).toBe(false);
          expect(slugs.has(article.slug)).toBe(false);
          
          ids.add(article.id);
          slugs.add(article.slug);
          return true;
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  /**
   * **Feature: blog-system, Property 5: 软删除保留文章**
   * **Validates: Requirements 2.4, 13.3**
   */
  it('Property 5: 软删除保留文章', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          content: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        async ({ title, content }) => {
          const article = await articleService.create({
            title,
            content,
            authorId: testUserId,
          });

          const deletedArticle = await articleService.softDelete(article.id);

          expect(deletedArticle.status).toBe('TRASHED');
          expect(deletedArticle.deletedAt).not.toBeNull();

          const foundArticle = await articleService.findById(article.id);
          expect(foundArticle).not.toBeNull();
          expect(foundArticle?.status).toBe('TRASHED');

          return true;
        }
      ),
      { numRuns: 5 }
    );
  }, 60000);

  /**
   * **Feature: blog-system, Property 4: 已发布文章在前台可见**
   * **Validates: Requirements 2.3**
   */
  it('Property 4: 已发布文章在前台可见', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          content: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        async ({ title, content }) => {
          const article = await articleService.create({
            title,
            content,
            authorId: testUserId,
          });

          await articleService.publish(article.id);

          const { items } = await articleService.findPublished();
          const found = items.find(a => a.id === article.id);
          
          expect(found).toBeDefined();
          expect(found?.status).toBe('PUBLISHED');

          return true;
        }
      ),
      { numRuns: 5 }
    );
  }, 60000);

  /**
   * **Feature: blog-system, Property 27: 文章版本历史**
   * **Validates: Requirements 13.4**
   */
  it('Property 27: 文章版本历史', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          content: fc.string({ minLength: 1, maxLength: 100 }),
          newTitle: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          newContent: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        async ({ title, content, newTitle, newContent }) => {
          // 创建文章
          const article = await articleService.create({
            title,
            content,
            authorId: testUserId,
          });

          // 更新文章（应该创建版本记录）
          await articleService.update(article.id, {
            title: newTitle,
            content: newContent,
          });

          // 获取文章及其版本历史
          const updatedArticle = await articleService.findById(article.id);
          
          expect(updatedArticle).not.toBeNull();
          expect(updatedArticle?.title).toBe(newTitle);
          expect(updatedArticle?.content).toBe(newContent);
          
          // 验证版本历史包含原始内容
          const versions = (updatedArticle as any).versions;
          expect(versions).toBeDefined();
          expect(versions.length).toBeGreaterThan(0);
          expect(versions[0].title).toBe(title);
          expect(versions[0].content).toBe(content);

          return true;
        }
      ),
      { numRuns: 5 }
    );
  }, 60000);

  /**
   * **Feature: blog-system, Property 11: 文章列表时间倒序**
   * **Validates: Requirements 5.1**
   */
  it('Property 11: 文章列表时间倒序', async () => {
    // 创建多篇文章并发布
    const articles = [];
    for (let i = 0; i < 3; i++) {
      const article = await articleService.create({
        title: `Article ${i}`,
        content: `Content ${i}`,
        authorId: testUserId,
      });
      await articleService.publish(article.id);
      articles.push(article);
      // 小延迟确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const { items } = await articleService.findPublished();

    // 验证按发布时间倒序
    for (let i = 0; i < items.length - 1; i++) {
      const current = new Date(items[i].publishedAt!).getTime();
      const next = new Date(items[i + 1].publishedAt!).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  }, 60000);

  /**
   * **Feature: blog-system, Property 14: 搜索结果相关性**
   * **Validates: Requirements 5.6**
   */
  it('Property 14: 搜索结果相关性', async () => {
    const uniqueKeyword = 'uniquekeyword' + Date.now();

    // 创建包含关键词的文章
    const articleWithKeyword = await articleService.create({
      title: `Article with ${uniqueKeyword}`,
      content: 'Some content',
      authorId: testUserId,
    });
    await articleService.publish(articleWithKeyword.id);

    // 创建不包含关键词的文章
    const articleWithoutKeyword = await articleService.create({
      title: 'Another article',
      content: 'Different content',
      authorId: testUserId,
    });
    await articleService.publish(articleWithoutKeyword.id);

    // 搜索关键词
    const { items } = await articleService.findPublished({ search: uniqueKeyword });

    // 验证搜索结果包含关键词
    expect(items.length).toBe(1);
    expect(items[0].title).toContain(uniqueKeyword);
  }, 60000);
});
