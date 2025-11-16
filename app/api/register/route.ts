import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { UserRole, ProfileType, Category } from '@prisma/client';
import { saveBase64Photo } from '@/lib/photo-upload';
import { normalizePhoneNumber } from '@/lib/phone-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, email, password, role, profile } = body;

    // Validation
    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Telefonní číslo a heslo jsou povinné' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && email.trim().length > 0) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        return NextResponse.json(
          { error: 'Neplatná emailová adresa' },
          { status: 400 }
        );
      }
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Heslo musí mít alespoň 6 znaků' },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phone);

    // Check if user with this phone already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Uživatel s tímto telefonním číslem již existuje' },
        { status: 400 }
      );
    }

    // Check if email is already in use (if provided)
    if (email && email.trim().length > 0) {
      const existingEmailUser = await prisma.user.findUnique({
        where: { email: email.trim() },
      });

      if (existingEmailUser) {
        return NextResponse.json(
          { error: 'Email je již používán jiným uživatelem' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          phone: normalizedPhone,
          email: email?.trim() || null,
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
        // Use phone number (without spaces and +) instead of timestamp
        const phoneSlug = profile.phone.replace(/[\s\+\-\(\)]/g, '');
        const slug = `${profile.name.toLowerCase().replace(/\s+/g, '-')}-${profile.city.toLowerCase().replace(/\s+/g, '-')}-${phoneSlug}`;

        const newBusiness = await tx.business.create({
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

        // Save photos if provided
        if (profile.photos && profile.photos.length > 0) {
          for (let i = 0; i < profile.photos.length; i++) {
            const photoUrl = await saveBase64Photo(profile.photos[i], 'businesses');
            await tx.photo.create({
              data: {
                url: photoUrl,
                businessId: newBusiness.id,
                order: i,
                isMain: i === 0, // První fotka je hlavní
              },
            });
          }
        }

        return {
          user: {
            id: user.id,
            phone: user.phone,
            email: user.email,
            role: user.role,
            business: {
              id: newBusiness.id,
              name: newBusiness.name,
              slug: newBusiness.slug,
            },
          },
        };
      } else {
        // Create Profile for SOLO types
        // Use phone number (without spaces and +) instead of timestamp
        const phoneSlug = profile.phone.replace(/[\s\+\-\(\)]/g, '');
        const slug = `${profile.name.toLowerCase().replace(/\s+/g, '-')}-${profile.city.toLowerCase().replace(/\s+/g, '-')}-${phoneSlug}`;

        const newProfile = await tx.profile.create({
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
            ownerId: user.id,
            verified: false,
            isNew: true,
          },
        });

        // Add services
        if (profile.services && profile.services.length > 0) {
          for (const serviceName of profile.services) {
            // Find or create service
            let service = await tx.service.findUnique({
              where: { name: serviceName },
            });

            if (!service) {
              service = await tx.service.create({
                data: { name: serviceName },
              });
            }

            // Link service to profile
            await tx.profileService.create({
              data: {
                profileId: newProfile.id,
                serviceId: service.id,
              },
            });
          }
        }

        // Save photos if provided
        if (profile.photos && profile.photos.length > 0) {
          for (let i = 0; i < profile.photos.length; i++) {
            const photoUrl = await saveBase64Photo(profile.photos[i], 'profiles');
            await tx.photo.create({
              data: {
                url: photoUrl,
                profileId: newProfile.id,
                order: i,
                isMain: i === 0, // První fotka je hlavní
              },
            });
          }
        }

        return {
          user: {
            id: user.id,
            phone: user.phone,
            email: user.email,
            role: user.role,
            profile: {
              id: newProfile.id,
              name: newProfile.name,
              slug: newProfile.slug,
            },
          },
        };
      }
      }

      // Return user only if no profile/business
      return {
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          role: user.role,
        },
      };
    });

    // Return result from transaction
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Něco se pokazilo při registraci' },
      { status: 500 }
    );
  }
}
