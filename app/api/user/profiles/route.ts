import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

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

    // Najdi uživatele podle ID (phone-based auth)
    console.log('🔍 Fetching data for user ID:', session.user.id);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profiles: {
          orderBy: { createdAt: 'desc' },
        },
        businesses: {
          orderBy: { createdAt: 'desc' },
          include: {
            photos: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!user) {
      console.log('❌ User not found:', session.user.id);
      return NextResponse.json(
        { error: 'Uživatel nenalezen' },
        { status: 404 }
      );
    }

    console.log('✅ Found user:', user.phone);
    console.log('📊 Profiles:', user.profiles.length);
    console.log('🏢 Businesses:', user.businesses.length);
    if (user.businesses.length > 0) {
      console.log('🏢 Business names:', user.businesses.map(b => b.name).join(', '));
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
