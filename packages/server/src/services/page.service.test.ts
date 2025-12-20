import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { PrismaClient } from '@prisma/client';
import { PageService } from './page.service.js';
import { ArticleService } from './article.service.js';

const prisma = new PrismaClient();
const pageService = new PageService();
const articleService = new ArticleService();

let testUserId: string;

beforeAll(async () => {
  await prisma.page.deleteMany({});
  await prisma.articleTag.deleteMany({});
  await prisma.articleVersion.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.user.deleteMany({ where: { username: { startsWith: 'page-test-' } } });

  const user = await prisma.user.create({
    data: {
      username: 'page-test-' + Date.now(),
      passwordHash: 'test-hash',
      role: 'ADMIN',
    },
  });
  testUserId = user.id;
});

afterEach(async () => {
  await prisma.page.deleteMany({});
  await prisma.articleTag.deleteMany({});
  await prisma.articleVersion.deleteMany({});
  await prisma.article.deleteMany({});
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { username: { startsWith: 'page-test-' } } });
  await prisma.$disconnect();
});

describe('PageService', () => {
  /**
   * **Feature: blog-system, Property 16: 页面独立于文章列表**
   * **Validates: Requirements 6.1**
   */
  it('Property 16: 页面独立于文章列表', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          pageTitle: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          articleTitle: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
        }),
        async ({ pageTitle, articleTitle }) => {
          // 创建页面
          const page = await pageService.create({
            title: pageTitle,
            content: 'Page content',
          });

          // 创建文章并发布
          const article = await articleService.create({
            title: articleTitle,
            content: 'Article content',
            authorId: testUserId,
          });
          await articleService.publish(article.id);

          // 获取文章列表
          const { items: articles } = await articleService.findPublished();

          // 验证页面不在文章列表中
          const pageInArticles = articles.some(a => a.id === page.id);
          expect(pageInArticles).toBe(false);

          // 验证页面可以单独获取
          const foundPage = await pageService.findById(page.id);
          expect(foundPage).not.toBeNull();
          expect(foundPage?.title).toBe(pageTitle);

          return true;
        }
      ),
      { numRuns: 5 }
    );
  }, 60000);


  /**
   * **Feature: blog-system, Property 17: 页面固定链接访问**
   * **Validates: Requirements 6.2**
   */
  it('Property 17: 页面固定链接访问', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          slug: fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-z0-9-]+$/.test(s)),
        }),
        async ({ title, slug }) => {
          const uniqueSlug = slug + '-' + Date.now();

          // 创建带固定链接的页面
          const page = await pageService.create({
            title,
            content: 'Page content',
            slug: uniqueSlug,
          });

          // 通过固定链接访问页面
          const foundPage = await pageService.findBySlug(uniqueSlug);

          expect(foundPage).not.toBeNull();
          expect(foundPage?.id).toBe(page.id);
          expect(foundPage?.slug).toBe(uniqueSlug);

          return true;
        }
      ),
      { numRuns: 5 }
    );
  }, 60000);

  /**
   * **Feature: blog-system, Property 18: 导航菜单页面显示**
   * **Validates: Requirements 6.3**
   */
  it('Property 18: 导航菜单页面显示', async () => {
    // 创建显示在导航中的页面
    const navPage = await pageService.create({
      title: 'Nav Page',
      content: 'Content',
      showInNav: true,
    });

    // 创建不显示在导航中的页面
    const hiddenPage = await pageService.create({
      title: 'Hidden Page',
      content: 'Content',
      showInNav: false,
    });

    // 获取导航页面
    const navPages = await pageService.findNavPages();

    // 验证只有 showInNav=true 的页面在导航中
    expect(navPages.some(p => p.id === navPage.id)).toBe(true);
    expect(navPages.some(p => p.id === hiddenPage.id)).toBe(false);
  }, 60000);
});
