import { Router, Response } from 'express';
import { z } from 'zod';
import { pageService } from '../services/page.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  slug: z.string().optional(),
  sortOrder: z.number().optional(),
  showInNav: z.boolean().optional(),
});

const updatePageSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  slug: z.string().optional(),
  sortOrder: z.number().optional(),
  showInNav: z.boolean().optional(),
});

/**
 * GET /api/pages
 * 获取所有页面
 */
router.get('/', async (_req, res, next) => {
  try {
    const pages = await pageService.findAll();
    res.json({ success: true, data: pages });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pages/nav
 * 获取导航菜单页面
 */
router.get('/nav', async (_req, res, next) => {
  try {
    const pages = await pageService.findNavPages();
    res.json({ success: true, data: pages });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pages/:slug
 * 根据 slug 获取页面
 */
router.get('/:slug', async (req, res, next) => {
  try {
    const page = await pageService.findBySlug(req.params.slug);
    if (!page) {
      return next(createError('Page not found', 404, 'NOT_FOUND'));
    }
    res.json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
});


/**
 * POST /api/pages
 * 创建页面
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const input = createPageSchema.parse(req.body);
    const page = await pageService.create(input);
    res.status(201).json({ success: true, data: page });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
});

/**
 * PUT /api/pages/:id
 * 更新页面
 */
router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const input = updatePageSchema.parse(req.body);
    const page = await pageService.update(req.params.id, input);
    res.json({ success: true, data: page });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
});

/**
 * DELETE /api/pages/:id
 * 删除页面
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await pageService.delete(req.params.id);
    res.json({ success: true, data: { message: 'Page deleted' } });
  } catch (error) {
    next(error);
  }
});

export default router;
