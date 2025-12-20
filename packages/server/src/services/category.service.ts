import { prisma } from '../lib/prisma.js';
import type { Category, Prisma } from '@prisma/client';

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  parentId?: string | null;
  sortOrder?: number;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50) + '-' + Date.now().toString(36);
}

export class CategoryService {
  /**
   * 创建分类
   */
  async create(input: CreateCategoryInput): Promise<Category> {
    const slug = input.slug || generateSlug(input.name);

    return prisma.category.create({
      data: {
        name: input.name,
        slug,
        parentId: input.parentId,
        sortOrder: input.sortOrder ?? 0,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  /**
   * 根据 ID 获取分类
   */
  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        articles: { where: { deletedAt: null } },
      },
    });
  }


  /**
   * 获取所有分类（树形结构）
   */
  async findAll(): Promise<Category[]> {
    return prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
          include: {
            children: { orderBy: { sortOrder: 'asc' } },
            _count: { select: { articles: true } },
          },
          
        },
        _count: { select: { articles: true } },
      },
    });
  }

  /**
   * 获取所有分类（平铺列表）
   */
  async findAllFlat(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
      include: { 
        parent: true,
        _count: { select: { articles: true } },
      },
    });
  }

  /**
   * 更新分类
   */
  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.parentId !== undefined) data.parentId = input.parentId;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;

    return prisma.category.update({
      where: { id },
      data,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  /**
   * 删除分类（文章迁移到默认分类或设为 null）
   */
  async delete(id: string, migrateToId?: string): Promise<void> {
    // 将该分类下的文章迁移
    await prisma.article.updateMany({
      where: { categoryId: id },
      data: { categoryId: migrateToId || null },
    });

    // 将子分类的父级设为该分类的父级
    const category = await prisma.category.findUnique({ where: { id } });
    if (category) {
      await prisma.category.updateMany({
        where: { parentId: id },
        data: { parentId: category.parentId },
      });
    }

    // 删除分类
    await prisma.category.delete({ where: { id } });
  }

  /**
   * 获取分类下的文章数量
   */
  async getArticleCount(id: string): Promise<number> {
    return prisma.article.count({
      where: { categoryId: id, deletedAt: null },
    });
  }

  /**
   * 获取子分类
   */
  async getChildren(id: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: { parentId: id },
      orderBy: { sortOrder: 'asc' },
    });
  }
}

export const categoryService = new CategoryService();
