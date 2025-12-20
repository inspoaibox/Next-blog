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
  sliderEnabled: string;
  sliderStyle: string;
  sliderItems: string;
  commentEnabled: string;
}

export interface NavMenuItem {
  id: string;
  label: string;
  url: string;
  type: 'internal' | 'external' | 'page';
  sortOrder: number;
  visible?: boolean;
  children?: NavMenuItem[];
}

export interface SliderItem {
  id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  sortOrder: number;
}

interface SiteSettingsState {
  settings: SiteSettings;
  isLoading: boolean;
  setSettings: (settings: Record<string, string>) => void;
  fetchSettings: () => Promise<void>;
  getNavMenu: () => NavMenuItem[];
  getSliderItems: () => SliderItem[];
  isSliderEnabled: () => boolean;
  getSliderStyle: () => 'full' | 'cards' | 'minimal';
  isCommentEnabled: () => boolean;
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
  sliderEnabled: 'true',
  sliderStyle: 'full',
  sliderItems: '',
  commentEnabled: 'true',
};

const defaultNavMenu: NavMenuItem[] = [
  { id: '1', label: '首页', url: '/', type: 'internal', sortOrder: 0 },
  { id: '2', label: '分类', url: '/categories', type: 'internal', sortOrder: 1 },
  { id: '3', label: '标签', url: '/tags', type: 'internal', sortOrder: 2 },
  { id: '4', label: '知识库', url: '/knowledge', type: 'internal', sortOrder: 3 },
];

export const useSiteSettingsStore = create<SiteSettingsState>((set, get) => ({
  settings: defaultSettings,
  isLoading: true,

  setSettings: (newSettings) => {
    set({ settings: { ...defaultSettings, ...newSettings } as SiteSettings, isLoading: false });
  },

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
    const filterVisible = (items: NavMenuItem[]): NavMenuItem[] => {
      return items
        .filter(item => item.visible !== false)
        .map(item => ({
          ...item,
          children: item.children ? filterVisible(item.children) : undefined,
        }));
    };
    
    if (settings.navMenu) {
      try {
        const parsed = JSON.parse(settings.navMenu);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return filterVisible(parsed);
        }
      } catch {
        // 返回默认菜单
      }
    }
    return defaultNavMenu;
  },

  getSliderItems: () => {
    const { settings } = get();
    if (settings.sliderItems) {
      try {
        return JSON.parse(settings.sliderItems);
      } catch {
        return [];
      }
    }
    return [];
  },

  isSliderEnabled: () => {
    const { settings } = get();
    return settings.sliderEnabled !== 'false';
  },

  getSliderStyle: () => {
    const { settings } = get();
    return (settings.sliderStyle as 'full' | 'cards' | 'minimal') || 'full';
  },

  isCommentEnabled: () => {
    const { settings } = get();
    return settings.commentEnabled !== 'false';
  },
}));
