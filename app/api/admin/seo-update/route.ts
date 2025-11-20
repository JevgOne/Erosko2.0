import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

/**
 * POST /api/admin/seo-update
 *
 * Manually update SEO data for a profile (SEO Master override)
 */
export async function POST(request: Request) {
  try {
    // Check authentication and admin role
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { profileId, seoData, manualOverride } = body;

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      seoLastReviewed: new Date(),
    };

    // Update SEO data if provided
    if (seoData) {
      if (seoData.seoTitle !== undefined) updateData.seoTitle = seoData.seoTitle;
      if (seoData.seoDescriptionA !== undefined) updateData.seoDescriptionA = seoData.seoDescriptionA;
      if (seoData.seoDescriptionB !== undefined) updateData.seoDescriptionB = seoData.seoDescriptionB;
      if (seoData.seoDescriptionC !== undefined) updateData.seoDescriptionC = seoData.seoDescriptionC;
      if (seoData.seoKeywords !== undefined) updateData.seoKeywords = seoData.seoKeywords;
      if (seoData.seoActiveVariant !== undefined) updateData.seoActiveVariant = seoData.seoActiveVariant;
      if (seoData.ogImageUrl !== undefined) updateData.ogImageUrl = seoData.ogImageUrl;
    }

    // Update manual override flag if provided
    if (manualOverride !== undefined) {
      updateData.seoManualOverride = manualOverride;
    }

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { id: profileId },
      data: updateData,
    });

    // Revalidate the profile page so SEO changes appear immediately (like Rank Math)
    revalidatePath(`/${profile.slug}`);
    revalidatePath(`/profil/${profile.slug}`);

    return NextResponse.json({
      success: true,
      data: {
        profileId: updatedProfile.id,
        updated: true,
      },
    });
  } catch (error: any) {
    console.error('SEO Update API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update SEO' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/seo-update
 *
 * Toggle manual override or active variant for a profile
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { profileId, action, value } = body;

    if (!profileId || !action) {
      return NextResponse.json(
        { success: false, error: 'Profile ID and action are required' },
        { status: 400 }
      );
    }

    // Get profile slug for cache invalidation
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { slug: true },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    switch (action) {
      case 'toggle-override':
        updateData.seoManualOverride = value;
        break;
      case 'set-variant':
        updateData.seoActiveVariant = value;
        updateData.seoLastReviewed = new Date();
        break;
      case 'mark-reviewed':
        updateData.seoLastReviewed = new Date();
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    await prisma.profile.update({
      where: { id: profileId },
      data: updateData,
    });

    // Revalidate the profile page so changes appear immediately
    revalidatePath(`/${profile.slug}`);
    revalidatePath(`/profil/${profile.slug}`);

    return NextResponse.json({
      success: true,
      data: { profileId, action, updated: true },
    });
  } catch (error: any) {
    console.error('SEO Update API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update' },
      { status: 500 }
    );
  }
}
