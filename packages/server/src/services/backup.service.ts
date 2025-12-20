import { prisma } from '../lib/prisma.js';

export interface BackupData {
  version: string;
  exportedAt: string;
  articles: any[];
  categories: any[];
  tags: any[];
  pages: any[];
  knowledgeDocs: any[];
  settings: any[];
}

export class BackupService {
  /**
   * 导出所有数据为 JSON
   */
  async exportAll(): Promise<BackupData> {
    const [articles, categories, tags, pages, knowledgeDocs, settings] = await Promise.all([
      prisma.article.findMany({
        include: { tags: { include: { tag: true } }, versions: true },
      }),
      prisma.category.findMany(),
      prisma.tag.findMany(),
      prisma.page.findMany(),
      prisma.knowledgeDoc.findMany(),
      prisma.setting.findMany(),
    ]);

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      articles: articles.map((a) => ({
        ...a,
        tags: a.tags.map((t) => t.tag.name),
      })),
      categories,
      tags,
      pages,
      knowledgeDocs,
      settings,
    };
  }

  /**
   * 导入备份数据
   */
  async importAll(data: BackupData): Promise<{ success: boolean; imported: Record<string, number> }> {
    const imported: Record<string, number> = {
      categories: 0,
      tags: 0,
      articles: 0,
      pages: 0,
      knowledgeDocs: 0,
    };

    // 导入分类
    for (const category of data.categories) {
      try {
        await prisma.category.upsert({
          where: { id: category.id },
          update: { name: category.name, slug: category.slug, parentId: category.parentId },
          create: { id: category.id, name: category.name, slug: category.slug, parentId: category.parentId },
        });
        imported.categories++;
      } catch {
        // Skip duplicates
      }
    }

    // 导入标签
    for (const tag of data.tags) {
      try {
        await prisma.tag.upsert({
          where: { id: tag.id },
          update: { name: tag.name, slug: tag.slug },
          create: { id: tag.id, name: tag.name, slug: tag.slug },
        });
        imported.tags++;
      } catch {
        // Skip duplicates
      }
    }


    // 导入页面
    for (const page of data.pages) {
      try {
        await prisma.page.upsert({
          where: { id: page.id },
          update: { title: page.title, slug: page.slug, content: page.content },
          create: { id: page.id, title: page.title, slug: page.slug, content: page.content },
        });
        imported.pages++;
      } catch {
        // Skip duplicates
      }
    }

    // 导入知识库文档
    for (const doc of data.knowledgeDocs) {
      try {
        await prisma.knowledgeDoc.upsert({
          where: { id: doc.id },
          update: { title: doc.title, slug: doc.slug, content: doc.content, parentId: doc.parentId },
          create: { id: doc.id, title: doc.title, slug: doc.slug, content: doc.content, parentId: doc.parentId },
        });
        imported.knowledgeDocs++;
      } catch {
        // Skip duplicates
      }
    }

    return { success: true, imported };
  }

  /**
   * 导出文章为 Markdown 文件格式
   */
  async exportArticlesAsMarkdown(): Promise<{ filename: string; content: string }[]> {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: { tags: { include: { tag: true } }, category: true },
    });

    return articles.map((article) => {
      const frontmatter = [
        '---',
        `title: "${article.title}"`,
        `date: ${article.publishedAt?.toISOString() || article.createdAt.toISOString()}`,
        article.category ? `category: "${article.category.name}"` : '',
        article.tags.length > 0 ? `tags: [${article.tags.map((t) => `"${t.tag.name}"`).join(', ')}]` : '',
        '---',
        '',
      ]
        .filter(Boolean)
        .join('\n');

      return {
        filename: `${article.slug}.md`,
        content: frontmatter + article.content,
      };
    });
  }
}

export const backupService = new BackupService();
