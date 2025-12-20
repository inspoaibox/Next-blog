import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTags, getArticles, getPublicSettings } from '@/lib/api-server';
import { TagClient } from './tag-client';

interface TagPageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

async function findTag(slug: string) {
  const tags = await getTags();
  if (!tags) return null;
  return tags.find((t: any) => t.slug === slug || t.id === slug);
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const [tag, settings] = await Promise.all([
    findTag(params.slug),
    getPublicSettings(),
  ]);

  if (!tag) {
    return { title: '标签不存在' };
  }

  const siteName = settings?.siteName || 'NextBlog';

  return {
    title: `${tag.name} - ${siteName}`,
    description: `标签 ${tag.name} 下的所有文章`,
  };
}

export async function generateStaticParams() {
  const tags = await getTags();
  return tags?.map((tag: any) => ({
    slug: tag.slug,
  })) || [];
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const page = Number(searchParams.page) || 1;
  const tag = await findTag(params.slug);

  if (!tag) {
    notFound();
  }

  const articlesData = await getArticles({ 
    page, 
    limit: 10, 
    tagId: tag.id 
  });

  return (
    <TagClient 
      tag={tag}
      articles={articlesData?.items || []}
      total={articlesData?.total || 0}
      page={page}
    />
  );
}
