import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();

    // Only admins can generate AI reviews
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profileId, businessId, reviews, isAIGenerated } = await request.json();

    // Validate input
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json({ error: 'Invalid reviews data' }, { status: 400 });
    }

    if (!profileId && !businessId) {
      return NextResponse.json({ error: 'Either profileId or businessId is required' }, { status: 400 });
    }

    // Create reviews in database
    const createdReviews = await Promise.all(
      reviews.map(async (review: any) => {
        return await prisma.review.create({
          data: {
            rating: review.rating,
            comment: review.comment,
            authorName: review.name,
            profileId: profileId || null,
            businessId: businessId || null,
            isAIGenerated: isAIGenerated || false,
            // Don't link to real user - these are AI generated for social proof
            createdAt: new Date(review.date || Date.now()),
          },
        });
      })
    );

    // Update profile/business rating and review count
    if (profileId) {
      const allReviews = await prisma.review.findMany({
        where: { profileId },
      });

      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await prisma.profile.update({
        where: { id: profileId },
        data: {
          rating: avgRating,
          reviewCount: allReviews.length,
        },
      });
    }

    if (businessId) {
      const allReviews = await prisma.review.findMany({
        where: { businessId },
      });

      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await prisma.business.update({
        where: { id: businessId },
        data: {
          rating: avgRating,
          reviewCount: allReviews.length,
        },
      });
    }

    return NextResponse.json({
      success: true,
      created: createdReviews.length,
    });
  } catch (error: any) {
    console.error('Error creating reviews:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create reviews' },
      { status: 500 }
    );
  }
}
