import type { Metadata } from 'next';
import { getArticles, getPublicSettings } from '@/lib/api-server';
import { HomeClient } from './home-client';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  return {
    title: settings?.siteName || 'NextBlog',
    description: settings?.siteDescription || '下一个博客，记录精彩生活',
    keywords: settings?.siteKeywords,
  };
}

interface HomePageProps {
  searchParams: { page?: string; category?: string; tag?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const page = Number(searchParams.page) || 1;
  const categoryId = searchParams.category;
  const tagId = searchParams.tag;
  
  const articlesData = await getArticles({ 
    page, 
    limit: 10,
    categoryId,
    tagId,
  });

  return (
    <HomeClient 
      articles={articlesData?.items || []} 
      total={articlesData?.total || 0}
      page={page}
      categoryId={categoryId}
      tagId={tagId}
    />
  );
}
