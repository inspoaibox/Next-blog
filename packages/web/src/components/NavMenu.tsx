import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { NavMenuItem } from '../stores/site-settings.store';

interface NavMenuProps {
  items: NavMenuItem[];
  className?: string;
  itemClassName?: string;
  dropdownClassName?: string;
}

// 桌面端导航菜单（支持三级下拉）
export function DesktopNavMenu({ items, className = '', itemClassName = '' }: NavMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      if (subCloseTimeoutRef.current) clearTimeout(subCloseTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = (id: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenDropdown(id);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
      setOpenSubDropdown(null);
    }, 150);
  };

  const handleSubMouseEnter = (id: string) => {
    if (subCloseTimeoutRef.current) {
      clearTimeout(subCloseTimeoutRef.current);
      subCloseTimeoutRef.current = null;
    }
    setOpenSubDropdown(id);
  };

  const handleSubMouseLeave = () => {
    subCloseTimeoutRef.current = setTimeout(() => {
      setOpenSubDropdown(null);
    }, 150);
  };

  const renderLink = (item: NavMenuItem) => {
    if (item.type === 'external') {
      return (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className={itemClassName}>
          {item.label}
        </a>
      );
    }
    return (
      <Link href={item.url} className={itemClassName}>
        {item.label}
      </Link>
    );
  };

  const renderDropdownItem = (child: NavMenuItem) => {
    const hasGrandChildren = child.children && child.children.length > 0;

    if (hasGrandChildren) {
      return (
        <div
          key={child.id}
          className="relative"
          onMouseEnter={() => handleSubMouseEnter(child.id)}
          onMouseLeave={handleSubMouseLeave}
        >
          {/* 二级菜单项：有子菜单时显示为可点击链接 + 展开箭头 */}
          <div className="flex items-center">
            {child.type === 'external' ? (
              <a
                href={child.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {child.label}
              </a>
            ) : (
              <Link
                href={child.url}
                className="flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {child.label}
              </Link>
            )}
            <span className="pr-3 text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
          {openSubDropdown === child.id && (
            <div 
              className="absolute left-full top-0 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[140px] z-50"
              style={{ marginLeft: '2px' }}
            >
              {child.children!.map((grandChild) => (
                <div key={grandChild.id}>
                  {grandChild.type === 'external' ? (
                    <a
                      href={grandChild.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {grandChild.label}
                    </a>
                  ) : (
                    <Link
                      href={grandChild.url}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {grandChild.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={child.id}>
        {child.type === 'external' ? (
          <a
            href={child.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {child.label}
          </a>
        ) : (
          <Link
            href={child.url}
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {child.label}
          </Link>
        )}
      </div>
    );
  };

  return (
    <nav className={`hidden md:flex items-center gap-1 ${className}`}>
      {items.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        
        if (hasChildren) {
          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => handleMouseEnter(item.id)}
              onMouseLeave={handleMouseLeave}
            >
              <button className={`${itemClassName} flex items-center gap-1`}>
                {item.label}
                <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === item.id && (
                <div 
                  className="absolute top-full left-0 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[140px] z-50"
                  style={{ marginTop: '4px' }}
                >
                  {item.children!.map((child) => renderDropdownItem(child))}
                </div>
              )}
            </div>
          );
        }

        return <div key={item.id}>{renderLink(item)}</div>;
      })}
    </nav>
  );
}

// 移动端导航菜单（支持三级展开）
export function MobileNavMenu({ items, onClose }: { items: NavMenuItem[]; onClose: () => void }) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const renderLink = (item: NavMenuItem, level: number = 0) => {
    const paddingClass = level === 0 ? 'pl-4' : level === 1 ? 'pl-8' : 'pl-12';
    const baseClass = `block px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${paddingClass}`;
    
    if (item.type === 'external') {
      return (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className={baseClass}
        >
          {item.label}
        </a>
      );
    }
    return (
      <Link href={item.url} onClick={onClose} className={baseClass}>
        {item.label}
      </Link>
    );
  };

  const renderMenuItem = (item: NavMenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const paddingClass = level === 0 ? 'pl-4' : level === 1 ? 'pl-8' : 'pl-12';

    return (
      <div key={item.id}>
        {hasChildren ? (
          <>
            <div className={`flex items-center ${paddingClass}`}>
              {/* 菜单项本身可点击跳转 */}
              {item.type === 'external' ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  href={item.url}
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              )}
              {/* 展开/收起按钮 */}
              <button
                onClick={() => toggleExpand(item.id)}
                className="px-4 py-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {isExpanded && (
              <div className="bg-gray-50 dark:bg-gray-900">
                {item.children!.map((child) => renderMenuItem(child, level + 1))}
              </div>
            )}
          </>
        ) : (
          renderLink(item, level)
        )}
      </div>
    );
  };

  return (
    <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {items.map((item) => renderMenuItem(item, 0))}
    </div>
  );
}
