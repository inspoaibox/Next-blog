'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { NavMenuItem, SliderItem } from '@/stores/site-settings.store';

interface SiteSettingsContextValue {
  settings: Record<string, string>;
  navMenu: NavMenuItem[];
  sliderItems: SliderItem[];
  isSliderEnabled: boolean;
  sliderStyle: 'full' | 'cards' | 'minimal';
  isCommentEnabled: boolean;
}

const defaultNavMenu: NavMenuItem[] = [
  { id: '1', label: '首页', url: '/', type: 'internal', sortOrder: 0 },
  { id: '2', label: '分类', url: '/categories', type: 'internal', sortOrder: 1 },
  { id: '3', label: '标签', url: '/tags', type: 'internal', sortOrder: 2 },
  { id: '4', label: '知识库', url: '/knowledge', type: 'internal', sortOrder: 3 },
];

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

function parseNavMenu(navMenuStr: string | undefined): NavMenuItem[] {
  if (!navMenuStr) return defaultNavMenu;
  try {
    const parsed = JSON.parse(navMenuStr);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // 过滤不可见的菜单项
      const filterVisible = (items: NavMenuItem[]): NavMenuItem[] => {
        return items
          .filter(item => item.visible !== false)
          .map(item => ({
            ...item,
            children: item.children ? filterVisible(item.children) : undefined,
          }));
      };
      const visibleItems = filterVisible(parsed);
      // 如果过滤后没有可见项，返回默认菜单
      return visibleItems.length > 0 ? visibleItems : defaultNavMenu;
    }
  } catch {
    // 解析失败返回默认菜单
  }
  return defaultNavMenu;
}

function parseSliderItems(sliderItemsStr: string | undefined): SliderItem[] {
  if (!sliderItemsStr) return [];
  try {
    return JSON.parse(sliderItemsStr);
  } catch {
    return [];
  }
}

interface SiteSettingsProviderProps {
  children: ReactNode;
  settings: Record<string, string>;
}

export function SiteSettingsProvider({ children, settings }: SiteSettingsProviderProps) {
  const navMenu = parseNavMenu(settings.navMenu);
  const sliderItems = parseSliderItems(settings.sliderItems);
  const isSliderEnabled = settings.sliderEnabled !== 'false';
  const sliderStyle = (settings.sliderStyle as 'full' | 'cards' | 'minimal') || 'full';
  const isCommentEnabled = settings.commentEnabled !== 'false';

  return (
    <SiteSettingsContext.Provider value={{
      settings,
      navMenu,
      sliderItems,
      isSliderEnabled,
      sliderStyle,
      isCommentEnabled,
    }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettingsContext() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    // 如果没有 Provider，返回默认值
    return {
      settings: {},
      navMenu: defaultNavMenu,
      sliderItems: [],
      isSliderEnabled: true,
      sliderStyle: 'full' as const,
      isCommentEnabled: true,
    };
  }
  return context;
}
