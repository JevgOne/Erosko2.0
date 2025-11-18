import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.erosko.cz';

  try {
    // Get all approved profiles
    const profiles = await prisma.profile.findMany({
      where: { approved: true },
      select: { slug: true, updatedAt: true },
    });

    // Get all approved businesses
    const businesses = await prisma.business.findMany({
      where: { approved: true },
      select: { slug: true, updatedAt: true },
    });

    return [
      // Home page
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      // Main category pages
      {
        url: `${baseUrl}/holky-na-sex`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/eroticke-masaze`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/bdsm`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/registrace`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/prihlaseni`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      // Profile pages
      ...profiles.map(p => ({
        url: `${baseUrl}/profil/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      // Business pages
      ...businesses.map(b => ({
        url: `${baseUrl}/podnik/${b.slug}`,
        lastModified: b.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return basic sitemap if database fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}
