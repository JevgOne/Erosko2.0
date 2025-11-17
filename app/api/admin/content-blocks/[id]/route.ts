import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * GET /api/admin/content-blocks/[id]
 * Get single content block
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const block = await prisma.contentBlock.findUnique({
      where: { id },
    });

    if (!block) {
      return NextResponse.json({ success: false, error: 'Block not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: block,
    });
  } catch (error: any) {
    console.error('Content Block GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/content-blocks/[id]
 * Update content block
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Check if block exists
    const existing = await prisma.contentBlock.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Block not found' }, { status: 404 });
    }

    // Build update data (identifier cannot be changed)
    const updateData: any = {};
    if (body.type !== undefined) updateData.type = body.type;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.data !== undefined) updateData.data = body.data;
    if (body.page !== undefined) updateData.page = body.page;
    if (body.section !== undefined) updateData.section = body.section;
    if (body.published !== undefined) updateData.published = body.published;
    if (body.order !== undefined) updateData.order = body.order;

    // Update block
    const block = await prisma.contentBlock.update({
      where: { id },
      data: updateData,
    });

    // Revalidate pages so changes appear immediately
    revalidatePath(`/${existing.page}`);
    if (body.page && body.page !== existing.page) {
      revalidatePath(`/${body.page}`);
    }
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      data: block,
    });
  } catch (error: any) {
    console.error('Content Block PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/content-blocks/[id]
 * Delete content block
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if block exists
    const existing = await prisma.contentBlock.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Block not found' }, { status: 404 });
    }

    // Delete block
    await prisma.contentBlock.delete({
      where: { id },
    });

    // Revalidate the page
    revalidatePath(`/${existing.page}`);
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: 'Content block deleted',
    });
  } catch (error: any) {
    console.error('Content Block DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
