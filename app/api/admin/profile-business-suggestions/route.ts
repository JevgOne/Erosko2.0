import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Nemáte oprávnění' }, { status: 403 });
    }

    // Find all profiles WITHOUT businessId
    const orphanProfiles = await prisma.profile.findMany({
      where: {
        businessId: null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        city: true,
        category: true,
        createdAt: true,
      },
    });

    console.log('[Profile-Business Suggestions] Found orphan profiles:', orphanProfiles.length);

    // For each orphan profile, find matching businesses by phone
    const suggestions = [];

    for (const profile of orphanProfiles) {
      if (!profile.phone) continue;

      const matchingBusinesses = await prisma.business.findMany({
        where: {
          phone: profile.phone,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          city: true,
          profileType: true,
        },
      });

      if (matchingBusinesses.length > 0) {
        suggestions.push({
          profile: {
            id: profile.id,
            name: profile.name,
            phone: profile.phone,
            city: profile.city,
            category: profile.category,
            createdAt: profile.createdAt,
          },
          matchingBusinesses,
        });
      }
    }

    console.log('[Profile-Business Suggestions] Generated suggestions:', suggestions.length);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching profile-business suggestions:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání návrhů propojení' },
      { status: 500 }
    );
  }
}
