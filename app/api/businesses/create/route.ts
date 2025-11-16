import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { ProfileType } from '@prisma/client';
import { generateBusinessSEO } from '@/lib/seo-automation';

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Musíte být přihlášeni' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, phone, email, website, address, city, profileType, equipment, openingHours } = body;

    if (!name || !phone || !city || !profileType) {
      return NextResponse.json(
        { error: 'Vyplňte všechny povinné údaje (název, telefon, město, typ podniku)' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${city.toLowerCase()}-${Date.now()}`;

    // Create business
    const business = await prisma.business.create({
      data: {
        name,
        slug,
        description: description || null,
        phone,
        email: email || null,
        website: website || null,
        address: address || null,
        city,
        profileType: profileType as ProfileType,
        equipment: equipment || null,
        openingHours: openingHours || null,
        ownerId: session.user.id,
        verified: false,
        isNew: true,
      },
    });

    // Auto-generate SEO in background (non-blocking)
    generateBusinessSEO({
      id: business.id,
      name: business.name,
      city: business.city,
      profileType: business.profileType,
      description: business.description,
    })
      .then(async (seoResult) => {
        if (seoResult.success) {
          await prisma.business.update({
            where: { id: business.id },
            data: {
              seoTitle: seoResult.seoTitle,
              seoDescription: seoResult.seoDescriptionA, // Use variant A for businesses
              seoKeywords: seoResult.seoKeywords,
              seoQualityScore: seoResult.seoQualityScore,
              ogImageUrl: seoResult.ogImageUrl,
              seoLastGenerated: new Date(),
            },
          });
          console.log(`✅ SEO generated for business: ${business.name}`);
        }
      })
      .catch((error) => {
        console.error('Background SEO generation failed:', error);
        // Don't fail the request if SEO fails
      });

    return NextResponse.json(
      {
        business: {
          id: business.id,
          name: business.name,
          slug: business.slug,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Business creation error:', error);
    return NextResponse.json(
      { error: 'Něco se pokazilo při vytváření podniku' },
      { status: 500 }
    );
  }
}
