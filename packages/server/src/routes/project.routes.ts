import { Router, Response } from 'express';
import { z } from 'zod';
import { projectService } from '../services/project.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  content: z.string().optional(),
  techStack: z.string().optional(),
  githubUrl: z.string().optional(),
  demoUrl: z.string().optional(),
  docsUrl: z.string().optional(),
  chromeUrl: z.string().optional(),
  firefoxUrl: z.string().optional(),
  npmUrl: z.string().optional(),
  featuredImage: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  isRecommended: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  sortOrder: z.number().optional(),
  categoryId: z.string().optional(),
});

const updateSchema = createSchema.partial();

router.get('/published', async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const projects = await projectService.findPublished(categoryId);
    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const categoryId = req.query.categoryId as string | undefined;
    const status = req.query.status as string | undefined;
    const result = await projectService.findAll({ page, limit, categoryId, status });
    res.json({ success: true, data: result.projects, meta: { total: result.total, page, limit } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const project = await projectService.findById(req.params.id);
    if (!project) {
      return next(createError('Project not found', 404, 'NOT_FOUND'));
    }
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const input = createSchema.parse(req.body);
    const project = await projectService.create(input);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const input = updateSchema.parse(req.body);
    const project = await projectService.update(req.params.id, input);
    res.json({ success: true, data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await projectService.delete(req.params.id);
    res.json({ success: true, data: { message: 'Project deleted' } });
  } catch (error) {
    next(error);
  }
});

export default router;
