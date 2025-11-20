import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { getCurrentDomain, getBaseUrl, type Domain } from '@/lib/domain-utils';

/**
 * Domain-aware sitemap generator
 *
 * Generates separate sitemaps for each domain:
 * - erosko.cz/sitemap.xml → Czech URLs, profiles with domain=null or domain=erosko.cz
 * - nhescort.com/sitemap.xml → English URLs, profiles with domain=null or domain=nhescort.com
 *
 * Profiles/businesses with domain=null are included in BOTH sitemaps (backward compatibility)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Detect current domain from request headers
  const domain = getCurrentDomain();
  const baseUrl = getBaseUrl(domain);

  try {
    // Get all approved profiles for this domain
    // If profile.domain is NULL, include it (backward compatibility)
    // If profile.domain matches current domain, include it
    const profiles = await prisma.profile.findMany({
      where: {
        approved: true,
        OR: [
          { domain: null },           // Profiles without domain (legacy)
          { domain: domain }          // Profiles for this domain
        ]
      },
      select: { slug: true, updatedAt: true, domain: true },
    });

    // Get all approved businesses for this domain
    const businesses = await prisma.business.findMany({
      where: {
        approved: true,
        OR: [
          { domain: null },           // Businesses without domain (legacy)
          { domain: domain }          // Businesses for this domain
        ]
      },
      select: { slug: true, updatedAt: true, domain: true },
    });

    // Define category pages per domain
    const categoryPages = domain === 'nhescort.com'
      ? [
          // NHescort.com category pages (English URLs)
          { path: '/escorts', priority: 0.9 },
          { path: '/erotic-massage', priority: 0.9 },
          { path: '/bdsm', priority: 0.8 },
          { path: '/search', priority: 0.7 },
          { path: '/register', priority: 0.5 },
          { path: '/login', priority: 0.5 },
        ]
      : [
          // Erosko.cz category pages (Czech URLs)
          { path: '/holky-na-sex', priority: 0.9 },
          { path: '/eroticke-masaze', priority: 0.9 },
          { path: '/bdsm', priority: 0.8 },
          { path: '/search', priority: 0.7 },
          { path: '/registrace', priority: 0.5 },
          { path: '/prihlaseni', priority: 0.5 },
        ];

    return [
      // Home page
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      // Category pages (domain-specific)
      ...categoryPages.map(page => ({
        url: `${baseUrl}${page.path}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: page.priority,
      })),
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
