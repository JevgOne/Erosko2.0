import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { ProfileType, Category } from '@prisma/client';
import { generateProfileSEO } from '@/lib/seo-automation';

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
    const {
      name,
      age,
      description,
      height,
      weight,
      bust,
      hairColor,
      breastType,
      role,
      nationality,
      languages,
      orientation,
      tattoos,
      piercing,
      offersEscort,
      travels,
      services,
      businessId
    } = body;

    if (!name || !age) {
      return NextResponse.json(
        { error: 'Vyplňte všechny povinné údaje' },
        { status: 400 }
      );
    }

    if (!businessId) {
      return NextResponse.json(
        { error: 'Chybí ID podniku' },
        { status: 400 }
      );
    }

    // Najdi podnik a ověř, že patří uživateli
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: session.user.id,
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Podnik nenalezen nebo nemáte oprávnění' },
        { status: 403 }
      );
    }

    // Automaticky namapuj kategorii podle typu podniku
    let category: Category;
    if (business.profileType === ProfileType.MASSAGE_SALON) {
      category = Category.EROTICKE_MASERKY;
    } else if (business.profileType === ProfileType.PRIVAT) {
      category = Category.HOLKY_NA_SEX;
    } else if (business.profileType === ProfileType.DIGITAL_AGENCY) {
      category = Category.DIGITALNI_SLUZBY;
    } else {
      category = Category.HOLKY_NA_SEX; // Default
    }

    // Generate slug
    const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${business.city.toLowerCase()}-${Date.now()}`;

    // Create profile - použij telefon a město z podniku
    const profile = await prisma.profile.create({
      data: {
        name,
        slug,
        age: parseInt(age),
        phone: business.phone, // Telefonní číslo z podniku (stejné pro všechny profily)
        city: business.city, // Město z podniku
        address: business.address, // Adresa z podniku
        description: description || null,
        location: `${business.city}, centrum`,
        profileType: business.profileType, // Typ z podniku
        category, // Automaticky namapovaná kategorie
        // Fyzické vlastnosti
        height: height ? parseInt(height) : null,
        weight: weight ? parseInt(weight) : null,
        bust: bust || null,
        hairColor: hairColor || null,
        breastType: breastType || null,
        // Další vlastnosti
        role: role || null,
        nationality: nationality || null,
        languages: languages && languages.length > 0 ? JSON.stringify(languages) : null,
        orientation: orientation || null,
        tattoos: tattoos || null,
        piercing: piercing || null,
        // Možnosti služeb
        offersEscort: offersEscort || false,
        travels: travels || false,
        // Metadata
        ownerId: session.user.id,
        businessId: business.id,
        verified: false,
        isNew: true,
      },
    });

    // Add services (services array now contains service IDs)
    if (services && services.length > 0) {
      for (const serviceId of services) {
        // Link service to profile
        await prisma.profileService.create({
          data: {
            profileId: profile.id,
            serviceId: serviceId,
          },
        });
      }
    }

    // Auto-generate SEO (async, don't block response)
    // This runs in background after profile creation
    generateProfileSEO(
      {
        id: profile.id,
        name: profile.name,
        age: profile.age,
        city: profile.city,
        category: profile.category,
        description: profile.description,
        services: [], // Services will be fetched if needed
      },
      [] // Photos can be added later, SEO will regenerate
    )
      .then(async (seoResult) => {
        if (seoResult.success) {
          // Update profile with SEO data
          await prisma.profile.update({
            where: { id: profile.id },
            data: {
              seoTitle: seoResult.seoTitle,
              seoDescriptionA: seoResult.seoDescriptionA,
              seoDescriptionB: seoResult.seoDescriptionB,
              seoDescriptionC: seoResult.seoDescriptionC,
              seoKeywords: seoResult.seoKeywords,
              seoQualityScore: seoResult.seoQualityScore,
              ogImageUrl: seoResult.ogImageUrl,
              seoLastGenerated: new Date(),
              seoActiveVariant: 'A', // Start with variant A
            },
          });
          console.log(`✅ SEO generated for profile ${profile.id}`);
        } else {
          console.error(`❌ SEO generation failed for profile ${profile.id}:`, seoResult.error);
        }
      })
      .catch((error) => {
        console.error(`❌ SEO automation error for profile ${profile.id}:`, error);
      });

    return NextResponse.json(
      {
        profile: {
          id: profile.id,
          name: profile.name,
          slug: profile.slug,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Profile creation error:', error);
    return NextResponse.json(
      { error: 'Něco se pokazilo při vytváření profilu' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const region = searchParams.get('region');
    const services = searchParams.get('services');
    const hairColor = searchParams.get('hairColor');
    const eyeColor = searchParams.get('eyeColor');
    const breastSize = searchParams.get('breastSize');
    const bodyType = searchParams.get('bodyType');
    const ethnicity = searchParams.get('ethnicity');
    const tattoo = searchParams.get('tattoo');
    const piercing = searchParams.get('piercing');
    const ageMin = searchParams.get('ageMin');
    const ageMax = searchParams.get('ageMax');
    const heightMin = searchParams.get('heightMin');
    const heightMax = searchParams.get('heightMax');
    const weightMin = searchParams.get('weightMin');
    const weightMax = searchParams.get('weightMax');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '18');
    const skip = (page - 1) * limit;

    const where: any = {
      approved: true, // Only show approved profiles to public
    };

    if (category) {
      where.category = category;
    }

    if (city) {
      // Normalize city name to match database format (capitalize first letter)
      const normalizedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
      where.city = normalizedCity;
    }

    if (region && !city) {
      // Region filtering - TODO: implement region-to-cities mapping
      // For now, just use region as city prefix
      where.city = {
        contains: region.replace(' kraj', '').replace('Hlavní město ', ''),
      };
    }

    // Physical attributes filters
    if (hairColor) {
      where.hairColor = {
        contains: hairColor,
        mode: 'insensitive',
      };
    }

    if (eyeColor) {
      where.eyeColor = {
        contains: eyeColor,
        mode: 'insensitive',
      };
    }

    if (breastSize) {
      where.bust = breastSize;
    }

    if (bodyType) {
      where.bodyType = {
        contains: bodyType,
        mode: 'insensitive',
      };
    }

    if (ethnicity) {
      where.nationality = {
        contains: ethnicity,
        mode: 'insensitive',
      };
    }

    if (tattoo) {
      where.tattoos = {
        contains: tattoo,
        mode: 'insensitive',
      };
    }

    if (piercing) {
      where.piercing = {
        contains: piercing,
        mode: 'insensitive',
      };
    }

    // Age range filter
    if (ageMin || ageMax) {
      where.age = {};
      if (ageMin) where.age.gte = parseInt(ageMin);
      if (ageMax) where.age.lte = parseInt(ageMax);
    }

    // Height range filter
    if (heightMin || heightMax) {
      where.height = {};
      if (heightMin) where.height.gte = parseInt(heightMin);
      if (heightMax) where.height.lte = parseInt(heightMax);
    }

    // Weight range filter
    if (weightMin || weightMax) {
      where.weight = {};
      if (weightMin) where.weight.gte = parseInt(weightMin);
      if (weightMax) where.weight.lte = parseInt(weightMax);
    }

    // Services filter - search profiles that have ANY of the requested services
    if (services) {
      const serviceNames = services.split(',').map((s) => s.trim());
      where.services = {
        some: {
          service: {
            name: {
              in: serviceNames,
            },
          },
        },
      };
    }

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        include: {
          services: {
            include: {
              service: true,
            },
          },
          photos: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.profile.count({ where }),
    ]);

    return NextResponse.json({
      profiles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Profiles fetch error:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání profilů' },
      { status: 500 }
    );
  }
}
