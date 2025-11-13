import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '18');
    const skip = (page - 1) * limit;

    const where: any = {
      approved: true, // Only show approved businesses to public
    };

    if (city) {
      where.city = city;
    }

    if (type) {
      where.profileType = type;
    }

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        include: {
          photos: true,
          profiles: {
            take: 3, // Show first 3 profiles for preview
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.business.count({ where }),
    ]);

    return NextResponse.json({
      businesses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Businesses fetch error:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání podniků' },
      { status: 500 }
    );
  }
}
