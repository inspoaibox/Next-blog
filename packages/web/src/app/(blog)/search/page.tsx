import type { Metadata } from 'next';
import { getArticles, getPublicSettings } from '@/lib/api-server';
import { SearchClient } from './search-client';

interface SearchPageProps {
  searchParams: { q?: string; page?: string };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const settings = await getPublicSettings();
  const siteName = settings?.siteName || 'NextBlog';
  const query = searchParams.q;

  return {
    title: query ? `搜索：${query} - ${siteName}` : `搜索 - ${siteName}`,
    description: query ? `搜索 "${query}" 的结果` : '搜索文章',
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const page = Number(searchParams.page) || 1;

  let articlesData = null;
  if (query && query.length >= 2) {
    articlesData = await getArticles({ 
      page, 
      limit: 10, 
      search: query 
    });
  }

  return (
    <SearchClient 
      initialQuery={query}
      articles={articlesData?.items || []}
      total={articlesData?.total || 0}
      page={page}
    />
  );
}
