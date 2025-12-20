import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { PrismaClient } from '@prisma/client';
import { KnowledgeService } from './knowledge.service.js';

const prisma = new PrismaClient();
const knowledgeService = new KnowledgeService();

beforeAll(async () => {
  await prisma.knowledgeDoc.deleteMany({});
});

afterEach(async () => {
  await prisma.knowledgeDoc.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('KnowledgeService', () => {
  /**
   * **Feature: blog-system, Property 21: 知识库层级结构**
   * **Validates: Requirements 8.1**
   */
  it('Property 21: 知识库层级结构', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          parentTitle: fc
            .string({ minLength: 1, maxLength: 20 })
            .filter((s) => s.trim().length > 0),
          childTitle: fc
            .string({ minLength: 1, maxLength: 20 })
            .filter((s) => s.trim().length > 0),
        }),
        async ({ parentTitle, childTitle }) => {
          // 创建父文档
          const parent = await knowledgeService.create({
            title: parentTitle,
            content: 'Parent content',
          });

          // 创建子文档
          const child = await knowledgeService.create({
            title: childTitle,
            content: 'Child content',
            parentId: parent.id,
          });

          // 验证层级关系
          expect(child.parentId).toBe(parent.id);

          // 获取父文档，验证包含子文档
          const parentWithChildren = await knowledgeService.findById(parent.id);
          expect((parentWithChildren as any).children.some((c: any) => c.id === child.id)).toBe(
            true
          );

          // 获取子文档，验证包含父文档信息
          const childWithParent = await knowledgeService.findById(child.id);
          expect((childWithParent as any).parent?.id).toBe(parent.id);

          return true;
        }
      ),
      { numRuns: 5 }
    );
  }, 60000);


  /**
   * **Feature: blog-system, Property 22: 知识库排序调整**
   * **Validates: Requirements 8.2**
   */
  it('Property 22: 知识库排序调整', async () => {
    // 创建多个文档
    const doc1 = await knowledgeService.create({
      title: 'Doc 1',
      content: 'Content 1',
      sortOrder: 0,
    });

    const doc2 = await knowledgeService.create({
      title: 'Doc 2',
      content: 'Content 2',
      sortOrder: 1,
    });

    const doc3 = await knowledgeService.create({
      title: 'Doc 3',
      content: 'Content 3',
      sortOrder: 2,
    });

    // 调整顺序
    await knowledgeService.reorder([
      { id: doc3.id, sortOrder: 0 },
      { id: doc1.id, sortOrder: 1 },
      { id: doc2.id, sortOrder: 2 },
    ]);

    // 获取排序后的列表
    const tree = await knowledgeService.findTree();

    // 验证顺序
    expect(tree[0].id).toBe(doc3.id);
    expect(tree[1].id).toBe(doc1.id);
    expect(tree[2].id).toBe(doc2.id);
  }, 60000);

  it('should delete document with children', async () => {
    // 创建父文档
    const parent = await knowledgeService.create({
      title: 'Parent',
      content: 'Parent content',
    });

    // 创建子文档
    const child = await knowledgeService.create({
      title: 'Child',
      content: 'Child content',
      parentId: parent.id,
    });

    // 删除父文档
    await knowledgeService.delete(parent.id);

    // 验证父文档和子文档都被删除
    const deletedParent = await knowledgeService.findById(parent.id);
    const deletedChild = await knowledgeService.findById(child.id);

    expect(deletedParent).toBeNull();
    expect(deletedChild).toBeNull();
  }, 60000);
});
