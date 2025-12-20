import type { Metadata } from 'next';
import { getCategories, getPublicSettings } from '@/lib/api-server';
import { CategoriesClient } from './categories-client';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  return {
    title: `分类 - ${settings?.siteName || 'NextBlog'}`,
    description: '浏览所有文章分类',
  };
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return <CategoriesClient categories={categories || []} />;
}
