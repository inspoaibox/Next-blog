import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getArticles, getPublicSettings } from '@/lib/api-server';
import { ArticleDetailClient } from './article-client';

interface ArticlePageProps {
  params: { slug: string };
}

// 动态生成 SEO 元数据
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const [article, settings] = await Promise.all([
    getArticleBySlug(params.slug),
    getPublicSettings(),
  ]);

  if (!article) {
    return { title: '文章不存在' };
  }

  const siteName = settings?.siteName || 'NextBlog';
  const siteUrl = settings?.siteUrl || '';
  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt || '';
  const tags = article.tags?.map((t: any) => t.tag?.name || t.name).filter(Boolean);

  return {
    title: `${title} - ${siteName}`,
    description,
    keywords: tags?.join(', '),
    authors: [{ name: article.author?.username || 'Admin' }],
    openGraph: {
      type: 'article',
      title,
      description,
      url: `${siteUrl}/article/${article.slug}`,
      siteName,
      images: article.featuredImage ? [{ url: article.featuredImage }] : [],
      publishedTime: article.publishedAt,
      section: article.category?.name,
      tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.featuredImage ? [article.featuredImage] : [],
    },
    alternates: {
      canonical: `${siteUrl}/article/${article.slug}`,
    },
  };
}

// 静态生成路径（ISR）
export async function generateStaticParams() {
  const data = await getArticles({ limit: 100 });
  return data?.items?.map((article: any) => ({
    slug: article.slug,
  })) || [];
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const [article, settings] = await Promise.all([
    getArticleBySlug(params.slug),
    getPublicSettings(),
  ]);

  if (!article) {
    notFound();
  }

  // JSON-LD 结构化数据
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || '',
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.author?.username || 'Admin',
    },
    publisher: {
      '@type': 'Organization',
      name: settings?.siteName || 'NextBlog',
    },
    image: article.featuredImage,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${settings?.siteUrl || ''}/article/${article.slug}`,
    },
  };

  return (
    <>
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleDetailClient article={article} />
    </>
  );
}
