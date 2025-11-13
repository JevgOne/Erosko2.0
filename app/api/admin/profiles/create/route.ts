import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { saveBase64Photo } from '@/lib/photo-upload';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Nemáte oprávnění' }, { status: 403 });
    }

    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json({ error: 'Chybí data' }, { status: 400 });
    }

    // Validate required fields
    if (!data.name || !data.age || !data.phone || !data.city || !data.category) {
      return NextResponse.json({
        error: 'Chybí povinná pole: jméno, věk, telefon, město, kategorie'
      }, { status: 400 });
    }

    // Generate slug from name-city-phone
    const timestamp = Date.now();
    const slug = `${data.name.toLowerCase().replace(/\s+/g, '-')}-${data.city.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;

    // Check if slug already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { slug },
    });

    if (existingProfile) {
      return NextResponse.json({
        error: 'Profil s těmito údaji již existuje'
      }, { status: 400 });
    }

    // Get or create owner
    let ownerId = data.ownerId;

    if (!ownerId && data.businessId) {
      // If adding to business, use business owner
      const business = await prisma.business.findUnique({
        where: { id: data.businessId },
      });
      if (business) {
        ownerId = business.ownerId;
      }
    }

    if (!ownerId) {
      // If no owner specified, check if user with phone exists
      const existingUser = await prisma.user.findUnique({
        where: { phone: data.phone },
      });

      if (existingUser) {
        ownerId = existingUser.id;
      } else {
        // Create new user for this profile
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('changeme123', 10);

        const newUser = await prisma.user.create({
          data: {
            phone: data.phone,
            passwordHash: hashedPassword,
            phoneVerified: false,
            role: UserRole.USER,
          },
        });
        ownerId = newUser.id;
      }
    }

    // Extract photo data
    const { photos, ...profileData } = data;

    // Determine profile type
    const profileType = data.businessId ?
      (await prisma.business.findUnique({ where: { id: data.businessId } }))?.profileType || 'SOLO'
      : 'SOLO';

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        name: profileData.name,
        slug,
        age: parseInt(profileData.age),
        phone: profileData.phone,
        email: profileData.email || null,
        city: profileData.city,
        address: profileData.address || null,
        location: `${profileData.city}, centrum`,
        description: profileData.description || null,
        profileType,
        category: profileData.category,
        ownerId,
        businessId: profileData.businessId || null,
        approved: true, // Admin creates = auto-approved
        verified: false,
        isNew: true,
        isPopular: false,
      },
    });

    // Save photos if provided
    if (photos && photos.length > 0) {
      let photoOrder = 0;
      for (const base64Photo of photos) {
        const photoUrl = await saveBase64Photo(base64Photo, 'profiles');
        await prisma.photo.create({
          data: {
            url: photoUrl,
            profileId: profile.id,
            order: photoOrder,
            isMain: photoOrder === 0,
          },
        });
        photoOrder++;
      }
    }

    // Connect services if provided
    if (profileData.services && Array.isArray(profileData.services) && profileData.services.length > 0) {
      for (const serviceId of profileData.services) {
        await prisma.profileService.create({
          data: {
            profileId: profile.id,
            serviceId: serviceId,
          },
        });
      }
    }

    return NextResponse.json({
      message: 'Profil úspěšně vytvořen',
      profile,
    });
  } catch (error) {
    console.error('Admin profile create error:', error);
    return NextResponse.json({
      error: 'Chyba při vytváření profilu'
    }, { status: 500 });
  }
}
