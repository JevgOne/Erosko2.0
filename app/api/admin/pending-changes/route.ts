import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { saveBase64Photo } from '@/lib/photo-upload';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    console.log('[API /admin/pending-changes] GET request received');

    const session = await auth();
    console.log('[API /admin/pending-changes] Session:', session ? { userId: session.user?.id, role: session.user?.role } : null);

    if (!session || !session.user) {
      console.log('[API /admin/pending-changes] No session or user');
      return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    console.log('[API /admin/pending-changes] User found:', user ? { id: user.id, role: user.role } : null);

    if (!user || user.role !== UserRole.ADMIN) {
      console.log('[API /admin/pending-changes] User is not admin');
      return NextResponse.json({ error: 'Nemáte oprávnění' }, { status: 403 });
    }

    console.log('[API /admin/pending-changes] Fetching pending changes...');

    // Fetch all pending changes (not just pending status)
    const changes = await prisma.pendingChange.findMany({
      include: {
        requestedBy: {
          select: {
            id: true,
            email: true,
            businesses: {
              select: {
                name: true,
                phone: true,
              },
              take: 1,
            },
          },
        },
        profile: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            business: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
          },
        },
        reviewedBy: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('[API /admin/pending-changes] Changes fetched successfully, count:', changes.length);

    return NextResponse.json({ changes });
  } catch (error) {
    console.error('[API /admin/pending-changes] Error fetching pending changes:', error);
    console.error('[API /admin/pending-changes] Error details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      {
        error: 'Chyba při načítání změn',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Approve or reject a pending change
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
    const { changeId, action, notes } = body; // action: 'approve' or 'reject'

    if (!changeId || !action) {
      return NextResponse.json({ error: 'Chybí changeId nebo action' }, { status: 400 });
    }

    // Get the pending change
    const change = await prisma.pendingChange.findUnique({
      where: { id: changeId },
      include: {
        profile: true,
        business: true,
      },
    });

    if (!change) {
      return NextResponse.json({ error: 'Změna nenalezena' }, { status: 404 });
    }

    if (change.status !== 'PENDING') {
      return NextResponse.json({ error: 'Změna již byla zpracována' }, { status: 400 });
    }

    if (action === 'approve') {
      // Apply the changes
      const newData = change.newData as any;

      if (change.profileId && change.profile) {
        // Update profile
        const { photoChanges, ...profileData } = newData;
        await prisma.profile.update({
          where: { id: change.profileId },
          data: {
            ...profileData,
            updatedAt: new Date(),
          },
        });

        // Handle photo changes for profile
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
              where: { profileId: change.profileId },
              orderBy: { order: 'desc' },
              take: 1,
            });
            let nextOrder = existingPhotos.length > 0 ? existingPhotos[0].order + 1 : 0;

            for (const base64Photo of photoChanges.newPhotos) {
              const photoUrl = await saveBase64Photo(base64Photo, 'profiles');
              await prisma.photo.create({
                data: {
                  url: photoUrl,
                  profileId: change.profileId,
                  order: nextOrder++,
                  isMain: nextOrder === 1,
                },
              });
            }
          }
        }
      } else if (change.businessId && change.business) {
        // Update business
        const { photoChanges, ...businessData } = newData;
        await prisma.business.update({
          where: { id: change.businessId },
          data: {
            ...businessData,
            updatedAt: new Date(),
          },
        });

        // Handle photo changes for business
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
              where: { businessId: change.businessId },
              orderBy: { order: 'desc' },
              take: 1,
            });
            let nextOrder = existingPhotos.length > 0 ? existingPhotos[0].order + 1 : 0;

            for (const base64Photo of photoChanges.newPhotos) {
              const photoUrl = await saveBase64Photo(base64Photo, 'businesses');
              await prisma.photo.create({
                data: {
                  url: photoUrl,
                  businessId: change.businessId,
                  order: nextOrder++,
                  isMain: nextOrder === 1,
                },
              });
            }
          }
        }
      }

      // Mark change as approved
      await prisma.pendingChange.update({
        where: { id: changeId },
        data: {
          status: 'APPROVED',
          reviewedById: user.id,
          reviewedAt: new Date(),
          reviewNotes: notes || null,
        },
      });

      return NextResponse.json({ message: 'Změna schválena a aplikována' });
    } else if (action === 'reject') {
      // Mark change as rejected
      await prisma.pendingChange.update({
        where: { id: changeId },
        data: {
          status: 'REJECTED',
          reviewedById: user.id,
          reviewedAt: new Date(),
          reviewNotes: notes || null,
        },
      });

      return NextResponse.json({ message: 'Změna zamítnuta' });
    } else {
      return NextResponse.json({ error: 'Neplatná akce' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing change:', error);
    return NextResponse.json({ error: 'Chyba při zpracování změny' }, { status: 500 });
  }
}
