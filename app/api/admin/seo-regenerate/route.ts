import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { generateProfileSEO } from '@/lib/seo-automation';

/**
 * POST /api/admin/seo-regenerate
 *
 * Regenerates SEO for one or more profiles
 */
export async function POST(request: Request) {
  try {
    // Check authentication and admin role
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { profileIds, force = false } = body;

    if (!profileIds || !Array.isArray(profileIds) || profileIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No profile IDs provided' },
        { status: 400 }
      );
    }

    // Fetch profiles with their data
    const profiles = await prisma.profile.findMany({
      where: {
        id: { in: profileIds },
      },
      include: {
        photos: {
          select: {
            id: true,
            url: true,
            order: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    if (profiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No profiles found' },
        { status: 404 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ profileId: string; error: string }>,
    };

    // Process each profile
    for (const profile of profiles) {
      try {
        // Check if SEO exists and manual override is set
        if (!force && profile.seoManualOverride) {
          results.failed++;
          results.errors.push({
            profileId: profile.id,
            error: 'Manual override enabled - skipped',
          });
          continue;
        }

        // Generate SEO
        const seoResult = await generateProfileSEO(
          {
            id: profile.id,
            name: profile.name,
            age: profile.age,
            city: profile.city,
            category: profile.category,
            description: profile.description,
            services: profile.services,
          },
          profile.photos
        );

        if (seoResult.success) {
          // Update profile with new SEO data
          await prisma.profile.update({
            where: { id: profile.id },
            data: {
              seoTitle: seoResult.seoTitle,
              seoDescriptionA: seoResult.seoDescriptionA,
              seoDescriptionB: seoResult.seoDescriptionB,
              seoDescriptionC: seoResult.seoDescriptionC,
              seoKeywords: seoResult.seoKeywords,
              seoQualityScore: seoResult.seoQualityScore,
              ogImageUrl: seoResult.ogImageUrl,
              seoLastGenerated: new Date(),
            },
          });

          // Update photo ALT texts if any
          if (seoResult.photoAlts && seoResult.photoAlts.length > 0) {
            for (const photoAlt of seoResult.photoAlts) {
              await prisma.photo.update({
                where: { id: photoAlt.id },
                data: {
                  alt: photoAlt.alt,
                  altQualityScore: photoAlt.altQualityScore,
                },
              });
            }
          }

          results.success++;
        } else {
          results.failed++;
          results.errors.push({
            profileId: profile.id,
            error: seoResult.error || 'Unknown error',
          });
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          profileId: profile.id,
          error: error.message || 'Processing error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: profileIds.length,
        processed: results.success + results.failed,
        successful: results.success,
        failed: results.failed,
        errors: results.errors,
      },
    });
  } catch (error: any) {
    console.error('SEO Regenerate API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to regenerate SEO' },
      { status: 500 }
    );
  }
}
