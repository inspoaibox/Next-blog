import { Router, Response } from 'express';
import { backupService } from '../services/backup.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

router.post('/export', authenticate, async (_req: AuthRequest, res: Response, next) => {
  try {
    const data = await backupService.exportAll();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/import', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = req.body;
    if (!data || !data.version) {
      return next(createError('Invalid backup data', 400, 'VALIDATION_ERROR'));
    }
    const result = await backupService.importAll(data);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/export/markdown', authenticate, async (_req: AuthRequest, res: Response, next) => {
  try {
    const files = await backupService.exportArticlesAsMarkdown();
    res.json({ success: true, data: files });
  } catch (error) {
    next(error);
  }
});

export default router;
