import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageBySlug, getPublicSettings } from '@/lib/api-server';
import { PageClient } from './page-client';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    getPageBySlug(params.slug),
    getPublicSettings(),
  ]);

  if (!page) {
    return { title: '页面不存在' };
  }

  const siteName = settings?.siteName || 'NextBlog';

  return {
    title: `${page.title} - ${siteName}`,
    description: page.content?.substring(0, 160),
  };
}

export default async function StaticPage({ params }: PageProps) {
  const page = await getPageBySlug(params.slug);

  if (!page) {
    notFound();
  }

  return <PageClient page={page} />;
}
