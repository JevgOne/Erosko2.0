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

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json({ error: 'Chyba při načítání podniků' }, { status: 500 });
  }
}
