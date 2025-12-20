import { prisma } from '../lib/prisma.js';
import type { Tag } from '@prisma/client';

export interface CreateTagInput {
  name: string;
}

export interface UpdateTagInput {
  name?: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50) + '-' + Date.now().toString(36);
}

export class TagService {
  /**
   * 创建标签
   */
  async create(input: CreateTagInput): Promise<Tag> {
    const slug = generateSlug(input.name);

    return prisma.tag.create({
      data: {
        name: input.name,
        slug,
      },
    });
  }

  /**
   * 根据 ID 获取标签
   */
  async findById(id: string): Promise<Tag | null> {
    return prisma.tag.findUnique({
      where: { id },
      include: {
        articles: {
          include: { article: true },
        },
      },
    });
  }

  /**
   * 根据名称获取标签
   */
  async findByName(name: string): Promise<Tag | null> {
    return prisma.tag.findUnique({ where: { name } });
  }

  /**
   * 获取所有标签
   */
  async findAll(): Promise<Tag[]> {
    return prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { articles: true } },
      },
    });
  }


  /**
   * 更新标签
   */
  async update(id: string, input: UpdateTagInput): Promise<Tag> {
    const data: { name?: string; slug?: string } = {};
    if (input.name) {
      data.name = input.name;
      data.slug = generateSlug(input.name);
    }

    return prisma.tag.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除标签
   */
  async delete(id: string): Promise<void> {
    // 先删除关联关系
    await prisma.articleTag.deleteMany({ where: { tagId: id } });
    // 再删除标签
    await prisma.tag.delete({ where: { id } });
  }

  /**
   * 合并标签（将源标签的所有文章转移到目标标签）
   */
  async merge(sourceId: string, targetId: string): Promise<Tag> {
    // 获取源标签关联的所有文章
    const sourceArticles = await prisma.articleTag.findMany({
      where: { tagId: sourceId },
    });

    // 获取目标标签已关联的文章
    const targetArticles = await prisma.articleTag.findMany({
      where: { tagId: targetId },
    });
    const targetArticleIds = new Set(targetArticles.map(a => a.articleId));

    // 将源标签的文章转移到目标标签（避免重复）
    for (const article of sourceArticles) {
      if (!targetArticleIds.has(article.articleId)) {
        await prisma.articleTag.create({
          data: {
            articleId: article.articleId,
            tagId: targetId,
          },
        });
      }
    }

    // 删除源标签
    await this.delete(sourceId);

    // 返回目标标签
    return prisma.tag.findUnique({
      where: { id: targetId },
      include: {
        articles: { include: { article: true } },
      },
    }) as Promise<Tag>;
  }

  /**
   * 获取标签关联的文章数量
   */
  async getArticleCount(id: string): Promise<number> {
    return prisma.articleTag.count({
      where: { tagId: id },
    });
  }

  /**
   * 批量创建或获取标签
   */
  async findOrCreateMany(names: string[]): Promise<Tag[]> {
    const tags: Tag[] = [];

    for (const name of names) {
      let tag = await this.findByName(name);
      if (!tag) {
        tag = await this.create({ name });
      }
      tags.push(tag);
    }

    return tags;
  }
}

export const tagService = new TagService();
