import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getCurrentDomain, getBusinessCanonical, getDomainName } from '@/lib/domain-utils';

interface Props {
  params: { slug: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;

  // Get current domain from request headers
  const domain = getCurrentDomain();
  const siteName = getDomainName(domain);

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
        title: `Podnik nenalezen | ${siteName}`,
        description: 'Tento podnik neexistuje nebo byl odstraněn.',
      };
    }

    // Fallback values if SEO data not generated yet (domain-aware)
    const defaultTitle = domain === 'nhescort.com'
      ? `${business.name} - ${business.city} | ${siteName}`
      : `${business.name} - ${business.city} | ${siteName}`;

    const defaultDescription = domain === 'nhescort.com'
      ? `${business.name} in ${business.city}. Verified adult business with reviews.`
      : `${business.name} v ${business.city}. Ověřený erotický podnik s recenzemi.`;

    const title = business.seoTitle || defaultTitle;
    const description =
      business.seoDescription ||
      business.description ||
      defaultDescription;

    // Get main photo for OG image
    const ogImage = business.ogImageUrl || business.photos[0]?.url || '/default-og-image.jpg';

    // Generate canonical URL for current domain
    const canonical = getBusinessCanonical(slug, domain);

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
        siteName,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
      alternates: {
        canonical,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: `${siteName} - Erotické podniky`,
      description: 'Najděte ty nejlepší erotické podniky v České republice.',
    };
  }
}

export default function PodnikLayout({ children }: Props) {
  return <>{children}</>;
}
