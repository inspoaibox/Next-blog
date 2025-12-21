import { prisma } from '../lib/prisma.js';
import type { Project } from '@prisma/client';

export interface CreateProjectInput {
  name: string;
  slug?: string;
  description: string;
  content?: string;
  techStack?: string;
  githubUrl?: string;
  demoUrl?: string;
  docsUrl?: string;
  chromeUrl?: string;
  firefoxUrl?: string;
  npmUrl?: string;
  featuredImage?: string;
  status?: string;
  isRecommended?: boolean;
  isPinned?: boolean;
  sortOrder?: number;
  categoryId?: string;
}

export interface UpdateProjectInput {
  name?: string;
  slug?: string;
  description?: string;
  content?: string;
  techStack?: string;
  githubUrl?: string;
  demoUrl?: string;
  docsUrl?: string;
  chromeUrl?: string;
  firefoxUrl?: string;
  npmUrl?: string;
  featuredImage?: string;
  status?: string;
  isRecommended?: boolean;
  isPinned?: boolean;
  sortOrder?: number;
  categoryId?: string | null;
}

export interface ProjectListOptions {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50) + '-' + Date.now().toString(36);
}

export class ProjectService {
  async create(input: CreateProjectInput): Promise<Project> {
    const slug = input.slug || generateSlug(input.name);
    return prisma.project.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        content: input.content,
        techStack: input.techStack,
        githubUrl: input.githubUrl,
        demoUrl: input.demoUrl,
        docsUrl: input.docsUrl,
        chromeUrl: input.chromeUrl,
        firefoxUrl: input.firefoxUrl,
        npmUrl: input.npmUrl,
        featuredImage: input.featuredImage,
        status: input.status ?? 'DRAFT',
        isRecommended: input.isRecommended ?? false,
        isPinned: input.isPinned ?? false,
        sortOrder: input.sortOrder ?? 0,
        categoryId: input.categoryId,
      },
      include: { category: true },
    });
  }

  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async findBySlug(slug: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { slug },
      include: { category: true },
    });
  }


  async findAll(options: ProjectListOptions = {}): Promise<{ projects: Project[]; total: number }> {
    const { page = 1, limit = 20, categoryId, status } = options;
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true },
      }),
      prisma.project.count({ where }),
    ]);

    return { projects, total };
  }

  async findPublished(categoryId?: string): Promise<Project[]> {
    const where: any = { status: 'PUBLISHED' };
    if (categoryId) where.categoryId = categoryId;

    return prisma.project.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { category: true },
    });
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.description !== undefined) data.description = input.description;
    if (input.content !== undefined) data.content = input.content;
    if (input.techStack !== undefined) data.techStack = input.techStack;
    if (input.githubUrl !== undefined) data.githubUrl = input.githubUrl;
    if (input.demoUrl !== undefined) data.demoUrl = input.demoUrl;
    if (input.docsUrl !== undefined) data.docsUrl = input.docsUrl;
    if (input.chromeUrl !== undefined) data.chromeUrl = input.chromeUrl;
    if (input.firefoxUrl !== undefined) data.firefoxUrl = input.firefoxUrl;
    if (input.npmUrl !== undefined) data.npmUrl = input.npmUrl;
    if (input.featuredImage !== undefined) data.featuredImage = input.featuredImage;
    if (input.status !== undefined) data.status = input.status;
    if (input.isRecommended !== undefined) data.isRecommended = input.isRecommended;
    if (input.isPinned !== undefined) data.isPinned = input.isPinned;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.categoryId !== undefined) data.categoryId = input.categoryId;

    return prisma.project.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } });
  }
}

export const projectService = new ProjectService();
