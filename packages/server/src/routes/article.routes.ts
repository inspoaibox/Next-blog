import { Router, Response } from 'express';
import { z } from 'zod';
import { articleService } from '../services/article.service.js';
import { markdownService } from '../services/markdown.service.js';
import { authenticate, AuthRequest, optionalAuth } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

// 验证 schema
const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

const updateArticleSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'TRASHED']).optional(),
  categoryId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

/**
 * GET /api/articles
 * 获取文章列表（后台管理）
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;

    const result = await articleService.findAll({ page, limit, status });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});


/**
 * GET /api/articles/published
 * 获取已发布文章列表（前台公开）
 */
router.get('/published', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const categoryId = req.query.categoryId as string | undefined;
    const tagId = req.query.tagId as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await articleService.findPublished({ page, limit, categoryId, tagId, search });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/articles/popular
 * 获取热门文章
 */
router.get('/popular', async (_req, res, next) => {
  try {
    const limit = parseInt(_req.query.limit as string) || 10;
    const articles = await articleService.findPopular(limit);

    res.json({
      success: true,
      data: articles,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/articles/:id
 * 获取文章详情（支持 ID 或 slug）
 */
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    // 先尝试通过 ID 查找，如果失败则尝试通过 slug 查找
    let article = await articleService.findById(req.params.id);
    if (!article) {
      article = await articleService.findBySlug(req.params.id);
    }

    if (!article) {
      return next(createError('Article not found', 404, 'NOT_FOUND'));
    }

    // 非管理员只能查看已发布文章
    if (!req.user && article.status !== 'PUBLISHED') {
      return next(createError('Article not found', 404, 'NOT_FOUND'));
    }

    // 增加浏览量（仅对已发布文章）
    if (article.status === 'PUBLISHED') {
      await articleService.incrementViewCount(article.id);
    }

    // 渲染 Markdown 为 HTML
    const { html, toc } = await markdownService.parse(article.content);

    // 处理标签数据格式
    const tags = (article as any).tags?.map((t: any) => t.tag || t) || [];

    res.json({
      success: true,
      data: {
        ...article,
        htmlContent: html,
        toc,
        tags,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/articles
 * 创建文章
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const input = createArticleSchema.parse(req.body);

    const article = await articleService.create({
      ...input,
      authorId: req.user!.userId,
    });

    res.status(201).json({
      success: true,
      data: article,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
});

/**
 * PUT /api/articles/:id
 * 更新文章
 */
router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const input = updateArticleSchema.parse(req.body);

    const article = await articleService.update(req.params.id, input);

    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
});

/**
 * DELETE /api/articles/:id
 * 删除文章（软删除）
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const article = await articleService.softDelete(req.params.id);

    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/articles/:id/publish
 * 发布文章
 */
router.post('/:id/publish', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const article = await articleService.publish(req.params.id);

    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/articles/:id/restore
 * 恢复已删除的文章
 */
router.post('/:id/restore', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const article = await articleService.restore(req.params.id);

    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
