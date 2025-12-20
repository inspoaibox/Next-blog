import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { PluginService } from './plugin.service.js';

const prisma = new PrismaClient();
const pluginService = new PluginService();

beforeAll(async () => {
  await prisma.plugin.deleteMany({});
});

afterEach(async () => {
  await prisma.plugin.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('PluginService', () => {
  /**
   * **Feature: blog-system, Property 35: 插件安装注册**
   * **Validates: Requirements 18.1**
   */
  it('Property 35: 插件安装注册', async () => {
    const plugin = await pluginService.install({
      name: 'test-plugin',
      version: '1.0.0',
      path: '/plugins/test',
    });

    expect(plugin.id).toBeDefined();
    expect(plugin.name).toBe('test-plugin');

    // 验证插件在列表中
    const allPlugins = await pluginService.findAll();
    expect(allPlugins.some((p) => p.id === plugin.id)).toBe(true);
  }, 60000);

  /**
   * **Feature: blog-system, Property 36: 插件启用状态**
   * **Validates: Requirements 18.2**
   */
  it('Property 36: 插件启用状态', async () => {
    const plugin = await pluginService.install({
      name: 'enable-test',
      version: '1.0.0',
      path: '/plugins/enable',
    });

    // 初始状态为禁用
    expect(plugin.isEnabled).toBe(false);

    // 启用插件
    const enabled = await pluginService.enable(plugin.id);
    expect(enabled.isEnabled).toBe(true);

    // 验证在已启用列表中
    const enabledPlugins = await pluginService.findEnabled();
    expect(enabledPlugins.some((p) => p.id === plugin.id)).toBe(true);
  }, 60000);

  /**
   * **Feature: blog-system, Property 37: 插件禁用保留配置**
   * **Validates: Requirements 18.3**
   */
  it('Property 37: 插件禁用保留配置', async () => {
    const config = { setting1: 'value1', setting2: 'value2' };

    const plugin = await pluginService.install({
      name: 'config-test',
      version: '1.0.0',
      path: '/plugins/config',
      config,
    });

    // 启用插件
    await pluginService.enable(plugin.id);

    // 禁用插件
    const disabled = await pluginService.disable(plugin.id);

    // 验证配置保留
    expect(disabled.isEnabled).toBe(false);
    expect(disabled.config).toBe(JSON.stringify(config));
  }, 60000);


  /**
   * **Feature: blog-system, Property 38: 插件依赖加载顺序**
   * **Validates: Requirements 18.7**
   */
  it('Property 38: 插件依赖加载顺序', async () => {
    // 安装基础插件
    const basePlugin = await pluginService.install({
      name: 'base-plugin',
      version: '1.0.0',
      path: '/plugins/base',
    });
    await pluginService.enable(basePlugin.id);

    // 安装依赖基础插件的插件
    const dependentPlugin = await pluginService.install({
      name: 'dependent-plugin',
      version: '1.0.0',
      path: '/plugins/dependent',
      dependencies: ['base-plugin'],
    });
    await pluginService.enable(dependentPlugin.id);

    // 获取加载顺序
    const loadOrder = await pluginService.getLoadOrder();

    // 验证基础插件在依赖插件之前
    const baseIndex = loadOrder.findIndex((p) => p.name === 'base-plugin');
    const depIndex = loadOrder.findIndex((p) => p.name === 'dependent-plugin');
    expect(baseIndex).toBeLessThan(depIndex);
  }, 60000);

  /**
   * **Feature: blog-system, Property 39: 插件错误隔离**
   * **Validates: Requirements 18.8**
   */
  it('Property 39: 插件错误隔离', async () => {
    const plugin = await pluginService.install({
      name: 'error-plugin',
      version: '1.0.0',
      path: '/plugins/error',
    });

    // 执行会抛出错误的插件
    const result = await pluginService.executePlugin(plugin, async () => {
      throw new Error('Plugin crashed!');
    });

    // 验证错误被捕获，不影响核心功能
    expect(result.success).toBe(false);
    expect(result.error).toBe('Plugin crashed!');

    // 核心功能仍然正常（可以继续操作）
    const allPlugins = await pluginService.findAll();
    expect(allPlugins.length).toBeGreaterThan(0);
  }, 60000);

  it('should execute plugin successfully', async () => {
    const plugin = await pluginService.install({
      name: 'success-plugin',
      version: '1.0.0',
      path: '/plugins/success',
    });

    const result = await pluginService.executePlugin(plugin, async () => {
      return { data: 'success' };
    });

    expect(result.success).toBe(true);
    expect(result.result).toEqual({ data: 'success' });
  }, 60000);
});
