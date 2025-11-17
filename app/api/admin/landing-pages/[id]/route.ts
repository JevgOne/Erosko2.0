import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * PATCH /api/admin/landing-pages/[id]
 * Update landing page
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const {
      path,
      type,
      seoTitle,
      seoDescription,
      h1,
      content,
      keywords,
      focusKeyword,
      secondaryKeywords,
      published,
    } = body;

    // Check if page exists
    const existing = await prisma.staticPage.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    // If path is changing, check it's not taken by another page
    if (path && path !== existing.path) {
      const pathTaken = await prisma.staticPage.findUnique({
        where: { path },
      });

      if (pathTaken) {
        return NextResponse.json(
          { success: false, error: 'Path already exists' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: any = {};
    if (path !== undefined) updateData.path = path;
    if (type !== undefined) updateData.type = type;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (h1 !== undefined) updateData.h1 = h1;
    if (content !== undefined) updateData.content = content;
    if (keywords !== undefined) updateData.keywords = keywords;
    if (focusKeyword !== undefined) updateData.focusKeyword = focusKeyword;
    if (secondaryKeywords !== undefined) updateData.secondaryKeywords = secondaryKeywords;
    if (published !== undefined) updateData.published = published;

    // Update OG image if h1 or type changed
    if (h1 !== undefined || type !== undefined) {
      const newH1 = h1 || existing.h1;
      const newType = type || existing.type;
      updateData.ogImageUrl = `/api/seo/generate-og-image?name=${encodeURIComponent(newH1)}&city=&category=${newType}`;
    }

    // Update page
    const page = await prisma.staticPage.update({
      where: { id },
      data: updateData,
    });

    // Revalidate old and new paths so changes appear immediately
    revalidatePath(existing.path);
    if (path && path !== existing.path) {
      revalidatePath(path);
    }

    return NextResponse.json({
      success: true,
      data: page,
    });
  } catch (error: any) {
    console.error('Landing Pages PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/landing-pages/[id]
 * Delete landing page
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if page exists
    const existing = await prisma.staticPage.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    // Delete page
    await prisma.staticPage.delete({
      where: { id },
    });

    // Revalidate the path so it returns 404 immediately
    revalidatePath(existing.path);

    return NextResponse.json({
      success: true,
      message: 'Landing page deleted',
    });
  } catch (error: any) {
    console.error('Landing Pages DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
