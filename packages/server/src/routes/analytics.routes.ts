import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { analyticsService } from '../services/analytics.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// 访客追踪专用限制（更宽松）
const trackingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 60, // 每分钟最多60次
  message: { success: false, error: 'Too many tracking requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 公开接口：记录访客数据（前端调用）
router.post('/track', trackingLimiter, async (req: Request, res: Response) => {
  try {
    console.log('[Analytics] Track request received:', {
      visitorId: req.body.visitorId,
      path: req.body.path,
      eventType: req.body.eventType,
      ip: req.ip,
    });
    const result = await analyticsService.track(req.body);
    console.log('[Analytics] Track success:', result);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Analytics] Track error:', error);
    res.status(500).json({ success: false, error: 'Failed to track' });
  }
});

// 以下接口需要管理员权限
router.use(authenticate);

// 获取统计概览
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await analyticsService.getSummary(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ success: false, error: 'Failed to get summary' });
  }
});

// 获取时间序列数据
router.get('/timeseries', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, granularity } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate as string) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : now;
    
    const data = await analyticsService.getTimeSeries(
      start,
      end,
      (granularity as 'hour' | 'day' | 'week' | 'month') || 'day'
    );
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get timeseries error:', error);
    res.status(500).json({ success: false, error: 'Failed to get timeseries' });
  }
});

// 获取热门页面
router.get('/top-pages', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, limit } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate as string) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : now;
    
    const data = await analyticsService.getTopPages(start, end, Number(limit) || 10);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get top pages error:', error);
    res.status(500).json({ success: false, error: 'Failed to get top pages' });
  }
});

// 获取来源统计
router.get('/top-referers', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, limit } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate as string) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : now;
    
    const data = await analyticsService.getTopReferers(start, end, Number(limit) || 10);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get top referers error:', error);
    res.status(500).json({ success: false, error: 'Failed to get top referers' });
  }
});

// 获取设备统计
router.get('/devices', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate as string) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : now;
    
    const data = await analyticsService.getDeviceStats(start, end);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get device stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get device stats' });
  }
});

// 获取浏览器统计
router.get('/browsers', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate as string) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : now;
    
    const data = await analyticsService.getBrowserStats(start, end);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get browser stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get browser stats' });
  }
});

// 获取地区统计
router.get('/countries', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate as string) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : now;
    
    const data = await analyticsService.getCountryStats(start, end);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get country stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get country stats' });
  }
});

// 获取实时访客
router.get('/realtime', async (req: Request, res: Response) => {
  try {
    const { minutes } = req.query;
    const data = await analyticsService.getRealtimeVisitors(Number(minutes) || 5);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get realtime visitors error:', error);
    res.status(500).json({ success: false, error: 'Failed to get realtime visitors' });
  }
});

// 获取访客列表
router.get('/visitors', async (req: Request, res: Response) => {
  try {
    const { page, pageSize, startDate, endDate } = req.query;
    const data = await analyticsService.getVisitors(
      Number(page) || 1,
      Number(pageSize) || 20,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get visitors error:', error);
    res.status(500).json({ success: false, error: 'Failed to get visitors' });
  }
});

// 获取访客详情
router.get('/visitors/:visitorId', async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getVisitorDetail(req.params.visitorId);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Visitor not found' });
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get visitor detail error:', error);
    res.status(500).json({ success: false, error: 'Failed to get visitor detail' });
  }
});

export default router;
