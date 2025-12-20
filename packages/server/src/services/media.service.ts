import { prisma } from '../lib/prisma.js';
import type { Media } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const THUMBNAIL_DIR = path.join(UPLOAD_DIR, 'thumbnails');

export interface UploadFileInput {
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

export class MediaService {
  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      await fs.mkdir(THUMBNAIL_DIR, { recursive: true });
    } catch {
      // Directories may already exist
    }
  }

  /**
   * 上传文件
   */
  async upload(input: UploadFileInput): Promise<Media> {
    await this.ensureDirectories();

    // 生成唯一文件名
    const ext = path.extname(input.originalName);
    const hash = crypto.createHash('md5').update(input.buffer).digest('hex');
    const filename = `${Date.now()}-${hash.substring(0, 8)}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // 保存文件
    await fs.writeFile(filePath, input.buffer);

    // 生成缩略图（仅图片）
    let thumbnailPath: string | null = null;
    if (input.mimeType.startsWith('image/')) {
      thumbnailPath = await this.generateThumbnail(input.buffer, filename);
    }

    // 保存到数据库
    return prisma.media.create({
      data: {
        filename,
        originalName: input.originalName,
        mimeType: input.mimeType,
        size: input.size,
        path: filePath,
        thumbnailPath,
      },
    });
  }


  /**
   * 生成缩略图（简化版，实际应使用 sharp 等库）
   */
  private async generateThumbnail(buffer: Buffer, filename: string): Promise<string> {
    // 简化实现：直接复制原图作为缩略图
    // 实际项目中应使用 sharp 库进行图片处理
    const thumbnailFilename = `thumb-${filename}`;
    const thumbnailPath = path.join(THUMBNAIL_DIR, thumbnailFilename);
    await fs.writeFile(thumbnailPath, buffer);
    return thumbnailPath;
  }

  /**
   * 根据 ID 获取媒体
   */
  async findById(id: string): Promise<Media | null> {
    return prisma.media.findUnique({ where: { id } });
  }

  /**
   * 获取所有媒体
   */
  async findAll(options: { page?: number; limit?: number; mimeType?: string } = {}): Promise<{
    items: Media[];
    total: number;
  }> {
    const { page = 1, limit = 20, mimeType } = options;

    const where = mimeType ? { mimeType: { startsWith: mimeType } } : {};

    const [items, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.media.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 删除媒体
   */
  async delete(id: string): Promise<void> {
    const media = await this.findById(id);
    if (!media) return;

    // 删除文件
    try {
      await fs.unlink(media.path);
      if (media.thumbnailPath) {
        await fs.unlink(media.thumbnailPath);
      }
    } catch {
      // File may not exist
    }

    // 删除数据库记录
    await prisma.media.delete({ where: { id } });
  }

  /**
   * 获取文件内容
   */
  async getFileBuffer(id: string): Promise<{ buffer: Buffer; media: Media } | null> {
    const media = await this.findById(id);
    if (!media) return null;

    try {
      const buffer = await fs.readFile(media.path);
      return { buffer, media };
    } catch {
      return null;
    }
  }
}

export const mediaService = new MediaService();
