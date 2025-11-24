import { Metadata } from 'next';
import prisma from '@/lib/prisma';

interface Props {
  params: { slug: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;

  try {
    // Fetch business from database with SEO data
    const business = await prisma.business.findUnique({
      where: { slug },
      select: {
        name: true,
        city: true,
        description: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        ogImageUrl: true,
        photos: {
          where: { isMain: true },
          select: { url: true },
          take: 1,
        },
      },
    });

    if (!business) {
      return {
        title: 'Podnik nenalezen | Erosko.cz',
        description: 'Tento podnik neexistuje nebo byl odstraněn.',
      };
    }

    // Fallback values if SEO data not generated yet
    const title = business.seoTitle || `${business.name} - ${business.city} | Erosko.cz`;
    const description =
      business.seoDescription ||
      business.description ||
      `${business.name} v ${business.city}. Ověřený erotický podnik s recenzemi.`;

    // Get main photo for OG image
    const ogImage = business.ogImageUrl || business.photos[0]?.url || '/default-og-image.jpg';

    return {
      title,
      description,
      keywords: business.seoKeywords || `erotický salon ${business.city}, ${business.name}, erotické služby ${business.city}`,
      openGraph: {
        title,
        description,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${business.name} - ${business.city}`,
          },
        ],
        type: 'website',
        siteName: 'Erosko.cz',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
      alternates: {
        canonical: `https://www.erosko.cz/podnik/${slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Erosko.cz - Erotické podniky',
      description: 'Najděte ty nejlepší erotické podniky v České republice.',
    };
  }
}

export default function PodnikLayout({ children }: Props) {
  return <>{children}</>;
}
