// 共享的网站 Logo 组件
import Link from 'next/link';

interface SiteLogoProps {
  siteName: string;
  siteLogo?: string | null;
  className?: string;
  logoClassName?: string;
  textClassName?: string;
  showText?: boolean;
  fallbackIcon?: string;
}

export function SiteLogo({
  siteName,
  siteLogo,
  className = '',
  logoClassName = 'h-8 w-auto',
  textClassName = 'text-xl font-bold',
  showText = true,
  fallbackIcon,
}: SiteLogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      {siteLogo ? (
        <img
          src={siteLogo}
          alt={siteName}
          className={logoClassName}
          onError={(e) => {
            // 图片加载失败时隐藏
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : fallbackIcon ? (
        <span className={logoClassName}>{fallbackIcon}</span>
      ) : null}
      {showText && <span className={textClassName}>{siteName}</span>}
    </Link>
  );
}
