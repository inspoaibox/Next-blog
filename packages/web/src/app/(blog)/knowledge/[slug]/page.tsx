import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getKnowledgeDocBySlug, getPublicSettings } from '@/lib/api-server';
import { KnowledgeDocClient } from './doc-client';

interface KnowledgeDocPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: KnowledgeDocPageProps): Promise<Metadata> {
  const [doc, settings] = await Promise.all([
    getKnowledgeDocBySlug(params.slug),
    getPublicSettings(),
  ]);

  if (!doc) {
    return { title: '文档不存在' };
  }

  const siteName = settings?.siteName || 'NextBlog';

  return {
    title: `${doc.title} - 知识库 - ${siteName}`,
    description: doc.content?.substring(0, 160),
  };
}

export default async function KnowledgeDocPage({ params }: KnowledgeDocPageProps) {
  const doc = await getKnowledgeDocBySlug(params.slug);

  if (!doc) {
    notFound();
  }

  return <KnowledgeDocClient doc={doc} />;
}
