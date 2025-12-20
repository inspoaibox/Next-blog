import { Router, Response } from 'express';
import { z } from 'zod';
import { commentService } from '../services/comment.service.js';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

const createCommentSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  authorName: z.string().min(1, 'Author name is required'),
  authorEmail: z.string().email('Invalid email'),
  articleId: z.string().min(1, 'Article ID is required'),
  parentId: z.string().optional(),
});

router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const result = await commentService.findAll({ status, page, limit });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/article/:articleId', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await commentService.findByArticle(req.params.articleId, { page, limit });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/pending/count', authenticate, async (_req, res, next) => {
  try {
    const count = await commentService.getPendingCount();
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
});

router.post('/', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const input = createCommentSchema.parse(req.body);
    const comment = await commentService.create({ ...input, userId: req.user?.userId });
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    if (error instanceof z.ZodError) return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    next(error);
  }
});

router.put('/:id/approve', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const comment = await commentService.approve(req.params.id);
    res.json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/spam', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const comment = await commentService.markAsSpam(req.params.id);
    res.json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await commentService.delete(req.params.id);
    res.json({ success: true, data: { message: 'Comment deleted' } });
  } catch (error) {
    next(error);
  }
});

export default router;
