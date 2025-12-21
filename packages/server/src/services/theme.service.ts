import { prisma } from '../lib/prisma.js';

// 使用 Prisma 推断的类型
type Theme = Awaited<ReturnType<typeof prisma.theme.findFirst>> & {};

export interface CreateThemeInput {
  name: string;
  version: string;
  path: string;
  config?: Record<string, any>;
}

export interface UpdateThemeInput {
  version?: string;
  path?: string;
  config?: Record<string, any>;
}

export class ThemeService {
  /**
   * 安装主题
   */
  async install(input: CreateThemeInput): Promise<Theme> {
    return prisma.theme.create({
      data: {
        name: input.name,
        version: input.version,
        path: input.path,
        config: input.config ? JSON.stringify(input.config) : null,
        isActive: false,
      },
    });
  }

  /**
   * 根据 ID 获取主题
   */
  async findById(id: string): Promise<Theme | null> {
    return prisma.theme.findUnique({ where: { id } });
  }

  /**
   * 根据名称获取主题
   */
  async findByName(name: string): Promise<Theme | null> {
    return prisma.theme.findUnique({ where: { name } });
  }

  /**
   * 获取所有主题
   */
  async findAll(): Promise<Theme[]> {
    return prisma.theme.findMany({ orderBy: { createdAt: 'desc' } });
  }

  /**
   * 获取当前激活的主题
   */
  async getActive(): Promise<Theme | null> {
    return prisma.theme.findFirst({ where: { isActive: true } });
  }


  /**
   * 激活主题（确保唯一性）
   */
  async activate(id: string): Promise<Theme> {
    // 先取消所有激活状态
    await prisma.theme.updateMany({ data: { isActive: false } });
    // 激活指定主题
    return prisma.theme.update({
      where: { id },
      data: { isActive: true },
    });
  }

  /**
   * 更新主题配置
   */
  async updateConfig(id: string, config: Record<string, any>): Promise<Theme> {
    return prisma.theme.update({
      where: { id },
      data: { config: JSON.stringify(config) },
    });
  }

  /**
   * 更新主题
   */
  async update(id: string, input: UpdateThemeInput): Promise<Theme> {
    const data: any = { ...input };
    if (input.config) {
      data.config = JSON.stringify(input.config);
    }
    return prisma.theme.update({ where: { id }, data });
  }

  /**
   * 卸载主题
   */
  async uninstall(id: string): Promise<void> {
    const theme = await this.findById(id);
    if (theme?.isActive) {
      throw new Error('Cannot uninstall active theme');
    }
    await prisma.theme.delete({ where: { id } });
  }

  /**
   * 获取主题配置（合并默认值和自定义值）
   */
  async getConfig(id: string, defaults: Record<string, any> = {}): Promise<Record<string, any>> {
    const theme = await this.findById(id);
    if (!theme) return defaults;

    const customConfig = theme.config ? JSON.parse(theme.config) : {};
    return { ...defaults, ...customConfig };
  }

  /**
   * 初始化内置主题（如果不存在则创建）
   */
  async initBuiltinThemes(): Promise<Theme[]> {
    const builtinThemes = [
      {
        name: 'classic',
        version: '1.0.0',
        path: '/themes/classic',
        isActive: true,
        config: JSON.stringify({
          displayName: '经典主题',
          description: '传统博客风格，简洁大方',
        }),
      },
      {
        name: 'minimal',
        version: '1.0.0',
        path: '/themes/minimal',
        isActive: false,
        config: JSON.stringify({
          displayName: '极简主题',
          description: '简约风格，专注阅读体验',
        }),
      },
      {
        name: 'magazine',
        version: '1.0.0',
        path: '/themes/magazine',
        isActive: false,
        config: JSON.stringify({
          displayName: '杂志主题',
          description: '卡片式布局，现代视觉风格',
        }),
      },
      {
        name: 'cyber',
        version: '1.0.0',
        path: '/themes/cyber',
        isActive: false,
        config: JSON.stringify({
          displayName: '赛博朋克',
          description: '科技感极光背景，深色调，霓虹高亮，适合技术博客',
        }),
      },
      {
        name: 'vibrant',
        version: '1.0.0',
        path: '/themes/vibrant',
        isActive: false,
        config: JSON.stringify({
          displayName: '活力主题',
          description: '幻彩流体背景，明亮色调，圆润卡片，充满活力与创意',
        }),
      },
      {
        name: 'aura-nexus',
        version: '1.0.0',
        path: '/themes/aura-nexus',
        isActive: false,
        config: JSON.stringify({
          displayName: '灵气枢纽 Pro',
          description: '多维排版增强版：支持社论、网格、极简等多种风格，所有参数均可自定义',
        }),
      },
      {
        name: 'vibe-pulse',
        version: '1.0.0',
        path: '/themes/vibe-pulse',
        isActive: false,
        config: JSON.stringify({
          displayName: '微博风格',
          description: '社交信息流布局，左侧导航、中间信息流、右侧热搜与AI助手的完美结合',
        }),
      },
      {
        name: 'aether-bloom',
        version: '1.0.0',
        path: '/themes/aether-bloom',
        isActive: false,
        config: JSON.stringify({
          displayName: '以太花语',
          description: '有机感博客主题：自然呼吸的排版体验，支持多种卡片布局、详情页排版与响应式宽度定义',
        }),
      },
      {
        name: 'chroma-dimension',
        version: '1.0.0',
        path: '/themes/chroma-dimension',
        isActive: false,
        config: JSON.stringify({
          displayName: '幻彩维度',
          description: '极致多巴胺美学：未来波普排版、液态金属背景，支持有图全息与无图海报双重前卫视觉',
        }),
      },
    ];

    const results: Theme[] = [];
    
    for (const theme of builtinThemes) {
      const existing = await this.findByName(theme.name);
      if (!existing) {
        const created = await prisma.theme.create({ data: theme });
        results.push(created);
      } else {
        results.push(existing);
      }
    }

    // 确保至少有一个主题是激活的
    const activeTheme = await this.getActive();
    if (!activeTheme && results.length > 0) {
      await this.activate(results[0].id);
    }

    return results;
  }
}

export const themeService = new ThemeService();
