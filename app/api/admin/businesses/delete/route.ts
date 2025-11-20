import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';
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
    const { businessId } = body;

    if (!businessId) {
      return NextResponse.json({ error: 'Chybí businessId' }, { status: 400 });
    }

    // Get business with photos
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        photos: true,
        profiles: {
          include: {
            photos: true,
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Podnik nenalezen' }, { status: 404 });
    }

    // Delete all photos from disk with path traversal protection
    const allPhotos = [
      ...business.photos,
      ...business.profiles.flatMap(p => p.photos),
    ];

    const publicDir = path.join(process.cwd(), 'public');

    for (const photo of allPhotos) {
      try {
        // Security: Prevent path traversal attacks
        const normalizedPath = path.normalize(photo.url);

        // Check for path traversal attempts
        if (normalizedPath.includes('..') || path.isAbsolute(normalizedPath)) {
          console.error('Path traversal attempt detected:', photo.url);
          continue; // Skip this file
        }

        const publicPath = path.join(publicDir, normalizedPath);

        // Verify the resolved path is still within public directory
        if (!publicPath.startsWith(publicDir)) {
          console.error('Path outside public directory:', publicPath);
          continue; // Skip this file
        }

        if (fs.existsSync(publicPath)) {
          fs.unlinkSync(publicPath);
        }
      } catch (error) {
        console.error('Error deleting photo file:', error);
      }
    }

    // Delete business (cascade will delete profiles and photos from DB)
    await prisma.business.delete({
      where: { id: businessId },
    });

    return NextResponse.json({ message: 'Podnik úspěšně smazán' });
  } catch (error) {
    console.error('Admin business delete error:', error);
    return NextResponse.json({ error: 'Chyba při mazání podniku' }, { status: 500 });
  }
}
