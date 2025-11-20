import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getCurrentDomain, getProfileCanonical, getDomainName } from '@/lib/domain-utils';

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
    // Fetch profile from database with SEO data
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

    if (!profile) {
      return {
        title: `Profil nenalezen | ${siteName}`,
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

    // Fallback values if SEO data not generated yet (domain-aware)
    const defaultTitle = domain === 'nhescort.com'
      ? `${profile.name} (${profile.age}) - ${profile.city} | ${siteName}`
      : `${profile.name} (${profile.age}) - ${profile.city} | ${siteName}`;

    const defaultDescription = domain === 'nhescort.com'
      ? `Profile of ${profile.name}, ${profile.age} years old, ${profile.city}. Verified escort profile with reviews.`
      : `Profil ${profile.name}, ${profile.age} let, ${profile.city}. Ověřený escort profil s recenzemi.`;

    const title = profile.seoTitle || defaultTitle;
    const description = seoDescription || defaultDescription;

    // Get main photo for OG image
    const ogImage = profile.ogImageUrl || profile.photos[0]?.url || '/default-og-image.jpg';

    // Generate canonical URL for current domain
    const canonical = getProfileCanonical(slug, domain);

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
      title: `${siteName} - Premium escort služby`,
      description: 'Najděte ty nejlepší escort služby v České republice.',
    };
  }
}

export default function ProfilLayout({ children }: Props) {
  return <>{children}</>;
}
