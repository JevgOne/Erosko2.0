import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Fetch latest reviews (last 10)
    const latestReviews = await prisma.review.findMany({
      where: {
        profileId: { not: null },
        profile: { approved: true },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        profile: {
          select: {
            id: true,
            slug: true,
            name: true,
            city: true,
            photos: {
              take: 1,
              where: { isMain: true },
              select: { url: true },
            },
          },
        },
      },
    });

    // Fetch newest profiles (last 12)
    const newestProfiles = await prisma.profile.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: {
        photos: {
          take: 1,
          where: { isMain: true },
        },
        services: {
          include: { service: true },
          take: 3,
        },
      },
    });

    // Fetch most popular profiles (by view count)
    const popularProfiles = await prisma.profile.findMany({
      where: {
        approved: true,
        viewCount: { gt: 0 },
      },
      orderBy: { viewCount: 'desc' },
      take: 12,
      include: {
        photos: {
          take: 1,
          where: { isMain: true },
        },
        services: {
          include: { service: true },
          take: 3,
        },
      },
    });

    // Fetch statistics
    const stats = await prisma.$transaction([
      prisma.profile.count({ where: { approved: true } }),
      prisma.business.count({ where: { approved: true } }),
      prisma.review.count(),
      prisma.profile.aggregate({
        where: { approved: true },
        _sum: { viewCount: true },
      }),
    ]);

    return NextResponse.json({
      latestReviews: latestReviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        authorName: r.authorName || 'Anonym',
        createdAt: r.createdAt,
        profile: r.profile,
      })),
      newestProfiles,
      popularProfiles,
      stats: {
        totalProfiles: stats[0],
        totalBusinesses: stats[1],
        totalReviews: stats[2],
        totalViews: stats[3]._sum.viewCount || 0,
      },
    });
  } catch (error) {
    console.error('Homepage API error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
