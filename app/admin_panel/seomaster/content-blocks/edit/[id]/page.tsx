import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ContentBlockEditor from '../../../components/ContentBlockEditor';

interface Props {
  params: { id: string };
}

export default async function EditContentBlockPage({ params }: Props) {
  const { id } = params;

  const block = await prisma.contentBlock.findUnique({
    where: { id },
  });

  if (!block) {
    notFound();
  }

  return (
    <ContentBlockEditor
      blockId={id}
      initialData={{
        identifier: block.identifier,
        type: block.type as any,
        title: block.title || '',
        content: block.content || '',
        data: block.data || '',
        page: block.page,
        section: block.section || '',
        published: block.published,
        order: block.order,
      }}
    />
  );
}
