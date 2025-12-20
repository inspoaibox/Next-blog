import { Router, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { knowledgeService } from '../services/knowledge.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const createDocSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().default(''),
  parentId: z.string().optional().transform(v => v === '' ? undefined : v),
  sortOrder: z.number().optional(),
});

const updateDocSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  parentId: z.string().nullable().optional().transform(v => v === '' ? null : v),
  sortOrder: z.number().optional(),
});

const reorderSchema = z.array(z.object({ id: z.string(), sortOrder: z.number() }));

router.get('/', async (_req, res, next) => {
  try {
    const tree = await knowledgeService.findTree();
    res.json({ success: true, data: tree });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const doc = await knowledgeService.findById(req.params.id);
    if (!doc) return next(createError('Document not found', 404, 'NOT_FOUND'));
    res.json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const input = createDocSchema.parse(req.body);
    const doc = await knowledgeService.create(input);
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    if (error instanceof z.ZodError) return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    next(error);
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const input = updateDocSchema.parse(req.body);
    const doc = await knowledgeService.update(req.params.id, input);
    res.json({ success: true, data: doc });
  } catch (error) {
    if (error instanceof z.ZodError) return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    next(error);
  }
});

router.put('/reorder', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const items = reorderSchema.parse(req.body);
    await knowledgeService.reorder(items);
    res.json({ success: true, data: { message: 'Reordered' } });
  } catch (error) {
    if (error instanceof z.ZodError) return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    next(error);
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await knowledgeService.delete(req.params.id);
    res.json({ success: true, data: { message: 'Document deleted' } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/knowledge/upload
 * 上传文档文件 (支持 .md, .txt)
 */
router.post('/upload', authenticate, upload.single('file'), async (req: AuthRequest, res: Response, next) => {
  try {
    const file = req.file;
    if (!file) {
      return next(createError('No file uploaded', 400, 'VALIDATION_ERROR'));
    }

    const allowedTypes = ['text/plain', 'text/markdown', 'application/octet-stream'];
    const allowedExts = ['.md', '.txt', '.markdown'];
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.mimetype) && !allowedExts.includes(ext)) {
      return next(createError('只支持 .md 和 .txt 文件', 400, 'VALIDATION_ERROR'));
    }

    const content = file.buffer.toString('utf-8');
    const title = file.originalname.replace(/\.(md|txt|markdown)$/i, '');
    const parentId = req.body.parentId || undefined;

    const doc = await knowledgeService.create({ title, content, parentId });
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
});

export default router;
