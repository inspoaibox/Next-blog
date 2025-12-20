import { Router, Response } from 'express';
import multer from 'multer';
import { mediaService } from '../services/media.service.js';
import { settingService } from '../services/setting.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

// 默认允许的文件类型
const DEFAULT_ALLOWED_TYPES = 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf';

// 配置 multer 内存存储
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

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
    res.json({ success: true, data: result.items });
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
 * 上传媒体文件
 */
router.post('/upload', authenticate, upload.single('file'), async (req: AuthRequest, res: Response, next) => {
  try {
    const file = req.file;
    if (!file) {
      return next(createError('No file uploaded', 400, 'VALIDATION_ERROR'));
    }

    // 获取允许的文件类型
    const allowedTypes = await settingService.get('allowedMediaTypes') || DEFAULT_ALLOWED_TYPES;
    const allowedList = allowedTypes.split(',').map((t: string) => t.trim().toLowerCase());
    
    // 验证文件类型
    if (!allowedList.includes(file.mimetype.toLowerCase())) {
      return next(createError(`不支持的文件类型: ${file.mimetype}。允许的类型: ${allowedTypes}`, 400, 'VALIDATION_ERROR'));
    }

    const media = await mediaService.upload({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    });

    // 返回可访问的 URL
    res.status(201).json({ 
      success: true, 
      data: {
        ...media,
        url: `/api/media/${media.id}/file`,
        path: `/api/media/${media.id}/file`,
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/media/batch
 * 批量删除媒体
 */
router.delete('/batch', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return next(createError('请提供要删除的文件ID列表', 400, 'VALIDATION_ERROR'));
    }

    for (const id of ids) {
      await mediaService.delete(id);
    }

    res.json({ success: true, data: { message: `已删除 ${ids.length} 个文件` } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/media/:id/file
 * 获取媒体文件（用于显示）
 */
router.get('/:id/file', async (req, res, next) => {
  try {
    const result = await mediaService.getFileBuffer(req.params.id);
    if (!result) {
      return next(createError('Media not found', 404, 'NOT_FOUND'));
    }

    res.setHeader('Content-Type', result.media.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(result.buffer);
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
