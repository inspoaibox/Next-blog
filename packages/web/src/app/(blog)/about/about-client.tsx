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
import { useBlogThemeStore } from '@/stores/blog-theme.store';

interface AboutConfig {
  // 基本信息
  name?: string;
  avatar?: string;
  slogan?: string;
  location?: string;
  joinDate?: string;
  email?: string;
  github?: string;
  twitter?: string;
  // 简介
  bio?: string;
  // 技术栈
  skills?: Array<{
    category: string;
    icon: string;
    items: string[];
  }>;
  // 经历
  timeline?: Array<{
    year: string;
    title: string;
    company: string;
    description: string;
    type: 'work' | 'education';
  }>;
  // 兴趣爱好
  hobbies?: Array<{
    name: string;
    description: string;
    icon: string;
  }>;
  // 统计数据
  stats?: Array<{
    value: string;
    label: string;
  }>;
}

interface Props {
  content: string;
  template: string;
}

// 主题配色方案
const themeStyles = {
  classic: {
    pageBg: 'bg-stone-50 dark:bg-stone-900',
    headerGradient: 'from-amber-600 to-amber-800',
    cardBg: 'bg-white dark:bg-stone-800',
    border: 'border-stone-200 dark:border-stone-700',
    text: 'text-stone-900 dark:text-white',
    textMuted: 'text-stone-600 dark:text-stone-400',
    accent: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconBg: 'bg-stone-100 dark:bg-stone-700',
    iconHover: 'hover:bg-amber-600 hover:text-white',
    tagBg: 'bg-stone-50 dark:bg-stone-700',
    tagBorder: 'border-stone-100 dark:border-stone-700',
    timelineAccent: 'border-amber-500 text-amber-500',
    statsBg: 'bg-amber-600',
    statsShadow: 'shadow-amber-500/20',
    ctaBg: 'bg-stone-800 dark:bg-amber-900/20',
    ctaBorder: 'border-stone-700',
    ctaButton: 'bg-amber-600 hover:bg-amber-500',
  },
  minimal: {
    pageBg: 'bg-white dark:bg-black',
    headerGradient: 'from-gray-600 to-gray-800',
    cardBg: 'bg-white dark:bg-gray-950',
    border: 'border-gray-100 dark:border-gray-900',
    text: 'text-gray-900 dark:text-gray-100',
    textMuted: 'text-gray-500 dark:text-gray-400',
    accent: 'text-gray-700 dark:text-gray-300',
    accentBg: 'bg-gray-100 dark:bg-gray-900',
    iconBg: 'bg-gray-100 dark:bg-gray-900',
    iconHover: 'hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900',
    tagBg: 'bg-gray-50 dark:bg-gray-900',
    tagBorder: 'border-gray-100 dark:border-gray-900',
    timelineAccent: 'border-gray-500 text-gray-500',
    statsBg: 'bg-gray-900 dark:bg-white',
    statsShadow: 'shadow-gray-500/10',
    ctaBg: 'bg-gray-900 dark:bg-gray-900',
    ctaBorder: 'border-gray-800',
    ctaButton: 'bg-gray-700 hover:bg-gray-600 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100',
  },
  magazine: {
    pageBg: 'bg-gray-100 dark:bg-gray-950',
    headerGradient: 'from-violet-600 to-fuchsia-700',
    cardBg: 'bg-white dark:bg-gray-900',
    border: 'border-gray-200 dark:border-gray-800',
    text: 'text-gray-900 dark:text-white',
    textMuted: 'text-gray-500 dark:text-gray-400',
    accent: 'text-violet-600 dark:text-violet-400',
    accentBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconHover: 'hover:bg-violet-600 hover:text-white',
    tagBg: 'bg-gray-50 dark:bg-gray-800',
    tagBorder: 'border-gray-100 dark:border-gray-800',
    timelineAccent: 'border-violet-500 text-violet-500',
    statsBg: 'bg-gradient-to-r from-violet-600 to-fuchsia-600',
    statsShadow: 'shadow-violet-500/20',
    ctaBg: 'bg-gray-900 dark:bg-violet-900/20',
    ctaBorder: 'border-gray-800',
    ctaButton: 'bg-violet-600 hover:bg-violet-500',
  },
};

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  code: <Code2 className="text-blue-500" />,
  terminal: <Terminal className="text-emerald-500" />,
  cpu: <Cpu className="text-purple-500" />,
  coffee: <Coffee size={20} />,
  music: <Music size={20} />,
  camera: <Camera size={20} />,
};

const getHobbyColor = (icon: string, currentTheme: string) => {
  const colorsByTheme: Record<string, Record<string, string>> = {
    classic: {
      coffee: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
      music: 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400',
      camera: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    },
    minimal: {
      coffee: 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400',
      music: 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400',
      camera: 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400',
    },
    magazine: {
      coffee: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
      music: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
      camera: 'bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400',
    },
  };
  const colors = colorsByTheme[currentTheme] || colorsByTheme.magazine;
  return colors[icon] || 'bg-gray-50 dark:bg-gray-800 text-gray-600';
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

export function AboutClient({ content, template }: Props) {
  const { currentTheme } = useBlogThemeStore();
  const theme = themeStyles[currentTheme as keyof typeof themeStyles] || themeStyles.magazine;

  // 解析配置
  let config: AboutConfig = defaultConfig;
  try {
    if (content) {
      const parsed = JSON.parse(content);
      config = { ...defaultConfig, ...parsed };
    }
  } catch {
    // 如果不是 JSON，尝试作为 Markdown 处理（向后兼容）
    if (content && !content.startsWith('{')) {
      config = { ...defaultConfig, bio: content };
    }
  }

  const containerClass =
    template === 'fullwidth'
      ? 'max-w-full'
      : template === 'sidebar'
        ? 'max-w-6xl mx-auto'
        : 'max-w-4xl mx-auto';

  return (
    <div className={`min-h-screen ${theme.pageBg} transition-colors duration-300`}>
      {/* 顶部背景 */}
      <div className={`relative h-64 bg-gradient-to-r ${theme.headerGradient} overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 bg-grid-pattern" />
      </div>

      <div className={`${containerClass} px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20`}>
        {/* 个人名片 */}
        <div className={`${theme.cardBg} rounded-3xl p-8 shadow-xl border ${theme.border} text-center sm:text-left`}>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative">
              <div className={`h-32 w-32 rounded-3xl overflow-hidden ring-4 ${currentTheme === 'classic' ? 'ring-white dark:ring-stone-800' : currentTheme === 'minimal' ? 'ring-white dark:ring-gray-900' : 'ring-white dark:ring-gray-800'} shadow-2xl`}>
                {config.avatar ? (
                  <img src={config.avatar} alt={config.name} className="h-full w-full object-cover" />
                ) : (
                  <div className={`h-full w-full bg-gradient-to-br ${theme.headerGradient} flex items-center justify-center text-white text-4xl font-bold`}>
                    {config.name?.[0] || '?'}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 h-6 w-6 rounded-full border-4 border-white dark:border-gray-900 shadow-sm" title="在线" />
            </div>

            <div className="flex-1">
              <h1 className={`text-3xl font-bold ${theme.text} mb-2 ${currentTheme === 'minimal' ? 'font-extralight tracking-wide' : ''}`}>
                {config.name}
              </h1>
              {config.slogan && (
                <p className={`${theme.textMuted} mb-4 font-medium italic`}>
                  {config.slogan}
                </p>
              )}
              <div className={`flex flex-wrap justify-center sm:justify-start gap-4 text-sm ${theme.textMuted}`}>
                {config.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} /> {config.location}
                  </div>
                )}
                {config.joinDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} /> 加入于 {config.joinDate}
                  </div>
                )}
                {config.email && (
                  <a href={`mailto:${config.email}`} className={`flex items-center gap-1.5 ${theme.accent} hover:underline`}>
                    <Mail size={16} /> {config.email}
                  </a>
                )}
              </div>
            </div>

            <div className="flex sm:flex-col gap-3">
              {config.github && (
                <a
                  href={config.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 ${theme.iconBg} rounded-xl ${theme.textMuted} ${theme.iconHover} transition-all shadow-sm`}
                >
                  <Github size={20} />
                </a>
              )}
              {config.twitter && (
                <a
                  href={config.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 ${theme.iconBg} rounded-xl ${theme.textMuted} ${theme.iconHover} transition-all shadow-sm`}
                >
                  <Twitter size={20} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 主体内容网格 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          {/* 左侧：简介与技能 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 关于我描述 */}
            {config.bio && (
              <section className={`${theme.cardBg} rounded-3xl p-8 border ${theme.border} shadow-sm`}>
                <h2 className={`text-xl font-bold ${theme.text} mb-4 flex items-center gap-2 ${currentTheme === 'minimal' ? 'font-light' : ''}`}>
                  <Heart size={20} className="text-red-500" /> 简介
                </h2>
                <div className={`${theme.textMuted} space-y-4 leading-relaxed text-sm whitespace-pre-line`}>
                  {config.bio}
                </div>
              </section>
            )}

            {/* 技术栈 */}
            {config.skills && config.skills.length > 0 && (
              <section className={`${theme.cardBg} rounded-3xl p-8 border ${theme.border} shadow-sm`}>
                <h2 className={`text-xl font-bold ${theme.text} mb-6 flex items-center gap-2 ${currentTheme === 'minimal' ? 'font-light' : ''}`}>
                  <Code2 size={20} className={theme.accent} /> 技术栈
                </h2>
                <div className="space-y-6">
                  {config.skills.map((category) => (
                    <div key={category.category}>
                      <div className="flex items-center gap-2 mb-3">
                        {iconMap[category.icon] || <Code2 className={theme.accent} />}
                        <span className={`font-bold text-sm ${theme.text}`}>
                          {category.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.items.map((item) => (
                          <span
                            key={item}
                            className={`px-3 py-1 ${theme.tagBg} ${theme.textMuted} rounded-lg text-xs border ${theme.tagBorder}`}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 历程时间轴 */}
            {config.timeline && config.timeline.length > 0 && (
              <section className={`${theme.cardBg} rounded-3xl p-8 border ${theme.border} shadow-sm`}>
                <h2 className={`text-xl font-bold ${theme.text} mb-8 flex items-center gap-2 ${currentTheme === 'minimal' ? 'font-light' : ''}`}>
                  <Calendar size={20} className="text-amber-500" /> 历程
                </h2>
                <div className={`space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b ${currentTheme === 'classic' ? 'before:from-amber-500 before:via-stone-300 dark:before:via-stone-700' : currentTheme === 'minimal' ? 'before:from-gray-400 before:via-gray-300 dark:before:via-gray-700' : 'before:from-violet-500 before:via-gray-300 dark:before:via-gray-700'} before:to-transparent`}>
                  {config.timeline.map((item, idx) => (
                    <div key={idx} className="relative flex items-start gap-6 group">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${theme.cardBg} border-2 ${theme.timelineAccent} z-10 transition-transform group-hover:scale-110`}>
                        {item.type === 'education' ? <GraduationCap size={18} /> : <Briefcase size={18} />}
                      </div>
                      <div className="flex-1">
                        <time className={`block text-xs font-bold ${theme.timelineAccent} uppercase tracking-wider mb-1`}>
                          {item.year}
                        </time>
                        <h3 className={`font-bold ${theme.text}`}>{item.title}</h3>
                        <p className={`text-xs font-medium ${theme.textMuted} mb-2`}>{item.company}</p>
                        <p className={`text-sm ${theme.textMuted}`}>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* 右侧：兴趣与其他 */}
          <div className="space-y-8">
            {/* 兴趣爱好 */}
            {config.hobbies && config.hobbies.length > 0 && (
              <section className={`${theme.cardBg} rounded-3xl p-8 border ${theme.border} shadow-sm`}>
                <h2 className={`text-xl font-bold ${theme.text} mb-6 ${currentTheme === 'minimal' ? 'font-light' : ''}`}>兴趣爱好</h2>
                <div className="space-y-4">
                  {config.hobbies.map((hobby, idx) => (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className={`p-2.5 rounded-xl ${getHobbyColor(hobby.icon, currentTheme)}`}>
                        {iconMap[hobby.icon] || <Heart size={20} />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${theme.text}`}>{hobby.name}</h4>
                        <p className={`text-xs ${theme.textMuted}`}>{hobby.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 状态统计 */}
            {config.stats && config.stats.length > 0 && (
              <section className={`${theme.statsBg} rounded-3xl p-8 text-white shadow-lg ${theme.statsShadow}`}>
                <h2 className="text-lg font-bold mb-6">数字足迹</h2>
                <div className="grid grid-cols-2 gap-4">
                  {config.stats.map((stat, idx) => (
                    <div key={idx} className="text-center p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                      <div className="text-2xl font-black">{stat.value}</div>
                      <div className="text-[10px] uppercase opacity-70 tracking-widest">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 留言邀请 */}
            <div className={`p-8 ${theme.ctaBg} rounded-3xl border ${theme.ctaBorder} text-center`}>
              <h3 className="text-white font-bold mb-2">想和我聊聊？</h3>
              <p className={`${currentTheme === 'minimal' ? 'text-gray-400' : 'text-gray-400'} text-xs mb-4`}>无论是技术探讨还是闲聊，都欢迎你的来信。</p>
              {config.email ? (
                <a
                  href={`mailto:${config.email}`}
                  className={`block w-full py-2.5 ${theme.ctaButton} text-white rounded-xl text-sm font-bold transition-colors`}
                >
                  发送邮件
                </a>
              ) : (
                <button className={`w-full py-2.5 ${theme.ctaButton} text-white rounded-xl text-sm font-bold transition-colors`}>
                  联系我
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
