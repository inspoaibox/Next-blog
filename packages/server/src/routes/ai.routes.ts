import { Router, Response } from 'express';
import { z } from 'zod';
import { aiService } from '../services/ai.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

const createModelSchema = z.object({
  name: z.string().min(1),
  provider: z.string().min(1),
  apiUrl: z.string().url(),
  apiKey: z.string().min(1),
  modelId: z.string().min(1),
  config: z.record(z.any()).optional(),
});

const updateModelSchema = z.object({
  name: z.string().min(1).optional(),
  provider: z.string().min(1).optional(),
  apiUrl: z.string().url().optional(),
  apiKey: z.string().min(1).optional(),
  modelId: z.string().min(1).optional(),
  isEnabled: z.boolean().optional(),
  config: z.record(z.any()).optional(),
});

const generateSchema = z.object({
  idea: z.string().min(1),
  style: z.string().optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
});

router.get('/models', authenticate, async (_req, res, next) => {
  try {
    const models = await aiService.findAll();
    // 不返回 API Key
    const safeModels = models.map((m) => ({ ...m, apiKey: '***' }));
    res.json({ success: true, data: safeModels });
  } catch (error) {
    next(error);
  }
});

router.get('/models/:id', authenticate, async (req, res, next) => {
  try {
    const model = await aiService.findById(req.params.id);
    if (!model) return next(createError('Model not found', 404, 'NOT_FOUND'));
    res.json({ success: true, data: { ...model, apiKey: '***' } });
  } catch (error) {
    next(error);
  }
});

router.post('/models', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const input = createModelSchema.parse(req.body);
    const model = await aiService.createModel(input);
    res.status(201).json({ success: true, data: { ...model, apiKey: '***' } });
  } catch (error) {
    if (error instanceof z.ZodError) return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    next(error);
  }
});

router.put('/models/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const input = updateModelSchema.parse(req.body);
    const model = await aiService.updateModel(req.params.id, input);
    res.json({ success: true, data: { ...model, apiKey: '***' } });
  } catch (error) {
    if (error instanceof z.ZodError) return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    next(error);
  }
});

router.delete('/models/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await aiService.deleteModel(req.params.id);
    res.json({ success: true, data: { message: 'Model deleted' } });
  } catch (error) {
    next(error);
  }
});

router.put('/models/:id/default', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const model = await aiService.setDefault(req.params.id);
    res.json({ success: true, data: { ...model, apiKey: '***' } });
  } catch (error) {
    next(error);
  }
});

router.post('/models/:id/test', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const result = await aiService.testConnection(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/generate', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const input = generateSchema.parse(req.body);
    const result = await aiService.generateArticle(input);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    next(error);
  }
});

router.get('/logs', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await aiService.getUsageLogs({ page, limit });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
