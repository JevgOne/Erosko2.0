import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import LandingPageEditor from '../../components/LandingPageEditor';

interface Props {
  params: { id: string };
}

export default async function EditLandingPage({ params }: Props) {
  const { id } = params;

  const page = await prisma.staticPage.findUnique({
    where: { id },
  });

  if (!page) {
    notFound();
  }

  return (
    <LandingPageEditor
      pageId={id}
      initialData={{
        path: page.path,
        type: page.type,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        h1: page.h1,
        content: page.content || '',
        keywords: page.keywords || '',
        focusKeyword: page.focusKeyword || '',
        secondaryKeywords: page.secondaryKeywords || '',
        published: page.published,
      }}
    />
  );
}
