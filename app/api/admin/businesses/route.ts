import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    console.log('[API /admin/businesses] Request received');
    console.log('[API /admin/businesses] Environment check:', {
      hasDbUrl: !!process.env.DATABASE_URL,
      hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
      hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      nodeEnv: process.env.NODE_ENV,
    });

    const session = await auth();
    console.log('[API /admin/businesses] Session:', session ? { userId: session.user?.id, role: session.user?.role } : null);

    if (!session || !session.user) {
      console.log('[API /admin/businesses] No session or user');
      return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
    }

    console.log('[API /admin/businesses] Checking user in database:', session.user.id);

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    console.log('[API /admin/businesses] User found:', user ? { id: user.id, role: user.role } : null);

    if (!user || user.role !== UserRole.ADMIN) {
      console.log('[API /admin/businesses] User is not admin');
      return NextResponse.json({ error: 'Nemáte oprávnění' }, { status: 403 });
    }

    console.log('[API /admin/businesses] Fetching businesses...');

    // First check total count
    const totalCount = await prisma.business.count();
    console.log('[API /admin/businesses] Total business count in DB:', totalCount);

    const businesses = await prisma.business.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
        owner: {
          select: {
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            profiles: true,
            reviews: true,
          },
        },
      },
    });

    console.log('[API /admin/businesses] Businesses fetched successfully, count:', businesses.length);

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error('[API /admin/businesses] Error fetching businesses:', error);
    console.error('[API /admin/businesses] Error details:', error instanceof Error ? error.message : String(error));
    console.error('[API /admin/businesses] Error stack:', error instanceof Error ? error.stack : 'no stack');
    return NextResponse.json(
      {
        error: 'Chyba při načítání podniků',
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}
