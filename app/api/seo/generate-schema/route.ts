import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateProfilePageSchema, generateBusinessPageSchema } from '@/lib/schema-generator';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, businessId } = body;

    let schema: object | null = null;

    if (profileId) {
      // Generate schema for profile
      const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        include: {
          photos: {
            where: { isMain: true },
            take: 1,
          },
        },
      });

      if (!profile) {
        return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
      }

      schema = generateProfilePageSchema({
        name: profile.name,
        age: profile.age,
        city: profile.city,
        description: profile.description || undefined,
        slug: profile.slug,
        rating: profile.rating,
        reviewCount: profile.reviewCount,
        mainPhotoUrl: profile.photos[0]?.url,
      });

      // Save schema to profile
      await prisma.profile.update({
        where: { id: profileId },
        data: {
          schemaMarkup: JSON.stringify(schema),
        },
      });
    } else if (businessId) {
      // Generate schema for business
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: {
          photos: {
            where: { isMain: true },
            take: 1,
          },
        },
      });

      if (!business) {
        return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
      }

      schema = generateBusinessPageSchema({
        name: business.name,
        city: business.city,
        address: business.address || undefined,
        description: business.description || undefined,
        slug: business.slug,
        phone: business.phone,
        rating: business.rating,
        reviewCount: business.reviewCount,
        mainPhotoUrl: business.photos[0]?.url,
        openingHours: business.openingHours as any,
      });

      // Save schema to business
      await prisma.business.update({
        where: { id: businessId },
        data: {
          schemaMarkup: JSON.stringify(schema),
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'profileId or businessId required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      schema,
    });
  } catch (error) {
    console.error('Generate schema error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate schema' }, { status: 500 });
  }
}
