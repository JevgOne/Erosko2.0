import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function GET() {
  try {
    console.log('[API /admin/profiles] Request received');
    const session = await auth();

    if (!session || !session.user) {
      console.log('[API /admin/profiles] No session or user');
      return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
    }

    console.log('[API /admin/profiles] Session user:', session.user.id);

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    console.log('[API /admin/profiles] User found:', user?.id, 'Role:', user?.role);

    if (!user || user.role !== UserRole.ADMIN) {
      console.log('[API /admin/profiles] User is not admin');
      return NextResponse.json({ error: 'Nemáte oprávnění' }, { status: 403 });
    }

    console.log('[API /admin/profiles] Fetching profiles...');
    // Fetch all profiles with owner and business info
    const profiles = await prisma.profile.findMany({
      include: {
        owner: {
          select: {
            email: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        photos: {
          orderBy: {
            order: 'asc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('[API /admin/profiles] Profiles fetched:', profiles.length);
    console.log('[API /admin/profiles] Sample profile:', profiles[0]?.id, profiles[0]?.name);

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('[API /admin/profiles] Error fetching profiles:', error);
    return NextResponse.json({ error: 'Chyba při načítání profilů' }, { status: 500 });
  }
}
