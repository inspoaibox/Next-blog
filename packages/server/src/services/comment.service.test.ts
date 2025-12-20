import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { PrismaClient } from '@prisma/client';
import { CommentService } from './comment.service.js';
import { ArticleService } from './article.service.js';

const prisma = new PrismaClient();
const commentService = new CommentService();
const articleService = new ArticleService();

let testUserId: string;
let testArticleId: string;

beforeAll(async () => {
  await prisma.comment.deleteMany({});
  await prisma.articleTag.deleteMany({});
  await prisma.articleVersion.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.user.deleteMany({ where: { username: { startsWith: 'comment-test-' } } });

  const user = await prisma.user.create({
    data: {
      username: 'comment-test-' + Date.now(),
      passwordHash: 'test-hash',
      role: 'ADMIN',
    },
  });
  testUserId = user.id;

  const article = await articleService.create({
    title: 'Test Article',
    content: 'Test content',
    authorId: testUserId,
  });
  await articleService.publish(article.id);
  testArticleId = article.id;
});

afterEach(async () => {
  await prisma.comment.deleteMany({});
});

afterAll(async () => {
  await prisma.articleTag.deleteMany({});
  await prisma.articleVersion.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.user.deleteMany({ where: { username: { startsWith: 'comment-test-' } } });
  await prisma.$disconnect();
});

describe('CommentService', () => {
  /**
   * **Feature: blog-system, Property 23: 评论文章关联**
   * **Validates: Requirements 10.1**
   */
  it('Property 23: 评论文章关联', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          content: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
          authorName: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
        }),
        async ({ content, authorName }) => {
          const comment = await commentService.create({
            content,
            authorName,
            authorEmail: 'test@example.com',
            articleId: testArticleId,
          });

          // 验证评论关联到文章
          expect(comment.articleId).toBe(testArticleId);

          // 获取评论详情，验证包含文章信息
          const commentWithArticle = await commentService.findById(comment.id);
          expect((commentWithArticle as any).article?.id).toBe(testArticleId);

          return true;
        }
      ),
      { numRuns: 5 }
    );
  }, 60000);


  /**
   * **Feature: blog-system, Property 24: 评论状态更新**
   * **Validates: Requirements 10.2**
   */
  it('Property 24: 评论状态更新', async () => {
    // 创建评论
    const comment = await commentService.create({
      content: 'Test comment',
      authorName: 'Test User',
      authorEmail: 'test@example.com',
      articleId: testArticleId,
    });

    // 初始状态为 PENDING
    expect(comment.status).toBe('PENDING');

    // 审核通过
    const approved = await commentService.approve(comment.id);
    expect(approved.status).toBe('APPROVED');

    // 标记为垃圾
    const spam = await commentService.markAsSpam(comment.id);
    expect(spam.status).toBe('SPAM');

    // 移至回收站
    const trashed = await commentService.trash(comment.id);
    expect(trashed.status).toBe('TRASHED');
  }, 60000);

  it('should detect spam comments', async () => {
    const spamComment = await commentService.create({
      content: 'Click here for free money!',
      authorName: 'Spammer',
      authorEmail: 'spam@example.com',
      articleId: testArticleId,
    });

    // 垃圾评论应该自动标记为 SPAM
    expect(spamComment.status).toBe('SPAM');
  }, 60000);

  it('should get comments by article', async () => {
    // 创建并审核通过评论
    const comment = await commentService.create({
      content: 'Great article!',
      authorName: 'Reader',
      authorEmail: 'reader@example.com',
      articleId: testArticleId,
    });
    await commentService.approve(comment.id);

    // 获取文章评论
    const { items } = await commentService.findByArticle(testArticleId);

    expect(items.length).toBe(1);
    expect(items[0].id).toBe(comment.id);
  }, 60000);
});
