import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import StaticPageView from './staticpage';
import ProfileDetailPage from './page-client';

interface Props {
  params: { slug: string };
}

export default async function PageWrapper({ params }: Props) {
  const { slug } = params;
  const path = `/${slug}`;

  // First, check if it's a StaticPage (landing page)
  const staticPage = await prisma.staticPage.findUnique({
    where: { path },
    select: { id: true, published: true },
  });

  if (staticPage) {
    // If published, show the static page
    if (staticPage.published) {
      return <StaticPageView params={params} />;
    }
    // If unpublished, return 404
    notFound();
  }

  // Otherwise, show the profile page (client component)
  return <ProfileDetailPage />;
}
