import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import MainPageEditor from '../../../components/MainPageEditor';

interface Props {
  params: { id: string };
}

export default async function EditMainPagePage({ params }: Props) {
  const { id } = params;

  const page = await prisma.staticPage.findUnique({
    where: { id },
  });

  if (!page) {
    notFound();
  }

  return (
    <MainPageEditor
      pageId={id}
      initialData={{
        path: page.path,
        type: page.type,
        seoTitle: page.seoTitle || '',
        seoDescription: page.seoDescription || '',
        h1: page.h1 || '',
        keywords: page.keywords || '',
        focusKeyword: page.focusKeyword || '',
        secondaryKeywords: page.secondaryKeywords || '',
        content: page.content || '',
        published: page.published,
        seoScore: page.seoScore || 0,
      }}
    />
  );
}
