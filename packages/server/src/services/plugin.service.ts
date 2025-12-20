import { prisma } from '../lib/prisma.js';
import type { Plugin } from '@prisma/client';

export interface CreatePluginInput {
  name: string;
  version: string;
  path: string;
  config?: Record<string, any>;
  dependencies?: string[];
}

export interface UpdatePluginInput {
  version?: string;
  path?: string;
  config?: Record<string, any>;
}

export class PluginService {
  /**
   * 安装插件
   */
  async install(input: CreatePluginInput): Promise<Plugin> {
    return prisma.plugin.create({
      data: {
        name: input.name,
        version: input.version,
        path: input.path,
        config: input.config ? JSON.stringify(input.config) : null,
        dependencies: input.dependencies ? JSON.stringify(input.dependencies) : null,
        isEnabled: false,
      },
    });
  }

  /**
   * 根据 ID 获取插件
   */
  async findById(id: string): Promise<Plugin | null> {
    return prisma.plugin.findUnique({ where: { id } });
  }

  /**
   * 根据名称获取插件
   */
  async findByName(name: string): Promise<Plugin | null> {
    return prisma.plugin.findUnique({ where: { name } });
  }

  /**
   * 获取所有插件
   */
  async findAll(): Promise<Plugin[]> {
    return prisma.plugin.findMany({ orderBy: { createdAt: 'desc' } });
  }

  /**
   * 获取已启用的插件
   */
  async findEnabled(): Promise<Plugin[]> {
    return prisma.plugin.findMany({
      where: { isEnabled: true },
      orderBy: { createdAt: 'asc' },
    });
  }


  /**
   * 启用插件
   */
  async enable(id: string): Promise<Plugin> {
    return prisma.plugin.update({
      where: { id },
      data: { isEnabled: true },
    });
  }

  /**
   * 禁用插件（保留配置）
   */
  async disable(id: string): Promise<Plugin> {
    return prisma.plugin.update({
      where: { id },
      data: { isEnabled: false },
    });
  }

  /**
   * 更新插件配置
   */
  async updateConfig(id: string, config: Record<string, any>): Promise<Plugin> {
    return prisma.plugin.update({
      where: { id },
      data: { config: JSON.stringify(config) },
    });
  }

  /**
   * 卸载插件
   */
  async uninstall(id: string): Promise<void> {
    await prisma.plugin.delete({ where: { id } });
  }

  /**
   * 获取插件依赖
   */
  getDependencies(plugin: Plugin): string[] {
    if (!plugin.dependencies) return [];
    try {
      return JSON.parse(plugin.dependencies);
    } catch {
      return [];
    }
  }

  /**
   * 按依赖顺序排序插件
   */
  async getLoadOrder(): Promise<Plugin[]> {
    const plugins = await this.findEnabled();
    const sorted: Plugin[] = [];
    const visited = new Set<string>();

    const visit = (plugin: Plugin) => {
      if (visited.has(plugin.id)) return;
      visited.add(plugin.id);

      const deps = this.getDependencies(plugin);
      for (const depName of deps) {
        const dep = plugins.find((p) => p.name === depName);
        if (dep) visit(dep);
      }
      sorted.push(plugin);
    };

    for (const plugin of plugins) {
      visit(plugin);
    }

    return sorted;
  }

  /**
   * 执行插件（带错误隔离）
   */
  async executePlugin(
    plugin: Plugin,
    handler: () => Promise<any>
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      const result = await handler();
      return { success: true, result };
    } catch (error: any) {
      // 插件错误不影响核心功能
      console.error(`Plugin ${plugin.name} error:`, error.message);
      return { success: false, error: error.message };
    }
  }
}

export const pluginService = new PluginService();
