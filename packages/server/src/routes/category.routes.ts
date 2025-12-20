import { Router, Response } from 'express';
import { z } from 'zod';
import { categoryService } from '../services/category.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  parentId: z.string().optional(),
  sortOrder: z.number().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
});

/**
 * GET /api/categories
 * 获取分类列表（树形结构）
 */
router.get('/', async (_req, res, next) => {
  try {
    const categories = await categoryService.findAll();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/categories/flat
 * 获取分类列表（平铺）
 */
router.get('/flat', async (_req, res, next) => {
  try {
    const categories = await categoryService.findAllFlat();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/categories/:id
 * 获取分类详情
 */
router.get('/:id', async (req, res, next) => {
  try {
    const category = await categoryService.findById(req.params.id);
    if (!category) {
      return next(createError('Category not found', 404, 'NOT_FOUND'));
    }
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
});


/**
 * POST /api/categories
 * 创建分类
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const input = createCategorySchema.parse(req.body);
    const category = await categoryService.create(input);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
});

/**
 * PUT /api/categories/:id
 * 更新分类
 */
router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const input = updateCategorySchema.parse(req.body);
    const category = await categoryService.update(req.params.id, input);
    res.json({ success: true, data: category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
});

/**
 * DELETE /api/categories/:id
 * 删除分类
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const migrateToId = req.query.migrateToId as string | undefined;
    await categoryService.delete(req.params.id, migrateToId);
    res.json({ success: true, data: { message: 'Category deleted' } });
  } catch (error) {
    next(error);
  }
});

export default router;
