import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * GET /api/admin/static-pages/[id]
 *
 * Returns a specific static page
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = await prisma.staticPage.findUnique({
      where: { id: params.id },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: page,
    });
  } catch (error: any) {
    console.error('Static Page GET Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch static page' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/static-pages/[id]
 *
 * Updates a static page's SEO metadata
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const {
      seoTitle,
      seoDescription,
      h1,
      keywords,
      focusKeyword,
      secondaryKeywords,
      content,
      published,
      seoScore,
    } = body;

    // Update the static page
    const updatedPage = await prisma.staticPage.update({
      where: { id: params.id },
      data: {
        seoTitle,
        seoDescription,
        h1,
        keywords,
        focusKeyword,
        secondaryKeywords,
        content,
        published,
        seoScore,
        lastAnalyzed: new Date(),
      },
    });

    // Revalidate the page path
    revalidatePath(updatedPage.path);
    revalidatePath('/admin_panel/seomaster');

    return NextResponse.json({
      success: true,
      data: updatedPage,
    });
  } catch (error: any) {
    console.error('Static Page UPDATE Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update static page' },
      { status: 500 }
    );
  }
}
