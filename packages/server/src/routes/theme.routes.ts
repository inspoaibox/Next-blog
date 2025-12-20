import { Router, Response } from 'express';
import { z } from 'zod';
import { themeService } from '../services/theme.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

const installThemeSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  path: z.string().min(1),
  config: z.record(z.any()).optional(),
});

const updateConfigSchema = z.record(z.any());

router.get('/', async (_req, res, next) => {
  try {
    const themes = await themeService.findAll();
    res.json({ success: true, data: themes });
  } catch (error) {
    next(error);
  }
});

// 初始化内置主题（如果不存在则创建，不会删除现有数据）
router.post('/init', authenticate, async (_req: AuthRequest, res: Response, next) => {
  try {
    const themes = await themeService.initBuiltinThemes();
    res.json({ success: true, data: themes });
  } catch (error) {
    next(error);
  }
});

router.get('/active', async (_req, res, next) => {
  try {
    const theme = await themeService.getActive();
    res.json({ success: true, data: theme });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const theme = await themeService.findById(req.params.id);
    if (!theme) return next(createError('Theme not found', 404, 'NOT_FOUND'));
    res.json({ success: true, data: theme });
  } catch (error) {
    next(error);
  }
});

router.post('/install', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const input = installThemeSchema.parse(req.body);
    const theme = await themeService.install(input);
    res.status(201).json({ success: true, data: theme });
  } catch (error) {
    if (error instanceof z.ZodError) return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    next(error);
  }
});

router.put('/:id/activate', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const theme = await themeService.activate(req.params.id);
    res.json({ success: true, data: theme });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/config', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const config = updateConfigSchema.parse(req.body);
    const theme = await themeService.updateConfig(req.params.id, config);
    res.json({ success: true, data: theme });
  } catch (error) {
    if (error instanceof z.ZodError) return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    next(error);
  }
});

// 通用更新路由（支持 config 字段）
router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { config } = req.body;
    if (config !== undefined) {
      // config 可能是对象或字符串
      const configObj = typeof config === 'string' ? JSON.parse(config) : config;
      const theme = await themeService.updateConfig(req.params.id, configObj);
      res.json({ success: true, data: theme });
    } else {
      res.json({ success: true, data: await themeService.findById(req.params.id) });
    }
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await themeService.uninstall(req.params.id);
    res.json({ success: true, data: { message: 'Theme uninstalled' } });
  } catch (error) {
    next(error);
  }
});

export default router;
