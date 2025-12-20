import Link from 'next/link';
import { cn } from '../../lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  baseUrl?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  const getPageUrl = (page: number) => {
    if (!baseUrl) return '#';
    // 如果 baseUrl 已经包含查询参数（如 /?category=xxx&）
    if (baseUrl.includes('?')) {
      // 移除末尾的 & 如果存在
      const cleanUrl = baseUrl.endsWith('&') ? baseUrl.slice(0, -1) : baseUrl;
      return page === 1 ? cleanUrl : `${cleanUrl}&page=${page}`;
    }
    // 普通 URL
    return page === 1 ? baseUrl : `${baseUrl}?page=${page}`;
  };

  const handleClick = (page: number, e: React.MouseEvent) => {
    if (onPageChange) {
      e.preventDefault();
      onPageChange(page);
    }
  };

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="分页">
      {baseUrl ? (
        <Link
          href={currentPage === 1 ? '#' : getPageUrl(currentPage - 1)}
          onClick={(e) => currentPage === 1 ? e.preventDefault() : handleClick(currentPage - 1, e)}
          className={cn(
            'px-3 py-2 rounded-lg text-sm transition-colors',
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed pointer-events-none'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          aria-label="上一页"
        >
          ←
        </Link>
      ) : (
        <button
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'px-3 py-2 rounded-lg text-sm transition-colors',
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          aria-label="上一页"
        >
          ←
        </button>
      )}

      {pages.map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
            ...
          </span>
        ) : baseUrl ? (
          <Link
            key={page}
            href={getPageUrl(page as number)}
            onClick={(e) => handleClick(page as number, e)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm transition-colors',
              currentPage === page
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </Link>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange?.(page as number)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm transition-colors',
              currentPage === page
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        )
      ))}

      {baseUrl ? (
        <Link
          href={currentPage === totalPages ? '#' : getPageUrl(currentPage + 1)}
          onClick={(e) => currentPage === totalPages ? e.preventDefault() : handleClick(currentPage + 1, e)}
          className={cn(
            'px-3 py-2 rounded-lg text-sm transition-colors',
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed pointer-events-none'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          aria-label="下一页"
        >
          →
        </Link>
      ) : (
        <button
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'px-3 py-2 rounded-lg text-sm transition-colors',
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          aria-label="下一页"
        >
          →
        </button>
      )}
    </nav>
  );
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, 5, '...', total];
  }

  if (current >= total - 2) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}
