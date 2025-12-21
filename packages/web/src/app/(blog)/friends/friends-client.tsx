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

interface Props {
  links: FriendLink[];
  template: string;
}

// 颜色方案
const colorSchemes = {
  purple: {
    gradient: 'from-violet-500 via-fuchsia-500 to-pink-500',
    text: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-100 dark:border-violet-800/50',
  },
  blue: {
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-800/50',
  },
  amber: {
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-100 dark:border-amber-800/50',
  },
  green: {
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-100 dark:border-emerald-800/50',
  },
};

// 根据字符串生成稳定的渐变色
const getHashGradient = (str: string) => {
  const gradients = [
    'from-blue-400 to-emerald-400',
    'from-violet-400 to-fuchsia-400',
    'from-orange-400 to-rose-400',
    'from-cyan-400 to-blue-400',
    'from-pink-400 to-purple-400',
    'from-amber-400 to-red-400',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

export function FriendsClient({ links, template }: Props) {
  const { settings } = useSiteSettingsContext();
  const theme = colorSchemes.purple; // 默认紫色方案

  const containerClass =
    template === 'fullwidth'
      ? 'max-w-full px-4'
      : template === 'sidebar'
        ? 'max-w-6xl mx-auto px-4'
        : 'max-w-7xl mx-auto px-4';

  const siteName = settings.siteName || 'NextBlog';
  const siteUrl = settings.siteUrl || 'https://yourblog.com';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      {/* 头部装饰背景 */}
      <div
        className={`h-80 w-full bg-gradient-to-br ${theme.gradient} opacity-10 absolute top-0 left-0 blur-3xl`}
      />

      <div className={`${containerClass} py-16 relative`}>
        {/* 标题区域 */}
        <div className="text-center mb-16">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 mb-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border ${theme.border}`}
          >
            <LinkIcon className={theme.text} size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            <span
              className={`bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}
            >
              友情链接
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto font-medium">
            在这里，遇见那些同样热爱技术与生活的灵魂。
          </p>
        </div>

        {/* 链接网格 */}
        {links.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-900 mb-4">
              <LinkIcon size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              暂无友链
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              快来申请成为第一个友链吧！
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-24">
            {links.map((link) => (
              <FriendCard key={link.id} link={link} theme={theme} />
            ))}
          </div>
        )}

        {/* 申请交换区域 */}
        <section
          className={`relative overflow-hidden bg-white dark:bg-gray-900 rounded-[2rem] p-8 md:p-12 border ${theme.border} shadow-2xl shadow-gray-200/50 dark:shadow-none`}
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
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                  互换友链
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    <Globe size={16} className="text-blue-500" /> 本站信息
                  </h4>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-sm space-y-2 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
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
                  <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    <Info size={16} className="text-amber-500" /> 申请须知
                  </h4>
                  <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2 list-none">
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
              className={`w-full lg:w-80 p-8 rounded-3xl bg-gradient-to-br ${theme.gradient} text-white text-center`}
            >
              <MessageSquare className="mx-auto mb-4 opacity-50" size={40} />
              <h3 className="text-xl font-bold mb-2">准备好了吗？</h3>
              <p className="text-sm opacity-80 mb-6 font-medium">
                在评论区留下你的站点信息，我会尽快回复你。
              </p>
              <a
                href="#comments"
                className="block w-full py-3 px-6 bg-white text-gray-900 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all shadow-xl"
              >
                立即申请
              </a>
            </div>
          </div>
        </section>

        {/* 底部探索 */}
        <div className="mt-24 flex flex-col items-center gap-6">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
          <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500 group cursor-pointer">
            <Compass
              className="group-hover:rotate-180 transition-transform duration-700"
              size={20}
            />
            <span className="text-xs font-bold uppercase tracking-[0.2em] group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
              Explore More
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FriendCard({
  link,
  theme,
}: {
  link: FriendLink;
  theme: (typeof colorSchemes)['purple'];
}) {
  const gradientColor = getHashGradient(link.name);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-800"
    >
      {/* 卡片顶部的彩色装饰条 */}
      <div
        className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${gradientColor} opacity-0 group-hover:opacity-100 transition-opacity rounded-t-3xl`}
      />

      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl overflow-hidden ring-4 ring-gray-50 dark:ring-gray-800 group-hover:ring-violet-100 dark:group-hover:ring-violet-900/30 transition-all duration-500">
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
          <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
            <Sparkles size={12} className={theme.text} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-500 dark:group-hover:from-white dark:group-hover:to-gray-400 transition-all">
            {link.name}
          </h3>
        </div>
      </div>

      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 h-10 mb-4">
        {link.description || '暂无描述'}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800/50">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 dark:group-hover:text-gray-300">
          Visit Site
        </span>
        <ExternalLink
          size={14}
          className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
        />
      </div>
    </a>
  );
}
