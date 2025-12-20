import { prisma } from '../lib/prisma.js';
import type { Page } from '@prisma/client';

export interface CreatePageInput {
  title: string;
  content: string;
  slug?: string;
  sortOrder?: number;
  showInNav?: boolean;
}

export interface UpdatePageInput {
  title?: string;
  content?: string;
  slug?: string;
  sortOrder?: number;
  showInNav?: boolean;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50) + '-' + Date.now().toString(36);
}

export class PageService {
  /**
   * 创建页面
   */
  async create(input: CreatePageInput): Promise<Page> {
    const slug = input.slug || generateSlug(input.title);

    return prisma.page.create({
      data: {
        title: input.title,
        content: input.content,
        slug,
        sortOrder: input.sortOrder ?? 0,
        showInNav: input.showInNav ?? false,
      },
    });
  }

  /**
   * 根据 ID 获取页面
   */
  async findById(id: string): Promise<Page | null> {
    return prisma.page.findUnique({ where: { id } });
  }

  /**
   * 根据 slug 获取页面
   */
  async findBySlug(slug: string): Promise<Page | null> {
    return prisma.page.findUnique({ where: { slug } });
  }


  /**
   * 获取所有页面
   */
  async findAll(): Promise<Page[]> {
    return prisma.page.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * 获取导航菜单中的页面
   */
  async findNavPages(): Promise<Page[]> {
    return prisma.page.findMany({
      where: { showInNav: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * 更新页面
   */
  async update(id: string, input: UpdatePageInput): Promise<Page> {
    return prisma.page.update({
      where: { id },
      data: {
        title: input.title,
        content: input.content,
        slug: input.slug,
        sortOrder: input.sortOrder,
        showInNav: input.showInNav,
      },
    });
  }

  /**
   * 删除页面
   */
  async delete(id: string): Promise<void> {
    await prisma.page.delete({ where: { id } });
  }
}

export const pageService = new PageService();
