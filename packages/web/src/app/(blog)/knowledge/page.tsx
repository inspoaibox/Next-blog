import type { Metadata } from 'next';
import { getKnowledgeDocs, getPublicSettings } from '@/lib/api-server';
import { KnowledgeClient } from './knowledge-client';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const siteName = settings?.siteName || 'NextBlog';

  return {
    title: `知识库 - ${siteName}`,
    description: '浏览知识库文档',
  };
}

export default async function KnowledgePage() {
  const docs = await getKnowledgeDocs();

  return <KnowledgeClient docs={docs || []} />;
}
