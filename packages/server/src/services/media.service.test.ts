import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { MediaService } from './media.service.js';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();
const mediaService = new MediaService();

beforeAll(async () => {
  await prisma.media.deleteMany({});
});

afterEach(async () => {
  await prisma.media.deleteMany({});
});

afterAll(async () => {
  // 清理测试上传的文件
  try {
    await fs.rm('./uploads', { recursive: true, force: true });
  } catch {
    // Directory may not exist
  }
  await prisma.$disconnect();
});

describe('MediaService', () => {
  /**
   * **Feature: blog-system, Property 19: 图片上传生成缩略图**
   * **Validates: Requirements 7.1**
   */
  it('Property 19: 图片上传生成缩略图', async () => {
    const testBuffer = Buffer.from('fake image content');

    const media = await mediaService.upload({
      originalName: 'test-image.png',
      mimeType: 'image/png',
      size: testBuffer.length,
      buffer: testBuffer,
    });

    expect(media.id).toBeDefined();
    expect(media.filename).toBeDefined();
    expect(media.thumbnailPath).not.toBeNull();

    // 验证缩略图文件存在
    const thumbnailExists = await fs
      .access(media.thumbnailPath!)
      .then(() => true)
      .catch(() => false);
    expect(thumbnailExists).toBe(true);
  }, 60000);

  /**
   * **Feature: blog-system, Property 20: 媒体库完整性**
   * **Validates: Requirements 7.2**
   */
  it('Property 20: 媒体库完整性', async () => {
    const testBuffer = Buffer.from('test file content');

    // 上传多个文件
    const media1 = await mediaService.upload({
      originalName: 'file1.txt',
      mimeType: 'text/plain',
      size: testBuffer.length,
      buffer: testBuffer,
    });

    const media2 = await mediaService.upload({
      originalName: 'file2.txt',
      mimeType: 'text/plain',
      size: testBuffer.length,
      buffer: testBuffer,
    });

    // 获取媒体列表
    const { items, total } = await mediaService.findAll();

    // 验证所有上传的文件都在列表中
    expect(total).toBe(2);
    expect(items.some((m) => m.id === media1.id)).toBe(true);
    expect(items.some((m) => m.id === media2.id)).toBe(true);
  }, 60000);

  it('should delete media and files', async () => {
    const testBuffer = Buffer.from('test content');

    const media = await mediaService.upload({
      originalName: 'to-delete.txt',
      mimeType: 'text/plain',
      size: testBuffer.length,
      buffer: testBuffer,
    });

    // 验证文件存在
    const fileExists = await fs
      .access(media.path)
      .then(() => true)
      .catch(() => false);
    expect(fileExists).toBe(true);

    // 删除媒体
    await mediaService.delete(media.id);

    // 验证数据库记录已删除
    const deleted = await mediaService.findById(media.id);
    expect(deleted).toBeNull();

    // 验证文件已删除
    const fileExistsAfter = await fs
      .access(media.path)
      .then(() => true)
      .catch(() => false);
    expect(fileExistsAfter).toBe(false);
  }, 60000);
});
