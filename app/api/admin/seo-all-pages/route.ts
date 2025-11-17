import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'all';
    const status = searchParams.get('status') || 'all';

    // Fetch all profiles
    const profiles = await prisma.profile.findMany({
      where: {
        approved: true,
        ...(search && {
          OR: [
            { name: { contains: search } },
            { city: { contains: search } },
          ],
        }),
      },
      select: {
        id: true,
        slug: true,
        name: true,
        age: true,
        city: true,
        profileType: true,
        seoTitle: true,
        seoQualityScore: true,
        viewCount: true,
        updatedAt: true,
      },
    });

    // Fetch all businesses
    const businesses = await prisma.business.findMany({
      where: {
        approved: true,
        ...(search && {
          OR: [
            { name: { contains: search } },
            { city: { contains: search } },
          ],
        }),
      },
      select: {
        id: true,
        slug: true,
        name: true,
        city: true,
        profileType: true,
        seoTitle: true,
        seoQualityScore: true,
        viewCount: true,
        updatedAt: true,
      },
    });

    // Fetch all landing pages
    const landingPages = await prisma.staticPage.findMany({
      where: {
        ...(search && {
          OR: [
            { path: { contains: search } },
            { seoTitle: { contains: search } },
          ],
        }),
      },
      select: {
        id: true,
        path: true,
        type: true,
        seoTitle: true,
        published: true,
        viewCount: true,
        updatedAt: true,
      },
    });

    // Hardcoded routes
    const hardcodedRoutes = [
      { path: '/', title: 'Erosko.cz - Homepage' },
      { path: '/holky-na-sex', title: 'Holky na sex' },
      { path: '/eroticke-masaze', title: 'Erotické masáže' },
      { path: '/bdsm-domina', title: 'BDSM Domina' },
      { path: '/online-sluzby', title: 'Online služby' },
      { path: '/eroticke-podniky', title: 'Erotické podniky' },
      { path: '/prihlaseni', title: 'Přihlášení' },
      { path: '/registrace', title: 'Registrace' },
    ];

    // Transform to common format
    const pages = [
      ...profiles.map((p) => ({
        id: p.id,
        path: `/${p.slug}`,
        type: 'profile' as const,
        title: p.seoTitle || `${p.name}, ${p.age} - ${p.city}`,
        description: null,
        hasSEO: !!p.seoTitle,
        qualityScore: p.seoQualityScore || null,
        viewCount: p.viewCount,
        lastUpdated: p.updatedAt.toISOString(),
        status: 'active' as const,
      })),
      ...businesses.map((b) => ({
        id: b.id,
        path: `/${b.slug}`,
        type: 'business' as const,
        title: b.seoTitle || `${b.name} - ${b.city}`,
        description: null,
        hasSEO: !!b.seoTitle,
        qualityScore: b.seoQualityScore || null,
        viewCount: b.viewCount,
        lastUpdated: b.updatedAt.toISOString(),
        status: 'active' as const,
      })),
      ...landingPages.map((lp) => ({
        id: lp.id,
        path: lp.path,
        type: 'landing-page' as const,
        title: lp.seoTitle || 'No title',
        description: null,
        hasSEO: !!lp.seoTitle,
        qualityScore: null,
        viewCount: lp.viewCount,
        lastUpdated: lp.updatedAt.toISOString(),
        status: lp.published ? ('published' as const) : ('draft' as const),
      })),
      ...hardcodedRoutes.map((hr) => ({
        id: `hardcoded-${hr.path}`,
        path: hr.path,
        type: 'hardcoded' as const,
        title: hr.title,
        description: null,
        hasSEO: true,
        qualityScore: null,
        viewCount: 0,
        lastUpdated: null,
        status: 'active' as const,
      })),
    ];

    // Filter by type
    let filteredPages = pages;
    if (type !== 'all') {
      filteredPages = pages.filter((p) => p.type === type);
    }

    // Filter by status
    if (status === 'with-seo') {
      filteredPages = filteredPages.filter((p) => p.hasSEO);
    } else if (status === 'without-seo') {
      filteredPages = filteredPages.filter((p) => !p.hasSEO);
    } else if (status === 'low-quality') {
      filteredPages = filteredPages.filter((p) => p.qualityScore && p.qualityScore < 70);
    }

    // Calculate stats
    const totalPages = filteredPages.length;
    const withSEO = filteredPages.filter((p) => p.hasSEO).length;
    const withoutSEO = totalPages - withSEO;
    const qualityScores = filteredPages
      .filter((p) => p.qualityScore !== null)
      .map((p) => p.qualityScore!);
    const avgQualityScore = qualityScores.length > 0
      ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length)
      : 0;

    const stats = {
      totalPages,
      withSEO,
      withoutSEO,
      avgQualityScore,
      profiles: profiles.length,
      businesses: businesses.length,
      landingPages: landingPages.length,
      hardcodedRoutes: hardcodedRoutes.length,
    };

    return NextResponse.json({
      success: true,
      data: {
        stats,
        pages: filteredPages,
      },
    });
  } catch (error: any) {
    console.error('SEO All Pages Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch all pages' },
      { status: 500 }
    );
  }
}
