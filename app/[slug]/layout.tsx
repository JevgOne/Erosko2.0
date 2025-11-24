import { Metadata } from 'next';
import prisma from '@/lib/prisma';

type Props = {
  params: { slug: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;

  try {
    // First try to find as a profile
    const profile = await prisma.profile.findUnique({
      where: { slug },
      select: {
        name: true,
        city: true,
        age: true,
        seoTitle: true,
        seoDescriptionA: true,
        seoDescriptionB: true,
        seoDescriptionC: true,
        seoActiveVariant: true,
        seoKeywords: true,
        ogImageUrl: true,
        photos: {
          where: { isMain: true },
          select: { url: true },
          take: 1,
        },
      },
    });

    if (profile) {
      // Select active SEO description variant
      let seoDescription = profile.seoDescriptionA;
      if (profile.seoActiveVariant === 'B') {
        seoDescription = profile.seoDescriptionB;
      } else if (profile.seoActiveVariant === 'C') {
        seoDescription = profile.seoDescriptionC;
      }

      // Fallback values if SEO data not generated yet
      const title = profile.seoTitle || `${profile.name} (${profile.age}) - ${profile.city} | Erosko.cz`;
      const description =
        seoDescription ||
        `Profil ${profile.name}, ${profile.age} let, ${profile.city}. Ověřený escort profil s recenzemi.`;

      // Get main photo for OG image
      const ogImage = profile.ogImageUrl || profile.photos[0]?.url || '/default-og-image.jpg';

      return {
        title,
        description,
        keywords: profile.seoKeywords || `escort ${profile.city}, ${profile.name}, erotické služby ${profile.city}`,
        openGraph: {
          title,
          description,
          images: [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: `${profile.name} - ${profile.city}`,
            },
          ],
          type: 'profile',
          siteName: 'Erosko.cz',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [ogImage],
        },
        alternates: {
          canonical: `https://www.erosko.cz/${slug}`,
        },
      };
    }

    // If not a profile, try to find as a business
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

    if (business) {
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
          canonical: `https://www.erosko.cz/${slug}`,
        },
      };
    }

    // Not found
    return {
      title: 'Profil nenalezen | Erosko.cz',
      description: 'Tento profil nebo podnik neexistuje nebo byl odstraněn.',
    };
  } catch (error) {
    console.error('Error generating metadata for slug:', slug, error);
    return {
      title: 'Erosko.cz',
      description: 'Najděte ty nejlepší erotické služby v České republice.',
    };
  }
}

export default function ProfilLayout({ children }: Props) {
  return <>{children}</>;
}
