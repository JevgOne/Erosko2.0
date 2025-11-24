import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - List all redirects
export async function GET() {
  try {
    const redirects = await prisma.redirect.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: redirects,
    });
  } catch (error) {
    console.error('Get redirects error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch redirects' }, { status: 500 });
  }
}

// POST - Create new redirect
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { from, to, type = 301 } = body;

    if (!from || !to) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Check if redirect already exists
    const existing = await prisma.redirect.findUnique({
      where: { from },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'Redirect already exists for this path' }, { status: 400 });
    }

    const redirect = await prisma.redirect.create({
      data: {
        from,
        to,
        type,
      },
    });

    return NextResponse.json({
      success: true,
      data: redirect,
    });
  } catch (error) {
    console.error('Create redirect error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create redirect' }, { status: 500 });
  }
}
