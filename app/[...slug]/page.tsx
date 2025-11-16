import LandingPageLoader, { getLandingPageMetadata } from '@/components/LandingPageLoader';
import { Metadata } from 'next';

interface PageProps {
  params: {
    slug: string[];
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const path = `/${params.slug.join('/')}`;
  return getLandingPageMetadata(path);
}

export default async function DynamicLandingPage({ params }: PageProps) {
  const path = `/${params.slug.join('/')}`;
  return <LandingPageLoader path={path} />;
}
