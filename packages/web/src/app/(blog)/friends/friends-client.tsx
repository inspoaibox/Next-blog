'use client';

import type { FriendLink } from '@/types';
import {
  Link as LinkIcon,
  ExternalLink,
  UserPlus,
  Info,
  Globe,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useSiteSettingsContext } from '@/contexts/site-settings-context';
import { useThemeContext } from '@/contexts/theme-context';

interface Props {
  links: FriendLink[];
  template: string;
}

// 友链页面配置接口
interface FriendsPageConfig {
  title?: string;
  subtitle?: string;
  exchangeTitle?: string;
  exchangeDescription?: string;
  requirements?: string[];
  ctaTitle?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
}

// 主题配色
const themeColors = {
  classic: {
    accent: 'amber',
    gradient: 'from-amber-500 via-orange-500 to-amber-600',
    accentText: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  minimal: {
    accent: 'gray',
    gradient: 'from-gray-500 via-gray-600 to-gray-700',
    accentText: 'text-gray-600 dark:text-gray-400',
    accentBg: 'bg-gray-100 dark:bg-gray-800',
  },
  magazine: {
    accent: 'violet',
    gradient: 'from-violet-500 via-fuchsia-500 to-pink-500',
    accentText: 'text-violet-600 dark:text-violet-400',
    accentBg: 'bg-violet-50 dark:bg-violet-900/20',
  },
  cyber: {
    accent: 'emerald',
    gradient: 'from-emerald-500 via-cyan-500 to-emerald-400',
    accentText: 'text-emerald-500',
    accentBg: 'bg-emerald-500/10',
  },
  vibrant: {
    accent: 'indigo',
    gradient: 'from-indigo-500 via-pink-500 to-lime-400',
    accentText: 'text-indigo-600 dark:text-indigo-400',
    accentBg: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
  'aura-nexus': {
    accent: 'red',
    gradient: 'from-red-500 via-orange-500 to-cyan-500',
    accentText: 'text-red-500 dark:text-red-400',
    accentBg: 'bg-red-50 dark:bg-red-900/20',
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

// 默认配置
const defaultConfig: FriendsPageConfig = {
  title: '友情链接',
  subtitle: '在这里，遇见那些同样热爱技术与生活的灵魂。',
  exchangeTitle: '互换友链',
  exchangeDescription: '',
  requirements: ['原创技术/生活类内容优先', '稳定更新，拒绝采集站', '已添加本站友链'],
  ctaTitle: '准备好了吗？',
  ctaDescription: '在评论区留下你的站点信息，我会尽快回复。',
  ctaButtonText: '立即申请',
  ctaButtonLink: '#comments',
};

export function FriendsClient({ links }: Props) {
  const { settings } = useSiteSettingsContext();
  const { themeName } = useThemeContext();
  const colors = themeColors[themeName as keyof typeof themeColors] || themeColors.classic;

  // 解析页面配置
  let config: FriendsPageConfig = defaultConfig;
  try {
    if (settings.friendsPageContent) {
      config = { ...defaultConfig, ...JSON.parse(settings.friendsPageContent) };
    }
  } catch {
    // 使用默认配置
  }

  const siteName = settings.siteName || 'NextBlog';
  const siteUrl = settings.siteUrl || 'https://yourblog.com';

  return (
    <div className="py-8">
      {/* 标题区域 */}
      <div className="text-center mb-12">
        <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 ${colors.accentBg} rounded-2xl`}>
          <LinkIcon className={colors.accentText} size={32} />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          <span className={`bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
            {config.title}
          </span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
          {config.subtitle}
        </p>
      </div>

      {/* 链接网格 */}
      {links.length === 0 ? (
        <div className="text-center py-16">
          <div className={`inline-flex p-4 rounded-full ${colors.accentBg} mb-4`}>
            <LinkIcon size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">暂无友链</h3>
          <p className="text-gray-500 dark:text-gray-400">快来申请成为第一个友链吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {links.map((link) => (
            <FriendCard key={link.id} link={link} colors={colors} />
          ))}
        </div>
      )}

      {/* 申请交换区域 - 修复布局 */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${colors.accentBg}`}>
            <UserPlus className={colors.accentText} size={24} />
          </div>
          <h2 className="text-2xl font-bold">{config.exchangeTitle}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 本站信息 */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
              <Globe size={16} className={colors.accentText} /> 本站信息
            </h4>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm space-y-2 text-gray-600 dark:text-gray-400">
              <p><span className="opacity-50">名称:</span> {siteName}</p>
              <p><span className="opacity-50">链接:</span> {siteUrl}</p>
              <p className="break-all">
                <span className="opacity-50">描述:</span> {settings.siteDescription || '一个技术博客'}
              </p>
            </div>
          </div>

          {/* 申请须知 */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
              <Info size={16} className="text-amber-500" /> 申请须知
            </h4>
            <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
              {config.requirements?.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA 卡片 */}
          <div className={`p-6 rounded-2xl bg-gradient-to-br ${colors.gradient} text-white text-center`}>
            <MessageSquare className="mx-auto mb-3 opacity-70" size={32} />
            <h3 className="text-lg font-bold mb-2">{config.ctaTitle}</h3>
            <p className="text-sm opacity-80 mb-4">{config.ctaDescription}</p>
            <a
              href={config.ctaButtonLink}
              className="block w-full py-2.5 px-4 bg-white text-gray-900 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              {config.ctaButtonText}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

interface ColorScheme {
  accent: string;
  gradient: string;
  accentText: string;
  accentBg: string;
}

function FriendCard({ link, colors }: { link: FriendLink; colors: ColorScheme }) {
  const gradientColor = getHashGradient(link.name);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* 顶部装饰条 */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientColor} opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl`} />

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <div className="h-14 w-14 rounded-xl overflow-hidden ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-4 transition-all">
            {link.logo ? (
              <img
                src={link.logo}
                alt={link.name}
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className={`h-full w-full bg-gradient-to-br ${gradientColor} flex items-center justify-center text-white text-xl font-bold`}>
                {link.name[0]}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 p-0.5 bg-white dark:bg-gray-800 rounded-md">
            <Sparkles size={10} className={colors.accentText} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {link.name}
          </h3>
        </div>
      </div>

      <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">
        {link.description || '暂无描述'}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-400 uppercase tracking-wider">访问</span>
        <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
      </div>
    </a>
  );
}
