'use client';

import type { FriendLink } from '@/types';
import {
  Link as LinkIcon,
  ExternalLink,
  UserPlus,
  Info,
  Globe,
  MessageSquare,
  Compass,
  Sparkles,
} from 'lucide-react';
import { useSiteSettingsContext } from '@/contexts/site-settings-context';
import { useBlogThemeStore } from '@/stores/blog-theme.store';

interface Props {
  links: FriendLink[];
  template: string;
}

// 主题配色方案
const themeStyles = {
  classic: {
    gradient: 'from-amber-500 via-orange-500 to-amber-600',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-100 dark:border-amber-800/50',
    pageBg: 'bg-stone-50 dark:bg-stone-900',
    cardBg: 'bg-white dark:bg-stone-800',
    cardBorder: 'border-stone-200 dark:border-stone-700',
    textPrimary: 'text-stone-900 dark:text-white',
    textMuted: 'text-stone-500 dark:text-stone-400',
    ctaBg: 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600',
    sectionBg: 'bg-white dark:bg-stone-800',
    sectionBorder: 'border-stone-200 dark:border-stone-700',
  },
  minimal: {
    gradient: 'from-gray-400 via-gray-500 to-gray-600',
    text: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-gray-100 dark:bg-gray-900',
    border: 'border-gray-200 dark:border-gray-800',
    pageBg: 'bg-white dark:bg-black',
    cardBg: 'bg-white dark:bg-gray-950',
    cardBorder: 'border-gray-100 dark:border-gray-900',
    textPrimary: 'text-gray-900 dark:text-gray-100',
    textMuted: 'text-gray-500 dark:text-gray-400',
    ctaBg: 'bg-gray-900 dark:bg-white',
    sectionBg: 'bg-white dark:bg-gray-950',
    sectionBorder: 'border-gray-100 dark:border-gray-900',
  },
  magazine: {
    gradient: 'from-violet-500 via-fuchsia-500 to-pink-500',
    text: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-100 dark:border-violet-800/50',
    pageBg: 'bg-gray-100 dark:bg-gray-950',
    cardBg: 'bg-white dark:bg-gray-900',
    cardBorder: 'border-gray-200 dark:border-gray-800',
    textPrimary: 'text-gray-900 dark:text-white',
    textMuted: 'text-gray-500 dark:text-gray-400',
    ctaBg: 'bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500',
    sectionBg: 'bg-white dark:bg-gray-900',
    sectionBorder: 'border-gray-200 dark:border-gray-800',
  },
};

// 根据字符串生成稳定的渐变色
const getHashGradient = (str: string, currentTheme: string) => {
  const gradientsByTheme: Record<string, string[]> = {
    classic: [
      'from-amber-400 to-orange-400',
      'from-stone-400 to-stone-500',
      'from-orange-400 to-red-400',
      'from-yellow-400 to-amber-400',
      'from-rose-400 to-orange-400',
      'from-amber-500 to-yellow-400',
    ],
    minimal: [
      'from-gray-400 to-gray-500',
      'from-gray-300 to-gray-400',
      'from-gray-500 to-gray-600',
      'from-slate-400 to-slate-500',
      'from-zinc-400 to-zinc-500',
      'from-neutral-400 to-neutral-500',
    ],
    magazine: [
      'from-violet-400 to-fuchsia-400',
      'from-fuchsia-400 to-pink-400',
      'from-cyan-400 to-blue-400',
      'from-pink-400 to-purple-400',
      'from-indigo-400 to-violet-400',
      'from-rose-400 to-pink-400',
    ],
  };
  const gradients = gradientsByTheme[currentTheme] || gradientsByTheme.magazine;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

export function FriendsClient({ links, template }: Props) {
  const { settings } = useSiteSettingsContext();
  const { currentTheme } = useBlogThemeStore();
  const theme = themeStyles[currentTheme as keyof typeof themeStyles] || themeStyles.magazine;

  const containerClass =
    template === 'fullwidth'
      ? 'max-w-full px-4'
      : template === 'sidebar'
        ? 'max-w-6xl mx-auto px-4'
        : 'max-w-7xl mx-auto px-4';

  const siteName = settings.siteName || 'NextBlog';
  const siteUrl = settings.siteUrl || 'https://yourblog.com';

  return (
    <div className={`min-h-screen ${theme.pageBg} transition-colors duration-500`}>
      {/* 头部装饰背景 */}
      <div
        className={`h-80 w-full bg-gradient-to-br ${theme.gradient} opacity-10 absolute top-0 left-0 blur-3xl`}
      />

      <div className={`${containerClass} py-16 relative`}>
        {/* 标题区域 */}
        <div className="text-center mb-16">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 mb-6 ${theme.cardBg} rounded-2xl shadow-xl border ${theme.border}`}
          >
            <LinkIcon className={theme.text} size={32} />
          </div>
          <h1 className={`text-4xl md:text-5xl font-black mb-4 tracking-tight ${currentTheme === 'minimal' ? 'font-extralight tracking-[0.1em]' : ''}`}>
            {currentTheme === 'minimal' ? (
              <span className={theme.textPrimary}>友情链接</span>
            ) : (
              <span className={`bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                友情链接
              </span>
            )}
          </h1>
          <p className={`${theme.textMuted} text-lg max-w-xl mx-auto font-medium ${currentTheme === 'minimal' ? 'font-light' : ''}`}>
            在这里，遇见那些同样热爱技术与生活的灵魂。
          </p>
        </div>

        {/* 链接网格 */}
        {links.length === 0 ? (
          <div className="text-center py-20">
            <div className={`inline-flex p-4 rounded-full ${theme.bg} mb-4`}>
              <LinkIcon size={32} className={theme.textMuted} />
            </div>
            <h3 className={`text-lg font-medium ${theme.textPrimary}`}>
              暂无友链
            </h3>
            <p className={theme.textMuted}>
              快来申请成为第一个友链吧！
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-24">
            {links.map((link) => (
              <FriendCard key={link.id} link={link} theme={theme} currentTheme={currentTheme} />
            ))}
          </div>
        )}

        {/* 申请交换区域 */}
        <section
          className={`relative overflow-hidden ${theme.sectionBg} rounded-[2rem] p-8 md:p-12 border ${theme.sectionBorder} shadow-2xl shadow-gray-200/50 dark:shadow-none`}
        >
          <div
            className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${theme.gradient} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2`}
          />

          <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${theme.bg}`}>
                  <UserPlus className={theme.text} size={24} />
                </div>
                <h2 className={`text-3xl font-black ${theme.textPrimary} ${currentTheme === 'minimal' ? 'font-extralight' : ''}`}>
                  互换友链
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h4 className={`flex items-center gap-2 text-sm font-bold ${theme.textPrimary} uppercase tracking-wider`}>
                    <Globe size={16} className={theme.text} /> 本站信息
                  </h4>
                  <div className={`p-4 rounded-2xl ${theme.bg} text-sm space-y-2 ${theme.textMuted} border ${theme.border}`}>
                    <p>
                      <span className="opacity-50">SITE:</span> {siteName}
                    </p>
                    <p>
                      <span className="opacity-50">LINK:</span> {siteUrl}
                    </p>
                    <p className="truncate">
                      <span className="opacity-50">DESC:</span>{' '}
                      {settings.siteDescription || '一个技术博客'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className={`flex items-center gap-2 text-sm font-bold ${theme.textPrimary} uppercase tracking-wider`}>
                    <Info size={16} className="text-amber-500" /> 申请须知
                  </h4>
                  <ul className={`text-sm ${theme.textMuted} space-y-2 list-none`}>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-amber-500" />{' '}
                      原创技术/生活类内容优先
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-amber-500" />{' '}
                      稳定更新，拒绝采集站
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-amber-500" />{' '}
                      已添加本站友链
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div
              className={`w-full lg:w-80 p-8 rounded-3xl ${theme.ctaBg} text-white text-center ${currentTheme === 'minimal' ? 'text-gray-900 dark:text-white' : ''}`}
            >
              <MessageSquare className="mx-auto mb-4 opacity-50" size={40} />
              <h3 className="text-xl font-bold mb-2">准备好了吗？</h3>
              <p className="text-sm opacity-80 mb-6 font-medium">
                在评论区留下你的站点信息，我会尽快回复你。
              </p>
              <a
                href="#comments"
                className={`block w-full py-3 px-6 bg-white ${currentTheme === 'minimal' ? 'text-gray-900' : theme.text.replace('dark:', '')} rounded-2xl font-black text-sm hover:bg-gray-100 transition-all shadow-xl`}
              >
                立即申请
              </a>
            </div>
          </div>
        </section>

        {/* 底部探索 */}
        <div className="mt-24 flex flex-col items-center gap-6">
          <div className={`h-px w-24 bg-gradient-to-r from-transparent ${currentTheme === 'minimal' ? 'via-gray-300 dark:via-gray-700' : `via-${currentTheme === 'classic' ? 'stone' : 'gray'}-300 dark:via-${currentTheme === 'classic' ? 'stone' : 'gray'}-700`} to-transparent`} />
          <div className={`flex items-center gap-3 ${theme.textMuted} group cursor-pointer`}>
            <Compass
              className="group-hover:rotate-180 transition-transform duration-700"
              size={20}
            />
            <span className={`text-xs font-bold uppercase tracking-[0.2em] group-hover:${theme.textPrimary} transition-colors`}>
              Explore More
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ThemeStyle {
  gradient: string;
  text: string;
  bg: string;
  border: string;
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textMuted: string;
  ctaBg: string;
  sectionBg: string;
  sectionBorder: string;
}

function FriendCard({
  link,
  theme,
  currentTheme,
}: {
  link: FriendLink;
  theme: ThemeStyle;
  currentTheme: string;
}) {
  const gradientColor = getHashGradient(link.name, currentTheme);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative ${theme.cardBg} rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border ${theme.cardBorder}`}
    >
      {/* 卡片顶部的彩色装饰条 */}
      <div
        className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${gradientColor} opacity-0 group-hover:opacity-100 transition-opacity rounded-t-3xl`}
      />

      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          <div className={`h-16 w-16 rounded-2xl overflow-hidden ring-4 ${currentTheme === 'classic' ? 'ring-stone-50 dark:ring-stone-800 group-hover:ring-amber-100 dark:group-hover:ring-amber-900/30' : currentTheme === 'minimal' ? 'ring-gray-50 dark:ring-gray-900 group-hover:ring-gray-200 dark:group-hover:ring-gray-800' : 'ring-gray-50 dark:ring-gray-800 group-hover:ring-violet-100 dark:group-hover:ring-violet-900/30'} transition-all duration-500`}>
            {link.logo ? (
              <img
                src={link.logo}
                alt={link.name}
                className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div
                className={`h-full w-full bg-gradient-to-br ${gradientColor} flex items-center justify-center text-white text-2xl font-bold`}
              >
                {link.name[0]}
              </div>
            )}
          </div>
          <div className={`absolute -bottom-1 -right-1 p-1 ${theme.cardBg} rounded-lg shadow-sm border ${theme.cardBorder}`}>
            <Sparkles size={12} className={theme.text} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-bold ${theme.textPrimary} truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${currentTheme === 'minimal' ? 'group-hover:from-gray-900 group-hover:to-gray-500 dark:group-hover:from-white dark:group-hover:to-gray-400' : `group-hover:${theme.gradient}`} transition-all ${currentTheme === 'minimal' ? 'font-light' : ''}`}>
            {link.name}
          </h3>
        </div>
      </div>

      <p className={`${theme.textMuted} text-sm leading-relaxed line-clamp-2 h-10 mb-4`}>
        {link.description || '暂无描述'}
      </p>

      <div className={`flex items-center justify-between pt-4 border-t ${theme.cardBorder}`}>
        <span className={`text-[10px] font-bold ${theme.textMuted} uppercase tracking-widest group-hover:${theme.textPrimary}`}>
          Visit Site
        </span>
        <ExternalLink
          size={14}
          className={`${theme.textMuted} group-hover:${theme.text} group-hover:translate-x-1 transition-all`}
        />
      </div>
    </a>
  );
}
