import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/static-pages
 *
 * Returns list of static pages for SEO editing
 */
export async function GET(request: Request) {
  try {
    // Check authentication and admin role
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const published = searchParams.get('published');

    // Build where clause
    const where: any = {};

    if (type && type !== 'all') {
      where.type = type;
    }

    if (published !== null) {
      where.published = published === 'true';
    }

    // Fetch static pages
    const pages = await prisma.staticPage.findMany({
      where,
      select: {
        id: true,
        path: true,
        type: true,
        seoTitle: true,
        seoDescription: true,
        h1: true,
        keywords: true,
        focusKeyword: true,
        secondaryKeywords: true,
        content: true,
        published: true,
        seoScore: true,
      },
      orderBy: [
        { type: 'asc' },
        { path: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: pages,
    });
  } catch (error: any) {
    console.error('Static Pages API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch static pages' },
      { status: 500 }
    );
  }
}
