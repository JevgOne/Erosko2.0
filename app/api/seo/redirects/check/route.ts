import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Check if there's a redirect for a given path
export async function GET(request: Request) {
  try {
    // Prevent infinite loops from middleware
    const isMiddlewareCheck = request.headers.get('x-middleware-redirect-check') === 'true';
    if (!isMiddlewareCheck) {
      return NextResponse.json({ redirect: null });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');

    if (!from) {
      return NextResponse.json({ redirect: null });
    }

    // Find matching redirect that's enabled
    const redirect = await prisma.redirect.findFirst({
      where: {
        from,
        enabled: true,
      },
    });

    if (!redirect) {
      return NextResponse.json({ redirect: null });
    }

    // Increment hits counter asynchronously (fire and forget)
    prisma.redirect
      .update({
        where: { id: redirect.id },
        data: { hits: { increment: 1 } },
      })
      .catch((error) => console.error('Failed to increment redirect hits:', error));

    return NextResponse.json({
      redirect: {
        to: redirect.to,
        type: redirect.type,
      },
    });
  } catch (error) {
    console.error('Redirect check error:', error);
    return NextResponse.json({ redirect: null }, { status: 500 });
  }
}
