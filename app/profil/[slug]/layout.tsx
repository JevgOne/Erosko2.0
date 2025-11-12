import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import {
  generateProfileMetaTitle,
  generateProfileMetaDescription,
  generateProfileKeywords,
  generateCanonicalUrl,
} from '@/lib/seo-utils';
import { Category } from '@prisma/client';

type Props = {
  params: { slug: string };
  children: React.ReactNode;
};

// Mapa kategorií pro SEO
const categoryMap: Record<Category, 'HOLKY_NA_SEX' | 'EROTICKE_MASERKY' | 'DOMINA' | 'DIGITALNI_SLUZBY' | 'EROTICKE_PODNIKY'> = {
  HOLKY_NA_SEX: 'HOLKY_NA_SEX',
  EROTICKE_MASERKY: 'EROTICKE_MASERKY',
  DOMINA: 'DOMINA',
  DIGITALNI_SLUZBY: 'DIGITALNI_SLUZBY',
  EROTICKE_PODNIKY: 'EROTICKE_PODNIKY' as any,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Najít profil podle slugu z databáze
  const profile = await prisma.profile.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      age: true,
      city: true,
      category: true,
      verified: true,
    }
  });

  // Fallback pokud profil není nalezen
  if (!profile) {
    return {
      title: 'Profil nenalezen | EROSKO.CZ',
      description: 'Tento profil neexistuje nebo byl odstraněn.',
    };
  }

  // Převod dat do formátu pro SEO utility
  const seoData = {
    name: profile.name,
    age: profile.age,
    city: profile.city,
    category: categoryMap[profile.category] || 'HOLKY_NA_SEX',
    verified: profile.verified,
    // Simulované služby - v produkci by se načítaly z databáze
    services: [],
  };

  // Generování SEO pomocí našich automatických funkcí
  const title = generateProfileMetaTitle(seoData);
  const description = generateProfileMetaDescription(seoData, 1);
  const keywords = generateProfileKeywords(seoData);
  const canonicalUrl = generateCanonicalUrl('profile', params.slug);

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'EROSKO.CZ',
      locale: 'cs_CZ',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function ProfilLayout({ children }: Props) {
  return <>{children}</>;
}
