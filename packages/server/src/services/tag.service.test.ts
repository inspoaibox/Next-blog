import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { PrismaClient } from '@prisma/client';
import { TagService } from './tag.service.js';
import { ArticleService } from './article.service.js';

const prisma = new PrismaClient();
const tagService = new TagService();
const articleService = new ArticleService();

let testUserId: string;

beforeAll(async () => {
  await prisma.articleTag.deleteMany({});
  await prisma.articleVersion.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.user.deleteMany({ where: { username: { startsWith: 'tag-test-' } } });

  const user = await prisma.user.create({
    data: {
      username: 'tag-test-' + Date.now(),
      passwordHash: 'test-hash',
      role: 'ADMIN',
    },
  });
  testUserId = user.id;
});

afterEach(async () => {
  await prisma.articleTag.deleteMany({});
  await prisma.articleVersion.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.tag.deleteMany({});
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { username: { startsWith: 'tag-test-' } } });
  await prisma.$disconnect();
});

describe('TagService', () => {
  /**
   * **Feature: blog-system, Property 8: 标签多文章关联**
   * **Validates: Requirements 4.2**
   */
  it('Property 8: 标签多文章关联', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          tagName: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          article1Title: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          article2Title: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
        }),
        async ({ tagName, article1Title, article2Title }) => {
          // 创建标签
          const tag = await tagService.create({ name: tagName });

          // 创建两篇文章并关联到同一标签
          const article1 = await articleService.create({
            title: article1Title,
            content: 'Content 1',
            authorId: testUserId,
            tagIds: [tag.id],
          });

          const article2 = await articleService.create({
            title: article2Title,
            content: 'Content 2',
            authorId: testUserId,
            tagIds: [tag.id],
          });

          // 验证标签关联了两篇文章
          const tagWithArticles = await tagService.findById(tag.id);
          const articleIds = (tagWithArticles as any).articles.map((a: any) => a.articleId);
          
          expect(articleIds).toContain(article1.id);
          expect(articleIds).toContain(article2.id);

          // 验证文章数量
          const count = await tagService.getArticleCount(tag.id);
          expect(count).toBe(2);

          return true;
        }
      ),
      { numRuns: 5 }
    );
  }, 60000);


  /**
   * **Feature: blog-system, Property 10: 标签合并文章转移**
   * **Validates: Requirements 4.4**
   */
  it('Property 10: 标签合并文章转移', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          sourceTagName: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          targetTagName: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          articleTitle: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
        }),
        async ({ sourceTagName, targetTagName, articleTitle }) => {
          // 创建两个标签
          const sourceTag = await tagService.create({ name: sourceTagName });
          const targetTag = await tagService.create({ name: targetTagName });

          // 创建文章并关联到源标签
          const article = await articleService.create({
            title: articleTitle,
            content: 'Test content',
            authorId: testUserId,
            tagIds: [sourceTag.id],
          });

          // 合并标签
          await tagService.merge(sourceTag.id, targetTag.id);

          // 验证文章已转移到目标标签
          const targetTagWithArticles = await tagService.findById(targetTag.id);
          const articleIds = (targetTagWithArticles as any).articles.map((a: any) => a.articleId);
          expect(articleIds).toContain(article.id);

          // 验证源标签已删除
          const deletedTag = await tagService.findById(sourceTag.id);
          expect(deletedTag).toBeNull();

          return true;
        }
      ),
      { numRuns: 5 }
    );
  }, 60000);

  /**
   * **Feature: blog-system, Property 6: 文章分类标签关联正确性**
   * **Validates: Requirements 2.6**
   */
  it('Property 6: 文章分类标签关联正确性', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          tagName1: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          tagName2: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          articleTitle: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
        }),
        async ({ tagName1, tagName2, articleTitle }) => {
          // 创建两个标签
          const tag1 = await tagService.create({ name: tagName1 });
          const tag2 = await tagService.create({ name: tagName2 });

          // 创建文章并关联多个标签
          const article = await articleService.create({
            title: articleTitle,
            content: 'Test content',
            authorId: testUserId,
            tagIds: [tag1.id, tag2.id],
          });

          // 验证文章关联了两个标签
          const articleWithTags = await articleService.findById(article.id);
          const tagIds = (articleWithTags as any).tags.map((t: any) => t.tagId);
          
          expect(tagIds).toContain(tag1.id);
          expect(tagIds).toContain(tag2.id);

          return true;
        }
      ),
      { numRuns: 5 }
    );
  }, 60000);

  /**
   * **Feature: blog-system, Property 13: 标签筛选正确性**
   * **Validates: Requirements 5.5**
   */
  it('Property 13: 标签筛选正确性', async () => {
    // 创建标签
    const tag = await tagService.create({ name: 'filter-test-tag-' + Date.now() });

    // 创建两篇文章，一篇有标签，一篇没有
    const articleWithTag = await articleService.create({
      title: 'Article with tag',
      content: 'Content',
      authorId: testUserId,
      tagIds: [tag.id],
    });
    await articleService.publish(articleWithTag.id);

    const articleWithoutTag = await articleService.create({
      title: 'Article without tag',
      content: 'Content',
      authorId: testUserId,
    });
    await articleService.publish(articleWithoutTag.id);

    // 按标签筛选
    const { items } = await articleService.findPublished({ tagId: tag.id });

    // 验证只返回有该标签的文章
    expect(items.length).toBe(1);
    expect(items[0].id).toBe(articleWithTag.id);
  }, 60000);
});
