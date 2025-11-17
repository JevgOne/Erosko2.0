import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * GET /api/admin/content-blocks
 * List all content blocks
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');

    const where: any = {};
    if (page && page !== 'all') {
      where.page = page;
    }

    const blocks = await prisma.contentBlock.findMany({
      where,
      orderBy: [
        { page: 'asc' },
        { section: 'asc' },
        { order: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: blocks,
    });
  } catch (error: any) {
    console.error('Content Blocks GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/content-blocks
 * Create new content block
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      identifier,
      type,
      title,
      content,
      data,
      page,
      section,
      published,
      order,
    } = body;

    // Validation
    if (!identifier || !type || !title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (identifier, type, title)' },
        { status: 400 }
      );
    }

    // Check if identifier already exists
    const existing = await prisma.contentBlock.findUnique({
      where: { identifier },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Identifier already exists' },
        { status: 400 }
      );
    }

    // Create block
    const block = await prisma.contentBlock.create({
      data: {
        identifier,
        type,
        title,
        content: content || '',
        data: data || '',
        page: page || 'homepage',
        section: section || '',
        published: published !== false,
        order: order || 0,
      },
    });

    // Revalidate the page so changes appear immediately
    revalidatePath(`/${page || 'homepage'}`);
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      data: block,
    });
  } catch (error: any) {
    console.error('Content Blocks POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
