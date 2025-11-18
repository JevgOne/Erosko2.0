import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();

    // If not logged in, return false
    if (!session?.user?.id) {
      return NextResponse.json({ isFavorite: false });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_profileId: {
          userId: session.user.id,
          profileId,
        },
      },
    });

    return NextResponse.json({ isFavorite: !!favorite });
  } catch (error: any) {
    console.error('Error checking favorite:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check favorite' },
      { status: 500 }
    );
  }
}
