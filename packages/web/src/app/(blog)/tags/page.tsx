import type { Metadata } from 'next';
import { getTags, getPublicSettings } from '@/lib/api-server';
import { TagsClient } from './tags-client';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const siteName = settings?.siteName || 'NextBlog';

  return {
    title: `标签云 - ${siteName}`,
    description: '浏览所有文章标签',
  };
}

export default async function TagsPage() {
  const tags = await getTags();

  return <TagsClient tags={tags || []} />;
}
