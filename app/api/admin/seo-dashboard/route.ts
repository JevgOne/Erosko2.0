import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/seo-dashboard
 *
 * Returns SEO statistics and profile list for SEO Master dashboard
 */
export async function GET(request: Request) {
  try {
    // Check authentication and admin role
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (adjust based on your auth system)
    // For now, allow all authenticated users - you can add role check here
    // if (session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    // Status filter
    if (status === 'missing') {
      where.seoTitle = null;
    } else if (status === 'low-quality') {
      where.AND = [
        { seoTitle: { not: null } },
        { seoQualityScore: { lt: 70 } },
      ];
    } else if (status === 'needs-review') {
      where.AND = [
        { seoTitle: { not: null } },
        { seoLastReviewed: null },
      ];
    }

    // Fetch profiles with SEO data
    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          age: true,
          city: true,
          category: true,
          verified: true,
          rating: true,
          viewCount: true,
          seoTitle: true,
          seoDescriptionA: true,
          seoDescriptionB: true,
          seoDescriptionC: true,
          seoKeywords: true,
          seoQualityScore: true,
          seoActiveVariant: true,
          seoVariantStats: true,
          seoLastGenerated: true,
          seoLastReviewed: true,
          seoManualOverride: true,
          ogImageUrl: true,
          createdAt: true,
          photos: {
            select: {
              id: true,
              alt: true,
              altQualityScore: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.profile.count({ where }),
    ]);

    // Calculate statistics
    const stats = await calculateSEOStats();

    return NextResponse.json({
      success: true,
      data: {
        profiles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats,
      },
    });
  } catch (error: any) {
    console.error('SEO Dashboard API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch SEO data' },
      { status: 500 }
    );
  }
}

/**
 * Calculate SEO statistics
 */
async function calculateSEOStats() {
  const [
    totalProfiles,
    profilesWithSEO,
    avgQualityScore,
    needsReview,
    lowQuality,
    avgPhotosAltQuality,
  ] = await Promise.all([
    // Total profiles
    prisma.profile.count(),

    // Profiles with SEO
    prisma.profile.count({
      where: { seoTitle: { not: null } },
    }),

    // Average quality score
    prisma.profile.aggregate({
      where: { seoQualityScore: { not: null } },
      _avg: { seoQualityScore: true },
    }),

    // Needs review
    prisma.profile.count({
      where: {
        AND: [{ seoTitle: { not: null } }, { seoLastReviewed: null }],
      },
    }),

    // Low quality (< 70)
    prisma.profile.count({
      where: {
        AND: [{ seoTitle: { not: null } }, { seoQualityScore: { lt: 70 } }],
      },
    }),

    // Average photo ALT quality
    prisma.photo.aggregate({
      where: { altQualityScore: { not: null } },
      _avg: { altQualityScore: true },
    }),
  ]);

  return {
    totalProfiles,
    profilesWithSEO,
    coveragePercent: totalProfiles > 0 ? Math.round((profilesWithSEO / totalProfiles) * 100) : 0,
    avgQualityScore: Math.round(avgQualityScore._avg.seoQualityScore || 0),
    needsReview,
    lowQuality,
    avgPhotosAltQuality: Math.round(avgPhotosAltQuality._avg.altQualityScore || 0),
  };
}
