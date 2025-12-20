import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';
import { themes, type ThemeConfig } from '../themes';

interface BlogThemeState {
  currentTheme: string;
  themeConfig: ThemeConfig;
  isLoading: boolean;
  setTheme: (theme: string) => void;
  setThemeConfig: (config: ThemeConfig) => void;
  updateThemeConfig: (key: string, value: any) => void;
  fetchActiveTheme: () => Promise<void>;
  getConfig: () => ThemeConfig;
}

export const useBlogThemeStore = create<BlogThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: 'classic',
      themeConfig: {},
      isLoading: true,

      setTheme: (theme) => {
        // 切换主题时，加载该主题的默认配置
        const themeData = themes[theme];
        const defaultConfig = themeData?.defaultConfig || {};
        set({ currentTheme: theme, themeConfig: defaultConfig });
      },

      setThemeConfig: (config) => {
        set({ themeConfig: config });
      },

      updateThemeConfig: (key, value) => {
        set((state) => ({
          themeConfig: { ...state.themeConfig, [key]: value },
        }));
      },

      getConfig: () => {
        const state = get();
        const themeData = themes[state.currentTheme];
        // 合并默认配置和用户配置
        return { ...(themeData?.defaultConfig || {}), ...state.themeConfig };
      },

      fetchActiveTheme: async () => {
        try {
          const themesData = await api.get<any[]>('/themes');
          const activeTheme = themesData?.find((t) => t.isActive);
          if (activeTheme) {
            // 从数据库主题名映射到前端主题
            const themeMap: Record<string, string> = {
              'default-light': 'classic',
              'default-dark': 'classic',
              classic: 'classic',
              minimal: 'minimal',
              magazine: 'magazine',
            };
            const themeName = themeMap[activeTheme.name] || 'classic';
            
            // 解析主题配置（只存储用户自定义的配置）
            let config = {};
            if (activeTheme.config) {
              try {
                config = JSON.parse(activeTheme.config);
              } catch {
                config = {};
              }
            }
            
            // 只存储用户配置，getConfig() 会负责合并默认配置
            set({ currentTheme: themeName, themeConfig: config, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch {
          // 如果获取失败，使用本地存储的值
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'blog-theme-storage',
      partialize: (state) => ({
        currentTheme: state.currentTheme,
        themeConfig: state.themeConfig,
      }),
    }
  )
);
