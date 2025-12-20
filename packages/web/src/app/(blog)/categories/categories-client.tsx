'use client';

import { useThemeContext } from '@/contexts/theme-context';

interface CategoriesClientProps {
  categories: any[];
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const { theme, themeConfig } = useThemeContext();
  const { CategoryList } = theme;

  return <CategoryList categories={categories} config={themeConfig} />;
}
