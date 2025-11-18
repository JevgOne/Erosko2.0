import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const businessId = searchParams.get('businessId');

    if (!profileId && !businessId) {
      return NextResponse.json(
        { error: 'Either profileId or businessId is required' },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        OR: [
          { profileId: profileId || undefined },
          { businessId: businessId || undefined },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        rating: true,
        comment: true,
        authorName: true,
        author: {
          select: { phone: true },
        },
        createdAt: true,
        isAIGenerated: true,
      },
    });

    // Format for display
    const formatted = reviews.map((r) => {
      // Format date relative to now
      const now = new Date();
      const reviewDate = new Date(r.createdAt);
      const diffInDays = Math.floor(
        (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let dateText = '';
      if (diffInDays === 0) {
        dateText = 'Dnes';
      } else if (diffInDays === 1) {
        dateText = 'Včera';
      } else if (diffInDays < 7) {
        dateText = `Před ${diffInDays} dny`;
      } else if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7);
        dateText = weeks === 1 ? 'Před týdnem' : `Před ${weeks} týdny`;
      } else if (diffInDays < 365) {
        const months = Math.floor(diffInDays / 30);
        dateText = months === 1 ? 'Před měsícem' : `Před ${months} měsíci`;
      } else {
        dateText = reviewDate.toLocaleDateString('cs-CZ');
      }

      return {
        id: r.id,
        name: r.authorName || (r.author?.phone ? `${r.author.phone.substring(0, 6)}***` : 'Anonym'),
        rating: r.rating,
        text: r.comment,
        date: dateText,
        isAI: r.isAIGenerated,
        helpful: 0, // TODO: Implement helpful votes later
      };
    });

    // Calculate stats
    const stats = {
      total: reviews.length,
      average: reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0',
      breakdown: {
        5: reviews.filter((r) => r.rating === 5).length,
        4: reviews.filter((r) => r.rating === 4).length,
        3: reviews.filter((r) => r.rating === 3).length,
        2: reviews.filter((r) => r.rating === 2).length,
        1: reviews.filter((r) => r.rating === 1).length,
      },
    };

    return NextResponse.json({
      success: true,
      reviews: formatted,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
