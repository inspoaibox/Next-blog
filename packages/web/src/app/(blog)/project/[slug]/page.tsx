import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProjectBySlug } from '@/lib/api-server';
import { ProjectDetailClient } from './project-detail-client';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    return { title: '项目未找到' };
  }

  return {
    title: project.name,
    description: project.description,
    openGraph: {
      title: project.name,
      description: project.description,
      images: project.featuredImage ? [project.featuredImage] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient project={project} />;
}
