import { Router, Response } from 'express';
import { z } from 'zod';
import { pluginService } from '../services/plugin.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

const installPluginSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  path: z.string().min(1),
  config: z.record(z.any()).optional(),
  dependencies: z.array(z.string()).optional(),
});

const updateConfigSchema = z.record(z.any());

router.get('/', async (_req, res, next) => {
  try {
    const plugins = await pluginService.findAll();
    res.json({ success: true, data: plugins });
  } catch (error) {
    next(error);
  }
});

router.get('/enabled', async (_req, res, next) => {
  try {
    const plugins = await pluginService.findEnabled();
    res.json({ success: true, data: plugins });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const plugin = await pluginService.findById(req.params.id);
    if (!plugin) return next(createError('Plugin not found', 404, 'NOT_FOUND'));
    res.json({ success: true, data: plugin });
  } catch (error) {
    next(error);
  }
});

router.post('/install', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const input = installPluginSchema.parse(req.body);
    const plugin = await pluginService.install(input);
    res.status(201).json({ success: true, data: plugin });
  } catch (error) {
    if (error instanceof z.ZodError) return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    next(error);
  }
});

router.put('/:id/enable', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const plugin = await pluginService.enable(req.params.id);
    res.json({ success: true, data: plugin });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/disable', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const plugin = await pluginService.disable(req.params.id);
    res.json({ success: true, data: plugin });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/config', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const config = updateConfigSchema.parse(req.body);
    const plugin = await pluginService.updateConfig(req.params.id, config);
    res.json({ success: true, data: plugin });
  } catch (error) {
    if (error instanceof z.ZodError) return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    next(error);
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await pluginService.uninstall(req.params.id);
    res.json({ success: true, data: { message: 'Plugin uninstalled' } });
  } catch (error) {
    next(error);
  }
});

export default router;
