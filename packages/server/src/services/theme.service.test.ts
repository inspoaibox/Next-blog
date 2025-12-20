import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { ThemeService } from './theme.service.js';

const prisma = new PrismaClient();
const themeService = new ThemeService();

beforeAll(async () => {
  await prisma.theme.deleteMany({});
});

afterEach(async () => {
  await prisma.theme.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('ThemeService', () => {
  /**
   * **Feature: blog-system, Property 32: 活跃主题唯一性**
   * **Validates: Requirements 17.4, 17.7**
   */
  it('Property 32: 活跃主题唯一性', async () => {
    // 安装两个主题
    const theme1 = await themeService.install({
      name: 'theme-light',
      version: '1.0.0',
      path: '/themes/light',
    });

    const theme2 = await themeService.install({
      name: 'theme-dark',
      version: '1.0.0',
      path: '/themes/dark',
    });

    // 激活 theme1
    await themeService.activate(theme1.id);
    let active = await themeService.getActive();
    expect(active?.id).toBe(theme1.id);

    // 激活 theme2
    await themeService.activate(theme2.id);
    active = await themeService.getActive();
    expect(active?.id).toBe(theme2.id);

    // 验证只有一个主题是激活的
    const allThemes = await themeService.findAll();
    const activeCount = allThemes.filter((t) => t.isActive).length;
    expect(activeCount).toBe(1);

    // 验证 theme1 不再是激活状态
    const theme1Updated = await themeService.findById(theme1.id);
    expect(theme1Updated?.isActive).toBe(false);
  }, 60000);

  /**
   * **Feature: blog-system, Property 33: 主题安装注册**
   * **Validates: Requirements 17.3**
   */
  it('Property 33: 主题安装注册', async () => {
    const theme = await themeService.install({
      name: 'test-theme',
      version: '1.0.0',
      path: '/themes/test',
    });

    expect(theme.id).toBeDefined();
    expect(theme.name).toBe('test-theme');

    // 验证主题在列表中
    const allThemes = await themeService.findAll();
    expect(allThemes.some((t) => t.id === theme.id)).toBe(true);
  }, 60000);

  /**
   * **Feature: blog-system, Property 34: 主题配置覆盖**
   * **Validates: Requirements 17.5**
   */
  it('Property 34: 主题配置覆盖', async () => {
    const theme = await themeService.install({
      name: 'config-theme',
      version: '1.0.0',
      path: '/themes/config',
    });

    // 默认配置
    const defaults = { primaryColor: '#000', fontSize: '16px' };

    // 更新自定义配置
    await themeService.updateConfig(theme.id, { primaryColor: '#ff0000' });

    // 获取合并后的配置
    const config = await themeService.getConfig(theme.id, defaults);

    // 自定义值覆盖默认值
    expect(config.primaryColor).toBe('#ff0000');
    // 未自定义的保持默认值
    expect(config.fontSize).toBe('16px');
  }, 60000);

  it('should not uninstall active theme', async () => {
    const theme = await themeService.install({
      name: 'active-theme',
      version: '1.0.0',
      path: '/themes/active',
    });

    await themeService.activate(theme.id);

    await expect(themeService.uninstall(theme.id)).rejects.toThrow('Cannot uninstall active theme');
  }, 60000);
});
