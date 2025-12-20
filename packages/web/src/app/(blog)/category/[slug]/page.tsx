import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategories, getArticles, getPublicSettings } from '@/lib/api-server';
import { CategoryClient } from './category-client';

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

// 查找分类（支持 slug 或 id）
async function findCategory(slug: string) {
  const categories = await getCategories();
  if (!categories) return null;
  
  // 先按 slug 查找
  let category = categories.find((c: any) => c.slug === slug);
  // 如果没找到，按 id 查找（兼容旧链接）
  if (!category) {
    category = categories.find((c: any) => c.id === slug);
  }
  return category;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const [category, settings] = await Promise.all([
    findCategory(params.slug),
    getPublicSettings(),
  ]);

  if (!category) {
    return { title: '分类不存在' };
  }

  const siteName = settings?.siteName || 'NextBlog';

  return {
    title: `${category.name} - ${siteName}`,
    description: `${category.name} 分类下的所有文章`,
  };
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories?.map((category: any) => ({
    slug: category.slug,
  })) || [];
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const page = Number(searchParams.page) || 1;
  const category = await findCategory(params.slug);

  if (!category) {
    notFound();
  }

  const articlesData = await getArticles({ 
    page, 
    limit: 10, 
    categoryId: category.id 
  });

  return (
    <CategoryClient 
      category={category}
      articles={articlesData?.items || []}
      total={articlesData?.total || 0}
      page={page}
    />
  );
}
