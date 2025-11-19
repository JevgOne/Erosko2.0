import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

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
    const { profileId, businessId, action } = body;

    if (!profileId || !businessId || !action) {
      return NextResponse.json(
        { error: 'Chybí povinné údaje (profileId, businessId, action)' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Neplatná akce (musí být approve nebo reject)' },
        { status: 400 }
      );
    }

    // Verify profile exists and has no business
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profil nenalezen' }, { status: 404 });
    }

    if (profile.businessId) {
      return NextResponse.json(
        { error: 'Profil už je přiřazen k podniku' },
        { status: 400 }
      );
    }

    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json({ error: 'Podnik nenalezen' }, { status: 404 });
    }

    if (action === 'approve') {
      // Link profile to business
      await prisma.profile.update({
        where: { id: profileId },
        data: {
          businessId: businessId,
          // Also update ownerId to match business owner
          ownerId: business.ownerId,
        },
      });

      console.log(`[Link Profile-Business] Profile ${profileId} linked to business ${businessId}`);

      return NextResponse.json({
        success: true,
        message: 'Profil úspěšně přiřazen k podniku',
      });
    } else {
      // Reject - just log it, don't link
      console.log(`[Link Profile-Business] Linking rejected for profile ${profileId} and business ${businessId}`);

      return NextResponse.json({
        success: true,
        message: 'Propojení zamítnuto',
      });
    }
  } catch (error) {
    console.error('Error linking profile to business:', error);
    return NextResponse.json(
      { error: 'Chyba při propojování profilu a podniku' },
      { status: 500 }
    );
  }
}
