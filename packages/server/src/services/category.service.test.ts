import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { PrismaClient } from '@prisma/client';
import { CategoryService } from './category.service.js';
import { ArticleService } from './article.service.js';

const prisma = new PrismaClient();
const categoryService = new CategoryService();
const articleService = new ArticleService();

let testUserId: string;

beforeAll(async () => {
  await prisma.articleTag.deleteMany({});
  await prisma.articleVersion.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({ where: { username: { startsWith: 'cat-test-' } } });

  const user = await prisma.user.create({
    data: {
      username: 'cat-test-' + Date.now(),
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
  await prisma.category.deleteMany({});
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { username: { startsWith: 'cat-test-' } } });
  await prisma.$disconnect();
});

describe('CategoryService', () => {
  /**
   * **Feature: blog-system, Property 7: 分类层级结构正确性**
   * **Validates: Requirements 4.1**
   */
  it('Property 7: 分类层级结构正确性', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          parentName: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          childName: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        }),
        async ({ parentName, childName }) => {
          // 创建父分类
          const parent = await categoryService.create({ name: parentName });
          
          // 创建子分类
          const child = await categoryService.create({ 
            name: childName, 
            parentId: parent.id 
          });

          // 验证层级关系
          expect(child.parentId).toBe(parent.id);

          // 通过父分类获取子分类
          const children = await categoryService.getChildren(parent.id);
          expect(children.some(c => c.id === child.id)).toBe(true);

          // 获取子分类详情，验证父分类信息
          const childDetail = await categoryService.findById(child.id);
          expect((childDetail as any).parent?.id).toBe(parent.id);

          return true;
        }
      ),
      { numRuns: 5 }
    );
  }, 60000);


  /**
   * **Feature: blog-system, Property 9: 分类删除文章迁移**
   * **Validates: Requirements 4.3**
   */
  it('Property 9: 分类删除文章迁移', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          categoryName: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          targetCategoryName: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          articleTitle: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
        }),
        async ({ categoryName, targetCategoryName, articleTitle }) => {
          // 创建两个分类
          const sourceCategory = await categoryService.create({ name: categoryName });
          const targetCategory = await categoryService.create({ name: targetCategoryName });

          // 创建文章并关联到源分类
          const article = await articleService.create({
            title: articleTitle,
            content: 'Test content',
            authorId: testUserId,
            categoryId: sourceCategory.id,
          });

          // 删除源分类，文章迁移到目标分类
          await categoryService.delete(sourceCategory.id, targetCategory.id);

          // 验证文章已迁移到目标分类
          const updatedArticle = await articleService.findById(article.id);
          expect(updatedArticle?.categoryId).toBe(targetCategory.id);

          // 验证源分类已删除
          const deletedCategory = await categoryService.findById(sourceCategory.id);
          expect(deletedCategory).toBeNull();

          return true;
        }
      ),
      { numRuns: 5 }
    );
  }, 60000);

  /**
   * **Feature: blog-system, Property 12: 分类筛选正确性**
   * **Validates: Requirements 5.4**
   */
  it('Property 12: 分类筛选正确性', async () => {
    // 创建分类
    const category = await categoryService.create({ name: 'filter-test-cat-' + Date.now() });

    // 创建两篇文章，一篇有分类，一篇没有
    const articleWithCategory = await articleService.create({
      title: 'Article with category',
      content: 'Content',
      authorId: testUserId,
      categoryId: category.id,
    });
    await articleService.publish(articleWithCategory.id);

    const articleWithoutCategory = await articleService.create({
      title: 'Article without category',
      content: 'Content',
      authorId: testUserId,
    });
    await articleService.publish(articleWithoutCategory.id);

    // 按分类筛选
    const { items } = await articleService.findPublished({ categoryId: category.id });

    // 验证只返回该分类的文章
    expect(items.length).toBe(1);
    expect(items[0].id).toBe(articleWithCategory.id);
  }, 60000);
});
