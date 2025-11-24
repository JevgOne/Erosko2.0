import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT - Update redirect
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { from, to, type, enabled } = body;

    const updateData: any = {};
    if (from !== undefined) updateData.from = from;
    if (to !== undefined) updateData.to = to;
    if (type !== undefined) updateData.type = type;
    if (enabled !== undefined) updateData.enabled = enabled;

    const redirect = await prisma.redirect.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: redirect,
    });
  } catch (error) {
    console.error('Update redirect error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update redirect' }, { status: 500 });
  }
}

// DELETE - Delete redirect
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.redirect.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete redirect error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete redirect' }, { status: 500 });
  }
}
