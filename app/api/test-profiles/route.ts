import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Simple test endpoint without authentication
export async function GET() {
  try {
    console.log('[TEST] Fetching profile count...');

    const count = await prisma.profile.count();
    console.log('[TEST] Profile count:', count);

    const profiles = await prisma.profile.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        city: true,
        age: true,
      }
    });

    console.log('[TEST] Sample profiles:', profiles);

    return NextResponse.json({
      success: true,
      count,
      samples: profiles,
      message: 'Database connection works!'
    });
  } catch (error) {
    console.error('[TEST] Error:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
      message: 'Database connection failed!'
    }, { status: 500 });
  }
}
