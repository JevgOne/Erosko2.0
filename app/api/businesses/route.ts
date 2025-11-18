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
      // Normalize city name to match database format (capitalize first letter)
      const normalizedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
      where.city = normalizedCity;
    }

    if (type) {
      where.profileType = type;
    }

    // First, get businesses with profiles count for proper ordering
    const allBusinesses = await prisma.business.findMany({
      where,
      include: {
        photos: true,
        profiles: {
          take: 3, // Show first 3 profiles for preview
        },
        _count: {
          select: {
            profiles: true,
          },
        },
      },
    });

    // Sort: businesses WITH profiles first (by profile count DESC), then businesses WITHOUT profiles
    const sortedBusinesses = allBusinesses.sort((a, b) => {
      const aCount = a._count.profiles;
      const bCount = b._count.profiles;

      // Both have profiles - sort by count DESC
      if (aCount > 0 && bCount > 0) {
        return bCount - aCount;
      }

      // a has profiles, b doesn't - a comes first
      if (aCount > 0 && bCount === 0) {
        return -1;
      }

      // b has profiles, a doesn't - b comes first
      if (aCount === 0 && bCount > 0) {
        return 1;
      }

      // Neither has profiles - keep original order
      return 0;
    });

    // Apply pagination after sorting
    const total = sortedBusinesses.length;
    const businesses = sortedBusinesses.slice(skip, skip + limit);

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
