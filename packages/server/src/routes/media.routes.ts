import { Router, Response } from 'express';
import { mediaService } from '../services/media.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

/**
 * GET /api/media
 * 获取媒体列表
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const mimeType = req.query.mimeType as string | undefined;

    const result = await mediaService.findAll({ page, limit, mimeType });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/media/:id
 * 获取媒体详情
 */
router.get('/:id', async (req, res, next) => {
  try {
    const media = await mediaService.findById(req.params.id);
    if (!media) {
      return next(createError('Media not found', 404, 'NOT_FOUND'));
    }
    res.json({ success: true, data: media });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/media/:id/download
 * 下载媒体文件
 */
router.get('/:id/download', async (req, res, next) => {
  try {
    const result = await mediaService.getFileBuffer(req.params.id);
    if (!result) {
      return next(createError('Media not found', 404, 'NOT_FOUND'));
    }

    res.setHeader('Content-Type', result.media.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.media.originalName}"`);
    res.send(result.buffer);
  } catch (error) {
    next(error);
  }
});


/**
 * POST /api/media/upload
 * 上传媒体文件（简化版，实际应使用 multer）
 */
router.post('/upload', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    // 简化实现：从 base64 body 上传
    // 实际项目应使用 multer 处理 multipart/form-data
    const { filename, mimeType, data } = req.body;

    if (!filename || !mimeType || !data) {
      return next(createError('Missing required fields', 400, 'VALIDATION_ERROR'));
    }

    const buffer = Buffer.from(data, 'base64');

    const media = await mediaService.upload({
      originalName: filename,
      mimeType,
      size: buffer.length,
      buffer,
    });

    res.status(201).json({ success: true, data: media });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/media/:id
 * 删除媒体
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await mediaService.delete(req.params.id);
    res.json({ success: true, data: { message: 'Media deleted' } });
  } catch (error) {
    next(error);
  }
});

export default router;
