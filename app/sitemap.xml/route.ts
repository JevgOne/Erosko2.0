import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://erosko.cz';

    // Fetch all profiles
    const profiles = await prisma.profile.findMany({
      where: { approved: true },
      select: { slug: true, updatedAt: true },
    });

    // Fetch all businesses
    const businesses = await prisma.business.findMany({
      where: { approved: true },
      select: { slug: true, updatedAt: true },
    });

    // Fetch all static pages
    const staticPages = await prisma.staticPage.findMany({
      where: { published: true },
      select: { path: true, updatedAt: true },
    });

    // Build sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Profiles -->
${profiles
  .map(
    (profile) => `  <url>
    <loc>${baseUrl}/${profile.slug}</loc>
    <lastmod>${new Date(profile.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}

  <!-- Businesses -->
${businesses
  .map(
    (business) => `  <url>
    <loc>${baseUrl}/${business.slug}</loc>
    <lastmod>${new Date(business.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}

  <!-- Static Pages -->
${staticPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${new Date(page.updatedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
