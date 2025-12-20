'use client';

interface PageClientProps {
  page: {
    id: string;
    title: string;
    slug: string;
    content: string;
    htmlContent?: string;
  };
}

export function PageClient({ page }: PageClientProps) {
  return (
    <article className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{page.title}</h1>
      
      <div 
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: page.htmlContent || page.content }}
      />
    </article>
  );
}
