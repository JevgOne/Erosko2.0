import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Nepřihlášen' },
        { status: 401 }
      );
    }

    // Najdi uživatele podle emailu
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profiles: {
          orderBy: { createdAt: 'desc' },
        },
        businesses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Uživatel nenalezen' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profiles: user.profiles || [],
      businesses: user.businesses || [],
    });
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání profilů' },
      { status: 500 }
    );
  }
}
