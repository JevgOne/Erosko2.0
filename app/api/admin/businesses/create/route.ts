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
    if (!data.name || !data.phone || !data.city || !data.profileType) {
      return NextResponse.json({
        error: 'Chybí povinná pole: název, telefon, město, typ podniku'
      }, { status: 400 });
    }

    // Generate slug from name-city-phone
    const timestamp = Date.now();
    const slug = `${data.name.toLowerCase().replace(/\s+/g, '-')}-${data.city.toLowerCase().replace(/\s+/g, '-')}-${data.phone.replace(/\D/g, '')}`;

    // Check if slug already exists
    const existingBusiness = await prisma.business.findUnique({
      where: { slug },
    });

    if (existingBusiness) {
      return NextResponse.json({
        error: 'Podnik s těmito údaji již existuje'
      }, { status: 400 });
    }

    // Get or create owner
    let ownerId = data.ownerId;

    if (!ownerId) {
      // If no owner specified, check if user with phone exists
      const existingUser = await prisma.user.findFirst({
        where: { phone: data.phone },
      });

      if (existingUser) {
        ownerId = existingUser.id;
      } else {
        // Create new user for this business
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
    const { photos, ...businessData } = data;

    // Create business
    const business = await prisma.business.create({
      data: {
        name: businessData.name,
        slug,
        phone: businessData.phone,
        email: businessData.email || null,
        website: businessData.website || null,
        address: businessData.address || null,
        city: businessData.city,
        description: businessData.description || null,
        profileType: businessData.profileType,
        equipment: businessData.equipment || null,
        openingHours: businessData.openingHours || null,
        ownerId,
        approved: true, // Admin creates = auto-approved
        verified: false, // But not verified yet
        isNew: true,
        isPopular: false,
      },
    });

    // Save photos if provided
    if (photos && photos.length > 0) {
      let photoOrder = 0;
      for (const base64Photo of photos) {
        const photoUrl = await saveBase64Photo(base64Photo, 'businesses');
        await prisma.photo.create({
          data: {
            url: photoUrl,
            businessId: business.id,
            order: photoOrder,
            isMain: photoOrder === 0,
          },
        });
        photoOrder++;
      }
    }

    return NextResponse.json({
      message: 'Podnik úspěšně vytvořen',
      business,
    });
  } catch (error) {
    console.error('Admin business create error:', error);
    return NextResponse.json({
      error: 'Chyba při vytváření podniku'
    }, { status: 500 });
  }
}
