import { prisma } from '../lib/prisma.js';
import type { KnowledgeDoc } from '@prisma/client';

export interface CreateKnowledgeDocInput {
  title: string;
  content: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateKnowledgeDocInput {
  title?: string;
  content?: string;
  parentId?: string | null;
  sortOrder?: number;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50) + '-' + Date.now().toString(36);
}

export class KnowledgeService {
  /**
   * 创建知识库文档
   */
  async create(input: CreateKnowledgeDocInput): Promise<KnowledgeDoc> {
    const slug = generateSlug(input.title);

    return prisma.knowledgeDoc.create({
      data: {
        title: input.title,
        slug,
        content: input.content,
        parentId: input.parentId,
        sortOrder: input.sortOrder ?? 0,
      },
      include: { parent: true, children: true },
    });
  }

  /**
   * 根据 ID 获取文档
   */
  async findById(id: string): Promise<KnowledgeDoc | null> {
    return prisma.knowledgeDoc.findUnique({
      where: { id },
      include: { parent: true, children: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  /**
   * 根据 slug 获取文档
   */
  async findBySlug(slug: string): Promise<KnowledgeDoc | null> {
    return prisma.knowledgeDoc.findUnique({
      where: { slug },
      include: { parent: true, children: { orderBy: { sortOrder: 'asc' } } },
    });
  }


  /**
   * 获取知识库目录树
   */
  async findTree(): Promise<KnowledgeDoc[]> {
    return prisma.knowledgeDoc.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
          include: {
            children: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });
  }

  /**
   * 更新文档
   */
  async update(id: string, input: UpdateKnowledgeDocInput): Promise<KnowledgeDoc> {
    return prisma.knowledgeDoc.update({
      where: { id },
      data: {
        title: input.title,
        content: input.content,
        parentId: input.parentId,
        sortOrder: input.sortOrder,
      },
      include: { parent: true, children: true },
    });
  }

  /**
   * 删除文档（同时删除子文档）
   */
  async delete(id: string): Promise<void> {
    // 递归删除子文档
    const children = await prisma.knowledgeDoc.findMany({ where: { parentId: id } });
    for (const child of children) {
      await this.delete(child.id);
    }
    await prisma.knowledgeDoc.delete({ where: { id } });
  }

  /**
   * 调整文档顺序
   */
  async reorder(items: { id: string; sortOrder: number }[]): Promise<void> {
    for (const item of items) {
      await prisma.knowledgeDoc.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      });
    }
  }

  /**
   * 获取子文档
   */
  async getChildren(parentId: string): Promise<KnowledgeDoc[]> {
    return prisma.knowledgeDoc.findMany({
      where: { parentId },
      orderBy: { sortOrder: 'asc' },
    });
  }
}

export const knowledgeService = new KnowledgeService();
