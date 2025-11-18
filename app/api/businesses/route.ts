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

    // First, get businesses with ALL profiles (not limited) for proper ordering by category
    const allBusinesses = await prisma.business.findMany({
      where,
      include: {
        photos: true,
        profiles: true, // Get ALL profiles to check categories
        _count: {
          select: {
            profiles: true,
          },
        },
      },
    });

    // Sort:
    // 1. Businesses with HOLKY_NA_SEX profiles first (by count DESC)
    // 2. Businesses with EROTICKE_MASERKY profiles (by count DESC)
    // 3. Businesses without profiles last
    const sortedBusinesses = allBusinesses.sort((a, b) => {
      // Count profiles by category for both businesses
      const aEscortCount = a.profiles.filter(p => p.category === 'HOLKY_NA_SEX').length;
      const aMassageCount = a.profiles.filter(p => p.category === 'EROTICKE_MASERKY').length;
      const bEscortCount = b.profiles.filter(p => p.category === 'HOLKY_NA_SEX').length;
      const bMassageCount = b.profiles.filter(p => p.category === 'EROTICKE_MASERKY').length;

      // Determine primary category for each business
      const aIsEscort = aEscortCount > 0;
      const aIsMassage = aMassageCount > 0 && aEscortCount === 0;
      const bIsEscort = bEscortCount > 0;
      const bIsMassage = bMassageCount > 0 && bEscortCount === 0;

      // Both are escort businesses - sort by total profile count DESC
      if (aIsEscort && bIsEscort) {
        return b._count.profiles - a._count.profiles;
      }

      // a is escort, b is massage or empty - a comes first
      if (aIsEscort && !bIsEscort) {
        return -1;
      }

      // b is escort, a is massage or empty - b comes first
      if (bIsEscort && !aIsEscort) {
        return 1;
      }

      // Both are massage businesses - sort by total profile count DESC
      if (aIsMassage && bIsMassage) {
        return b._count.profiles - a._count.profiles;
      }

      // a is massage, b is empty - a comes first
      if (aIsMassage && !bIsMassage) {
        return -1;
      }

      // b is massage, a is empty - b comes first
      if (bIsMassage && !aIsMassage) {
        return 1;
      }

      // Both are empty - keep original order
      return 0;
    });

    // Limit profiles to 3 for each business after sorting
    const businessesWithLimitedProfiles = sortedBusinesses.map(business => ({
      ...business,
      profiles: business.profiles.slice(0, 3),
    }));

    // Apply pagination after sorting
    const total = businessesWithLimitedProfiles.length;
    const businesses = businessesWithLimitedProfiles.slice(skip, skip + limit);

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
