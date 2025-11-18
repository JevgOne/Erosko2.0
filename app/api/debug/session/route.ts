import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();

    return NextResponse.json({
      hasSession: !!session,
      session: session ? {
        user: session.user,
        expires: session.expires,
      } : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get session',
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
