'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { AdminLayout } from '@/layouts/AdminLayout';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, checkAuth, isLoading, token } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  // 等待 zustand persist 恢复完成
  useEffect(() => {
    setHydrated(true);
  }, []);

  // 只有在 hydrated 后才检查认证
  useEffect(() => {
    if (hydrated) {
      checkAuth();
    }
  }, [hydrated, checkAuth]);

  useEffect(() => {
    // 只有在 hydrated 且不在加载中时才判断是否需要跳转
    if (hydrated && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, hydrated, router]);

  // 等待 hydration 和 loading 完成
  if (!hydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
