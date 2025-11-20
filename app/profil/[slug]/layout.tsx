import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getCurrentDomain, getProfileCanonical, type Domain } from '@/lib/domain-utils';

interface Props {
  params: { slug: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const domain = getCurrentDomain(); // Get domain from environment

  try {
    // Fetch profile from database with SEO data
    const profile = await prisma.profile.findUnique({
      where: {
        slug_domain: {
          slug,
          domain
        }
      },
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

    if (!profile) {
      return {
        title: 'Profil nenalezen | Erosko.cz',
        description: 'Tento profil neexistuje nebo byl odstraněn.',
      };
    }

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
        canonical: getProfileCanonical(slug, domain as Domain),
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Erosko.cz - Premium escort služby',
      description: 'Najděte ty nejlepší escort služby v České republice.',
    };
  }
}

export default function ProfilLayout({ children }: Props) {
  return <>{children}</>;
}
