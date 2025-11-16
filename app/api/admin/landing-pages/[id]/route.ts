import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/landing-pages/[id]
 * Get single landing page
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
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: page,
    });
  } catch (error: any) {
    console.error('Landing Page GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/landing-pages/[id]
 * Update landing page
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
    const { path, type, seoTitle, seoDescription, h1, content, keywords, published } = body;

    // Check if page exists
    const existing = await prisma.staticPage.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    // If path changed, check for conflicts
    if (path && path !== existing.path) {
      const conflict = await prisma.staticPage.findUnique({
        where: { path },
      });
      if (conflict) {
        return NextResponse.json(
          { success: false, error: 'Path already exists' },
          { status: 400 }
        );
      }
    }

    // Update page
    const page = await prisma.staticPage.update({
      where: { id: params.id },
      data: {
        ...(path && { path }),
        ...(type && { type }),
        ...(seoTitle && { seoTitle }),
        ...(seoDescription && { seoDescription }),
        ...(h1 && { h1 }),
        ...(content !== undefined && { content }),
        ...(keywords !== undefined && { keywords }),
        ...(published !== undefined && { published }),
      },
    });

    return NextResponse.json({
      success: true,
      data: page,
    });
  } catch (error: any) {
    console.error('Landing Page PUT error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/landing-pages/[id]
 * Delete landing page
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.staticPage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Page deleted successfully',
    });
  } catch (error: any) {
    console.error('Landing Page DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
