import type { Metadata } from 'next';
import { Providers } from './providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'NextBlog',
    template: '%s | NextBlog',
  },
  description: '下一个博客，记录精彩生活',
};

// 内联脚本，在页面渲染前应用主题，避免闪烁
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme-storage');
    var theme = 'system';
    if (stored) {
      var parsed = JSON.parse(stored);
      theme = (parsed.state && parsed.state.theme) || 'system';
    }
    var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
