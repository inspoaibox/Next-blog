'use client';

import {
  Github,
  Twitter,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Code2,
  Terminal,
  Cpu,
  Coffee,
  Music,
  Camera,
  Heart,
} from 'lucide-react';
import { useThemeContext } from '@/contexts/theme-context';

interface AboutConfig {
  name?: string;
  avatar?: string;
  slogan?: string;
  location?: string;
  joinDate?: string;
  email?: string;
  github?: string;
  twitter?: string;
  bio?: string;
  skills?: Array<{
    category: string;
    icon: string;
    items: string[];
  }>;
  timeline?: Array<{
    year: string;
    title: string;
    company: string;
    description: string;
    type: 'work' | 'education';
  }>;
  hobbies?: Array<{
    name: string;
    description: string;
    icon: string;
  }>;
  stats?: Array<{
    value: string;
    label: string;
  }>;
}

interface Props {
  content: string;
  template: string;
}

// 主题配色
const themeColors = {
  classic: {
    gradient: 'from-amber-600 to-orange-700',
    accentText: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-50 dark:bg-amber-900/20',
    statsBg: 'bg-gradient-to-r from-amber-600 to-orange-600',
  },
  minimal: {
    gradient: 'from-gray-600 to-gray-800',
    accentText: 'text-gray-600 dark:text-gray-400',
    accentBg: 'bg-gray-100 dark:bg-gray-800',
    statsBg: 'bg-gray-800 dark:bg-gray-700',
  },
  magazine: {
    gradient: 'from-violet-600 to-fuchsia-600',
    accentText: 'text-violet-600 dark:text-violet-400',
    accentBg: 'bg-violet-50 dark:bg-violet-900/20',
    statsBg: 'bg-gradient-to-r from-violet-600 to-fuchsia-600',
  },
  cyber: {
    gradient: 'from-emerald-500 to-cyan-500',
    accentText: 'text-emerald-500',
    accentBg: 'bg-emerald-500/10',
    statsBg: 'bg-gradient-to-r from-emerald-600 to-cyan-600',
  },
  vibrant: {
    gradient: 'from-indigo-500 via-pink-500 to-lime-400',
    accentText: 'text-indigo-600 dark:text-indigo-400',
    accentBg: 'bg-indigo-50 dark:bg-indigo-900/20',
    statsBg: 'bg-gradient-to-r from-indigo-500 via-pink-500 to-lime-400',
  },
  'aura-nexus': {
    gradient: 'from-red-500 via-orange-500 to-cyan-500',
    accentText: 'text-red-500 dark:text-red-400',
    accentBg: 'bg-red-50 dark:bg-red-900/20',
    statsBg: 'bg-gradient-to-r from-red-500 to-cyan-500',
  },
  'vibe-pulse': {
    gradient: 'from-orange-500 to-amber-500',
    accentText: 'text-orange-500 dark:text-orange-400',
    accentBg: 'bg-orange-50 dark:bg-orange-900/20',
    statsBg: 'bg-gradient-to-r from-orange-500 to-amber-500',
  },
  'aether-bloom': {
    gradient: 'from-blue-400 via-teal-400 to-amber-300',
    accentText: 'text-blue-500 dark:text-blue-400',
    accentBg: 'bg-blue-50 dark:bg-blue-900/20',
    statsBg: 'bg-gradient-to-r from-blue-400 via-teal-400 to-amber-300',
  },
  'chroma-dimension': {
    gradient: 'from-fuchsia-500 via-purple-500 to-cyan-500',
    accentText: 'text-fuchsia-500 dark:text-fuchsia-400',
    accentBg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
    statsBg: 'bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500',
  },
};

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  code: <Code2 className="text-blue-500" size={18} />,
  terminal: <Terminal className="text-emerald-500" size={18} />,
  cpu: <Cpu className="text-purple-500" size={18} />,
  coffee: <Coffee size={18} />,
  music: <Music size={18} />,
  camera: <Camera size={18} />,
};

// 默认配置
const defaultConfig: AboutConfig = {
  name: '博主名称',
  slogan: '"代码是写给人看的，顺便给机器执行。"',
  location: '中国',
  joinDate: '2024',
  bio: '你好！欢迎来到我的博客。这里记录着我的技术探索和生活感悟。',
  skills: [
    { category: 'Frontend', icon: 'code', items: ['React', 'Next.js', 'TypeScript'] },
    { category: 'Backend', icon: 'terminal', items: ['Node.js', 'Go', 'PostgreSQL'] },
    { category: 'Tools', icon: 'cpu', items: ['Git', 'Docker', 'Linux'] },
  ],
  timeline: [
    {
      year: '2024 - Present',
      title: '全栈开发工程师',
      company: '某公司',
      description: '负责核心业务系统的开发与维护。',
      type: 'work',
    },
  ],
  hobbies: [
    { name: '咖啡', description: '寻找城市中最好喝的咖啡', icon: 'coffee' },
    { name: '音乐', description: 'Lo-fi 音乐爱好者', icon: 'music' },
    { name: '摄影', description: '用镜头捕捉瞬间', icon: 'camera' },
  ],
  stats: [
    { value: '10+', label: '开源项目' },
    { value: '50+', label: '文章发布' },
    { value: '100+', label: 'GitHub Stars' },
  ],
};

export function AboutClient({ content }: Props) {
  const { themeName } = useThemeContext();
  const colors = themeColors[themeName as keyof typeof themeColors] || themeColors.classic;

  // 解析配置
  let config: AboutConfig = defaultConfig;
  try {
    if (content) {
      const parsed = JSON.parse(content);
      config = { ...defaultConfig, ...parsed };
    }
  } catch {
    if (content && !content.startsWith('{')) {
      config = { ...defaultConfig, bio: content };
    }
  }

  return (
    <div className="py-8">
      {/* 个人名片 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl overflow-hidden ring-4 ring-gray-100 dark:ring-gray-700">
              {config.avatar ? (
                <img src={config.avatar} alt={config.name} className="h-full w-full object-cover" />
              ) : (
                <div className={`h-full w-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white text-3xl font-bold`}>
                  {config.name?.[0] || '?'}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 h-5 w-5 rounded-full border-3 border-white dark:border-gray-800" title="在线" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{config.name}</h1>
            {config.slogan && (
              <p className="text-gray-500 dark:text-gray-400 mb-3 italic">{config.slogan}</p>
            )}
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
              {config.location && (
                <span className="flex items-center gap-1"><MapPin size={14} /> {config.location}</span>
              )}
              {config.joinDate && (
                <span className="flex items-center gap-1"><Calendar size={14} /> 加入于 {config.joinDate}</span>
              )}
              {config.email && (
                <a href={`mailto:${config.email}`} className={`flex items-center gap-1 ${colors.accentText} hover:underline`}>
                  <Mail size={14} /> {config.email}
                </a>
              )}
            </div>
          </div>

          <div className="flex sm:flex-col gap-2">
            {config.github && (
              <a href={config.github} target="_blank" rel="noopener noreferrer"
                className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Github size={18} />
              </a>
            )}
            {config.twitter && (
              <a href={config.twitter} target="_blank" rel="noopener noreferrer"
                className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-500 transition-colors">
                <Twitter size={18} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 简介 */}
          {config.bio && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart size={18} className="text-red-500" /> 简介
              </h2>
              <div className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                {config.bio}
              </div>
            </section>
          )}

          {/* 技术栈 */}
          {config.skills && config.skills.length > 0 && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Code2 size={18} className={colors.accentText} /> 技术栈
              </h2>
              <div className="space-y-4">
                {config.skills.map((skill) => (
                  <div key={skill.category}>
                    <div className="flex items-center gap-2 mb-2">
                      {iconMap[skill.icon] || <Code2 size={18} className={colors.accentText} />}
                      <span className="font-medium text-sm">{skill.category}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skill.items.map((item) => (
                        <span key={item} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 历程 */}
          {config.timeline && config.timeline.length > 0 && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Calendar size={18} className="text-amber-500" /> 历程
              </h2>
              <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                {config.timeline.map((item, idx) => (
                  <div key={idx} className="relative flex gap-4 pl-2">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${colors.accentBg} ${colors.accentText} flex items-center justify-center z-10`}>
                      {item.type === 'education' ? <GraduationCap size={16} /> : <Briefcase size={16} />}
                    </div>
                    <div className="flex-1 pb-4">
                      <time className={`text-xs font-semibold ${colors.accentText} uppercase`}>{item.year}</time>
                      <h3 className="font-semibold mt-1">{item.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.company}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* 右侧 */}
        <div className="space-y-6">
          {/* 兴趣爱好 */}
          {config.hobbies && config.hobbies.length > 0 && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">兴趣爱好</h2>
              <div className="space-y-3">
                {config.hobbies.map((hobby, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.accentBg} ${colors.accentText}`}>
                      {iconMap[hobby.icon] || <Heart size={18} />}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{hobby.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{hobby.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 统计 */}
          {config.stats && config.stats.length > 0 && (
            <section className={`${colors.statsBg} rounded-2xl p-6 text-white`}>
              <h2 className="text-lg font-semibold mb-4">数字足迹</h2>
              <div className="grid grid-cols-2 gap-3">
                {config.stats.map((stat, idx) => (
                  <div key={idx} className="text-center p-3 bg-white/10 rounded-xl">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs opacity-80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 联系 */}
          <div className="bg-gray-800 dark:bg-gray-900 rounded-2xl p-6 text-center">
            <h3 className="text-white font-semibold mb-2">想和我聊聊？</h3>
            <p className="text-gray-400 text-sm mb-4">无论是技术探讨还是闲聊，都欢迎来信。</p>
            {config.email ? (
              <a href={`mailto:${config.email}`}
                className={`block w-full py-2.5 ${colors.statsBg} text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity`}>
                发送邮件
              </a>
            ) : (
              <button className={`w-full py-2.5 ${colors.statsBg} text-white rounded-xl text-sm font-semibold`}>
                联系我
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
