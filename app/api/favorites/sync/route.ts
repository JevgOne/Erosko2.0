import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profileIds } = await request.json();

    if (!profileIds || !Array.isArray(profileIds)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Get existing favorites
    const existing = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      select: { profileId: true },
    });

    const existingIds = existing.map((f) => f.profileId);
    const newIds = profileIds.filter((id) => !existingIds.includes(id));

    // Add new favorites from localStorage
    if (newIds.length > 0) {
      // Create favorites one by one to avoid duplicate errors
      for (const profileId of newIds) {
        try {
          await prisma.favorite.create({
            data: {
              userId: session.user.id,
              profileId,
            },
          });
        } catch (error) {
          // Ignore duplicate errors
          console.log(`Favorite already exists: ${profileId}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      synced: newIds.length,
      total: existingIds.length + newIds.length,
    });
  } catch (error: any) {
    console.error('Error syncing favorites:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync favorites' },
      { status: 500 }
    );
  }
}
