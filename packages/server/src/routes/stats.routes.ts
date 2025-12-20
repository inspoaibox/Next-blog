import { Router, Response } from 'express';
import { statsService } from '../services/stats.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (_req, res, next) => {
  try {
    const stats = await statsService.getOverallStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

router.get('/popular', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const articles = await statsService.getPopularArticles(limit);
    res.json({ success: true, data: articles });
  } catch (error) {
    next(error);
  }
});

router.get('/views', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const views = await statsService.getViewsByDate(days);
    res.json({ success: true, data: views });
  } catch (error) {
    next(error);
  }
});

router.post('/record', async (req, res, next) => {
  try {
    const { articleId, path } = req.body;
    const view = await statsService.recordView({
      articleId,
      path,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer,
    });
    res.status(201).json({ success: true, data: view });
  } catch (error) {
    next(error);
  }
});

export default router;
