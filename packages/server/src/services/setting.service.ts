import { prisma } from '../lib/prisma.js';

// 默认网站设置
const defaultSettings: Record<string, string> = {
  siteName: 'NextBlog',
  siteDescription: '下一个博客，记录精彩生活',
  siteKeywords: '博客,技术,生活,分享',
  siteUrl: '',
  siteLogo: '',
  siteFavicon: '',
  footerText: '© {year} NextBlog. All rights reserved.',
  googleAnalyticsId: '',
  baiduAnalyticsId: '',
  seoDefaultTitle: '',
  seoDefaultDescription: '',
  socialGithub: '',
  socialTwitter: '',
  socialWeibo: '',
};

export class SettingService {
  /**
   * 获取单个设置
   */
  async get(key: string): Promise<string | null> {
    const setting = await prisma.setting.findUnique({ where: { key } });
    return setting?.value ?? defaultSettings[key] ?? null;
  }

  /**
   * 获取所有设置
   */
  async getAll(): Promise<Record<string, string>> {
    const settings = await prisma.setting.findMany();
    const result = { ...defaultSettings };
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    return result;
  }

  /**
   * 设置单个值
   */
  async set(key: string, value: string): Promise<void> {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  /**
   * 批量设置
   */
  async setMany(settings: Record<string, string>): Promise<void> {
    const operations = Object.entries(settings).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );
    await prisma.$transaction(operations);
  }

  /**
   * 删除设置
   */
  async delete(key: string): Promise<void> {
    await prisma.setting.delete({ where: { key } }).catch(() => {});
  }

  /**
   * 获取公开设置（不包含敏感信息）
   */
  async getPublic(): Promise<Record<string, string>> {
    const all = await this.getAll();
    // 排除敏感字段
    const { googleAnalyticsId, baiduAnalyticsId, ...publicSettings } = all;
    return {
      ...publicSettings,
      // 处理年份占位符
      footerText: all.footerText.replace('{year}', new Date().getFullYear().toString()),
    };
  }
}

export const settingService = new SettingService();
