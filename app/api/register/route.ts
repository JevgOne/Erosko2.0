import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { UserRole, ProfileType, Category } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role, profile } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email a heslo jsou povinné' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Uživatel s tímto emailem již existuje' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with profile if provider
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: role || UserRole.USER,
      },
    });

    // If provider, create profile or business
    if (role === UserRole.PROVIDER && profile) {
      const profileType = profile.profileType as ProfileType;

      // Check if this is a business or individual profile
      const isBusinessType = profileType !== ProfileType.SOLO;

      if (isBusinessType) {
        // Create Business for PODNIK types
        const slug = `${profile.name.toLowerCase().replace(/\s+/g, '-')}-${profile.city.toLowerCase()}-${Date.now()}`;

        const newBusiness = await prisma.business.create({
          data: {
            name: profile.name,
            slug,
            description: profile.description || null,
            phone: profile.phone,
            address: profile.address || null,
            city: profile.city,
            profileType: profileType,
            equipment: profile.equipment && profile.equipment.length > 0 ? profile.equipment : null,
            openingHours: profile.openingHours || null,
            ownerId: user.id,
            verified: false,
            isNew: true,
          },
        });

        return NextResponse.json(
          {
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              business: {
                id: newBusiness.id,
                name: newBusiness.name,
                slug: newBusiness.slug,
              },
            },
          },
          { status: 201 }
        );
      } else {
        // Create Profile for SOLO types
        const slug = `${profile.name.toLowerCase().replace(/\s+/g, '-')}-${profile.city.toLowerCase()}-${Date.now()}`;

        const newProfile = await prisma.profile.create({
          data: {
            name: profile.name,
            slug,
            age: profile.age,
            phone: profile.phone,
            description: profile.description || null,
            city: profile.city,
            address: profile.address || null,
            location: `${profile.city}, centrum`,
            profileType: profileType,
            category: profile.category as Category,
            hourlyRate: profile.pricePerHour || null,
            ownerId: user.id,
            verified: false,
            isNew: true,
          },
        });

        // Add services
        if (profile.services && profile.services.length > 0) {
          for (const serviceName of profile.services) {
            // Find or create service
            let service = await prisma.service.findUnique({
              where: { name: serviceName },
            });

            if (!service) {
              service = await prisma.service.create({
                data: { name: serviceName },
              });
            }

            // Link service to profile
            await prisma.profileService.create({
              data: {
                profileId: newProfile.id,
                serviceId: service.id,
              },
            });
          }
        }

        return NextResponse.json(
          {
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              profile: {
                id: newProfile.id,
                name: newProfile.name,
                slug: newProfile.slug,
              },
            },
          },
          { status: 201 }
        );
      }
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Něco se pokazilo při registraci' },
      { status: 500 }
    );
  }
}
