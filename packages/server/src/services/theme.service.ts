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
