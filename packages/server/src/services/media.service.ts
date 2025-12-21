import { prisma } from '../lib/prisma.js';
import type { Media } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const THUMBNAIL_DIR = path.join(UPLOAD_DIR, 'thumbnails');

// 支持的图片类型映射
const MIME_TYPE_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
};

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

  /**
   * 从远程 URL 下载图片并保存到本地
   */
  async downloadFromUrl(url: string): Promise<Media> {
    await this.ensureDirectories();

    // 验证 URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error('无效的 URL');
    }

    // 只允许 http/https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('只支持 HTTP/HTTPS 协议');
    }

    // 下载图片
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      throw new Error('URL 不是有效的图片');
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // 限制文件大小 (10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      throw new Error('图片大小超过 10MB 限制');
    }

    // 从 URL 或 content-type 推断扩展名
    let ext = path.extname(parsedUrl.pathname).toLowerCase();
    if (!ext || !MIME_TYPE_MAP[ext]) {
      // 从 content-type 推断
      const mimeExt = Object.entries(MIME_TYPE_MAP).find(([, mime]) => contentType.includes(mime));
      ext = mimeExt ? mimeExt[0] : '.jpg';
    }

    const mimeType = MIME_TYPE_MAP[ext] || 'image/jpeg';
    const originalName = path.basename(parsedUrl.pathname) || `image${ext}`;

    // 生成唯一文件名
    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    const filename = `${Date.now()}-${hash.substring(0, 8)}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // 检查是否已存在相同内容的图片（通过 hash）
    const existingMedia = await prisma.media.findFirst({
      where: {
        filename: { contains: hash.substring(0, 8) },
      },
    });

    if (existingMedia) {
      return existingMedia;
    }

    // 保存文件
    await fs.writeFile(filePath, buffer);

    // 生成缩略图
    const thumbnailPath = await this.generateThumbnail(buffer, filename);

    // 保存到数据库
    return prisma.media.create({
      data: {
        filename,
        originalName,
        mimeType,
        size: buffer.length,
        path: filePath,
        thumbnailPath,
      },
    });
  }

  /**
   * 批量本地化文章内容中的远程图片
   * 返回替换后的内容和替换结果
   */
  async localizeContentImages(content: string): Promise<{
    content: string;
    results: Array<{ original: string; local: string | null; error?: string }>;
  }> {
    // 匹配 Markdown 图片语法和 HTML img 标签
    const mdImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;

    const results: Array<{ original: string; local: string | null; error?: string }> = [];
    const urlMap = new Map<string, string>();

    // 收集所有远程图片 URL
    const remoteUrls = new Set<string>();

    let match;
    while ((match = mdImageRegex.exec(content)) !== null) {
      const url = match[2];
      if (this.isRemoteUrl(url)) {
        remoteUrls.add(url);
      }
    }

    while ((match = htmlImageRegex.exec(content)) !== null) {
      const url = match[1];
      if (this.isRemoteUrl(url)) {
        remoteUrls.add(url);
      }
    }

    // 下载并本地化每个远程图片
    for (const url of remoteUrls) {
      try {
        const media = await this.downloadFromUrl(url);
        const localUrl = `/api/media/${media.id}/file`;
        urlMap.set(url, localUrl);
        results.push({ original: url, local: localUrl });
      } catch (error) {
        results.push({
          original: url,
          local: null,
          error: error instanceof Error ? error.message : '下载失败',
        });
      }
    }

    // 替换内容中的 URL
    let newContent = content;
    for (const [original, local] of urlMap) {
      newContent = newContent.split(original).join(local);
    }

    return { content: newContent, results };
  }

  /**
   * 判断是否为远程 URL
   */
  private isRemoteUrl(url: string): boolean {
    if (!url) return false;
    // 排除本地路径和 data URL
    if (url.startsWith('/') || url.startsWith('data:') || url.startsWith('#')) {
      return false;
    }
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
}

export const mediaService = new MediaService();
