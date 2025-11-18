import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ profiles: [] });
    }

    const profiles = await prisma.profile.findMany({
      where: {
        id: { in: ids },
        approved: true,
      },
      include: {
        photos: {
          take: 1,
          where: { isMain: true },
          orderBy: { order: 'asc' },
        },
      },
      take: 50, // Limit to prevent abuse
    });

    return NextResponse.json({ profiles });
  } catch (error: any) {
    console.error('Error fetching profiles by IDs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}
