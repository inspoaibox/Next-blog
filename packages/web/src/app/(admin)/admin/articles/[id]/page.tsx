'use client';

import { useParams } from 'next/navigation';
import { ArticleEditorPage } from '@/views/admin/ArticleEditor';

export default function EditArticle() {
  const params = useParams();
  const articleId = params?.id as string | undefined;
  return <ArticleEditorPage articleId={articleId} />;
}
