import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { saveBase64Photo } from '@/lib/photo-upload';
import fs from 'fs';
import path from 'path';

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
    const { profileId, data } = body;

    if (!profileId || !data) {
      return NextResponse.json({ error: 'Chybí profileId nebo data' }, { status: 400 });
    }

    // Extract photo changes and services from data
    const { photoChanges, services, ...profileData } = data;

    // Update profile
    await prisma.profile.update({
      where: { id: profileId },
      data: {
        ...profileData,
        updatedAt: new Date(),
      },
    });

    // Handle service changes (delete all and recreate)
    if (services !== undefined) {
      // Delete existing services
      await prisma.profileService.deleteMany({
        where: { profileId },
      });

      // Add new services
      if (services.length > 0) {
        await prisma.profileService.createMany({
          data: services.map((serviceId: string) => ({
            profileId,
            serviceId,
          })),
        });
      }
    }

    // Handle photo changes
    if (photoChanges) {
      // Delete photos
      if (photoChanges.photosToDelete && photoChanges.photosToDelete.length > 0) {
        const photosToDelete = await prisma.photo.findMany({
          where: { id: { in: photoChanges.photosToDelete } },
        });

        for (const photo of photosToDelete) {
          // Delete file from disk
          try {
            const publicPath = path.join(process.cwd(), 'public', photo.url);
            if (fs.existsSync(publicPath)) {
              fs.unlinkSync(publicPath);
            }
          } catch (error) {
            console.error('Error deleting photo file:', error);
          }

          // Delete from database
          await prisma.photo.delete({ where: { id: photo.id } });
        }
      }

      // Add new photos
      if (photoChanges.newPhotos && photoChanges.newPhotos.length > 0) {
        const existingPhotos = await prisma.photo.findMany({
          where: { profileId },
          orderBy: { order: 'desc' },
          take: 1,
        });
        let nextOrder = existingPhotos.length > 0 ? existingPhotos[0].order + 1 : 0;

        for (const base64Photo of photoChanges.newPhotos) {
          const photoUrl = await saveBase64Photo(base64Photo, 'profiles');
          await prisma.photo.create({
            data: {
              url: photoUrl,
              profileId,
              order: nextOrder++,
              isMain: nextOrder === 1,
            },
          });
        }
      }
    }

    return NextResponse.json({ message: 'Profil úspěšně upraven' });
  } catch (error) {
    console.error('Admin profile edit error:', error);
    return NextResponse.json({ error: 'Chyba při úpravě profilu' }, { status: 500 });
  }
}
