import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    console.log('[API /admin/stats] Request received');
    console.log('[API /admin/stats] Environment check:', {
      hasDbUrl: !!process.env.DATABASE_URL,
      hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
      hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      nodeEnv: process.env.NODE_ENV,
    });

    const session = await auth();
    console.log('[API /admin/stats] Session:', session ? { userId: session.user?.id, role: session.user?.role } : null);

    if (!session || !session.user) {
      console.log('[API /admin/stats] No session or user');
      return NextResponse.json(
        { error: 'Nepřihlášen' },
        { status: 401 }
      );
    }

    console.log('[API /admin/stats] Checking user in database:', session.user.id);

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    console.log('[API /admin/stats] User found:', user ? { id: user.id, role: user.role } : null);

    if (!user || user.role !== UserRole.ADMIN) {
      console.log('[API /admin/stats] User is not admin');
      return NextResponse.json(
        { error: 'Nemáte oprávnění' },
        { status: 403 }
      );
    }

    console.log('[API /admin/stats] Fetching statistics...');

    // Get all statistics
    const [
      totalUsers,
      totalBusinesses,
      totalProfiles,
      approvedBusinesses,
      approvedProfiles,
      verifiedBusinesses,
      verifiedProfiles,
      pendingApprovalBusinesses,
      pendingApprovalProfiles,
      pendingVerificationBusinesses,
      pendingVerificationProfiles,
      totalReviews,
      pendingChanges,
      recentUsers,
      recentBusinesses,
      recentProfiles,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.profile.count(),
      prisma.business.count({ where: { approved: true } }),
      prisma.profile.count({ where: { approved: true } }),
      prisma.business.count({ where: { verified: true } }),
      prisma.profile.count({ where: { verified: true } }),
      prisma.business.count({ where: { approved: false } }),
      prisma.profile.count({ where: { approved: false } }),
      prisma.business.count({ where: { approved: true, verified: false } }),
      prisma.profile.count({ where: { approved: true, verified: false } }),
      prisma.review.count(),
      prisma.pendingChange.count({ where: { status: 'PENDING' } }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phone: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              businesses: true,
              profiles: true,
            },
          },
        },
      }),
      prisma.business.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              phone: true,
              email: true,
            },
          },
          _count: {
            select: {
              profiles: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.profile.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              phone: true,
              email: true,
            },
          },
          business: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    console.log('[API /admin/stats] Statistics fetched successfully');

    return NextResponse.json({
      stats: {
        totalUsers,
        totalBusinesses,
        totalProfiles,
        approvedBusinesses,
        approvedProfiles,
        verifiedBusinesses,
        verifiedProfiles,
        pendingApprovalBusinesses,
        pendingApprovalProfiles,
        pendingVerificationBusinesses,
        pendingVerificationProfiles,
        totalReviews,
        pendingChanges,
      },
      recentUsers,
      recentBusinesses,
      recentProfiles,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'no stack');
    return NextResponse.json(
      {
        error: 'Chyba při načítání admin dat',
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}
