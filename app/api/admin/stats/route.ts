import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Nepřihlášen' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Nemáte oprávnění' },
        { status: 403 }
      );
    }

    // Get all statistics
    const [
      totalUsers,
      totalBusinesses,
      totalProfiles,
      pendingBusinesses,
      pendingProfiles,
      recentUsers,
      recentBusinesses,
      recentProfiles,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.profile.count(),
      prisma.business.count({ where: { verified: false } }),
      prisma.profile.count({ where: { verified: false } }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
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
              email: true,
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

    return NextResponse.json({
      stats: {
        totalUsers,
        totalBusinesses,
        totalProfiles,
        pendingBusinesses,
        pendingProfiles,
      },
      recentUsers,
      recentBusinesses,
      recentProfiles,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání admin dat' },
      { status: 500 }
    );
  }
}
