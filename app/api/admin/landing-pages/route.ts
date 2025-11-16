import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/landing-pages
 * List all landing pages
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type && type !== 'all') {
      where.type = type;
    }
    if (search) {
      where.OR = [
        { path: { contains: search, mode: 'insensitive' } },
        { seoTitle: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [pages, total] = await Promise.all([
      prisma.staticPage.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.staticPage.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        pages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Landing Pages GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/landing-pages
 * Create new landing page
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { path, type, seoTitle, seoDescription, h1, content, keywords, published } = body;

    // Validation
    if (!path || !seoTitle || !seoDescription || !h1) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if path already exists
    const existing = await prisma.staticPage.findUnique({
      where: { path },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Path already exists' },
        { status: 400 }
      );
    }

    // Generate OG Image URL
    const ogImageUrl = `/api/seo/generate-og-image?name=${encodeURIComponent(h1)}&city=&category=${type || 'CUSTOM'}`;

    // Create page
    const page = await prisma.staticPage.create({
      data: {
        path,
        type: type || 'CUSTOM',
        seoTitle,
        seoDescription,
        h1,
        content: content || '',
        keywords,
        ogImageUrl,
        published: published !== false,
      },
    });

    return NextResponse.json({
      success: true,
      data: page,
    });
  } catch (error: any) {
    console.error('Landing Pages POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
