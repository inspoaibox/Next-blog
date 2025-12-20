import { Router, Response } from 'express';
import { z } from 'zod';
import { settingService } from '../services/setting.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

const updateSettingsSchema = z.record(z.string());

// 获取公开设置（无需认证）
router.get('/public', async (_req, res, next) => {
  try {
    const settings = await settingService.getPublic();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

// 获取所有设置（需要认证）
router.get('/', authenticate, async (_req: AuthRequest, res: Response, next) => {
  try {
    const settings = await settingService.getAll();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

// 更新设置（需要认证）
router.put('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const settings = updateSettingsSchema.parse(req.body);
    await settingService.setMany(settings);
    const updated = await settingService.getAll();
    res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
});

// 获取单个设置
router.get('/:key', async (req, res, next) => {
  try {
    const value = await settingService.get(req.params.key);
    res.json({ success: true, data: { key: req.params.key, value } });
  } catch (error) {
    next(error);
  }
});

export default router;
