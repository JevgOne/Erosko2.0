import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole, ChangeStatus } from '@prisma/client';

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
    const { changeId, approve, notes } = body;

    if (!changeId || typeof approve !== 'boolean') {
      return NextResponse.json({ error: 'Chybí data' }, { status: 400 });
    }

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

    if (approve) {
      // Apply the changes
      if (change.type === 'PROFILE_UPDATE' && change.profileId) {
        await prisma.profile.update({
          where: { id: change.profileId },
          data: change.newData as any,
        });
      } else if (change.type === 'BUSINESS_UPDATE' && change.businessId) {
        await prisma.business.update({
          where: { id: change.businessId },
          data: change.newData as any,
        });
      }

      // Mark as approved
      await prisma.pendingChange.update({
        where: { id: changeId },
        data: {
          status: ChangeStatus.APPROVED,
          reviewedById: user.id,
          reviewedAt: new Date(),
          reviewNotes: notes,
        },
      });

      return NextResponse.json({ success: true, message: 'Změna schválena' });
    } else {
      // Mark as rejected
      await prisma.pendingChange.update({
        where: { id: changeId },
        data: {
          status: ChangeStatus.REJECTED,
          reviewedById: user.id,
          reviewedAt: new Date(),
          reviewNotes: notes,
        },
      });

      return NextResponse.json({ success: true, message: 'Změna zamítnuta' });
    }
  } catch (error) {
    console.error('Error reviewing change:', error);
    return NextResponse.json({ error: 'Chyba při schvalování' }, { status: 500 });
  }
}
