import { create } from 'zustand';
import { api } from '../lib/api';

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  siteUrl: string;
  siteLogo: string;
  siteFavicon: string;
  footerText: string;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
  socialGithub: string;
  socialTwitter: string;
  socialWeibo: string;
  navMenu: string;
}

export interface NavMenuItem {
  id: string;
  label: string;
  url: string;
  type: 'internal' | 'external' | 'page';
  sortOrder: number;
}

interface SiteSettingsState {
  settings: SiteSettings;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  getNavMenu: () => NavMenuItem[];
}

const defaultSettings: SiteSettings = {
  siteName: 'NextBlog',
  siteDescription: '下一个博客，记录精彩生活',
  siteKeywords: '博客,技术,生活,分享',
  siteUrl: '',
  siteLogo: '',
  siteFavicon: '',
  footerText: '© {year} NextBlog. All rights reserved.',
  seoDefaultTitle: '',
  seoDefaultDescription: '',
  socialGithub: '',
  socialTwitter: '',
  socialWeibo: '',
  navMenu: '',
};

const defaultNavMenu: NavMenuItem[] = [
  { id: '1', label: '首页', url: '/', type: 'internal', sortOrder: 0 },
  { id: '2', label: '分类', url: '/categories', type: 'internal', sortOrder: 1 },
  { id: '3', label: '标签', url: '/tags', type: 'internal', sortOrder: 2 },
  { id: '4', label: '知识库', url: '/knowledge', type: 'internal', sortOrder: 3 },
  { id: '5', label: '搜索', url: '/search', type: 'internal', sortOrder: 4 },
];

export const useSiteSettingsStore = create<SiteSettingsState>((set, get) => ({
  settings: defaultSettings,
  isLoading: true,

  fetchSettings: async () => {
    try {
      const data = await api.get<SiteSettings>('/settings/public');
      set({ settings: { ...defaultSettings, ...data }, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  getNavMenu: () => {
    const { settings } = get();
    if (settings.navMenu) {
      try {
        const parsed = JSON.parse(settings.navMenu);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // 返回默认菜单
      }
    }
    return defaultNavMenu;
  },
}));
