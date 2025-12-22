'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // 初始化暗色模式 - 使用 theme-storage 键（与 theme.store.ts 保持一致）
  useEffect(() => {
    const stored = localStorage.getItem('theme-storage');
    let theme = 'system';
    
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        theme = state?.theme || 'system';
      } catch {
        // 解析失败，使用默认值
      }
    }
    
    let isDark = false;
    if (theme === 'dark') {
      isDark = true;
    } else if (theme === 'light') {
      isDark = false;
    } else {
      // system 模式，跟随系统
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    document.documentElement.classList.toggle('dark', isDark);
    
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const currentStored = localStorage.getItem('theme-storage');
      let currentTheme = 'system';
      if (currentStored) {
        try {
          const { state } = JSON.parse(currentStored);
          currentTheme = state?.theme || 'system';
        } catch {}
      }
      if (currentTheme === 'system') {
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
