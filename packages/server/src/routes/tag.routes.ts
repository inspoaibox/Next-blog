import { Router, Response } from 'express';
import { z } from 'zod';
import { tagService } from '../services/tag.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

const updateTagSchema = z.object({
  name: z.string().min(1).optional(),
});

const mergeTagsSchema = z.object({
  sourceId: z.string().min(1, 'Source tag ID is required'),
  targetId: z.string().min(1, 'Target tag ID is required'),
});

/**
 * GET /api/tags
 * 获取标签列表
 */
router.get('/', async (_req, res, next) => {
  try {
    const tags = await tagService.findAll();
    res.json({ success: true, data: tags });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tags/:id
 * 获取标签详情
 */
router.get('/:id', async (req, res, next) => {
  try {
    const tag = await tagService.findById(req.params.id);
    if (!tag) {
      return next(createError('Tag not found', 404, 'NOT_FOUND'));
    }
    res.json({ success: true, data: tag });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tags
 * 创建标签
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const input = createTagSchema.parse(req.body);
    const tag = await tagService.create(input);
    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
});


/**
 * PUT /api/tags/:id
 * 更新标签
 */
router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const input = updateTagSchema.parse(req.body);
    const tag = await tagService.update(req.params.id, input);
    res.json({ success: true, data: tag });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
});

/**
 * DELETE /api/tags/:id
 * 删除标签
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await tagService.delete(req.params.id);
    res.json({ success: true, data: { message: 'Tag deleted' } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tags/merge
 * 合并标签
 */
router.post('/merge', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { sourceId, targetId } = mergeTagsSchema.parse(req.body);
    const tag = await tagService.merge(sourceId, targetId);
    res.json({ success: true, data: tag });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
});

export default router;
