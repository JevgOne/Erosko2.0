import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { ChangeType } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
    }

    const body = await request.json();
    const { profileId, changes } = body;

    if (!profileId || !changes) {
      return NextResponse.json({ error: 'Chybí data' }, { status: 400 });
    }

    // Verify user owns this profile
    const profile = await prisma.profile.findFirst({
      where: {
        id: profileId,
        ownerId: session.user.id,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profil nenalezen' }, { status: 404 });
    }

    // Get old data (current profile data)
    const oldData = {
      name: profile.name,
      age: profile.age,
      description: profile.description,
      height: profile.height,
      weight: profile.weight,
      bust: profile.bust,
      offersEscort: profile.offersEscort,
      travels: profile.travels,
    };

    // Create pending change request
    const pendingChange = await prisma.pendingChange.create({
      data: {
        type: ChangeType.PROFILE_UPDATE,
        profileId: profile.id,
        oldData: oldData,
        newData: changes,
        requestedById: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Žádost o změnu byla odeslána ke schválení',
      changeId: pendingChange.id,
    });
  } catch (error) {
    console.error('Error creating change request:', error);
    return NextResponse.json({ error: 'Chyba při vytváření žádosti' }, { status: 500 });
  }
}
