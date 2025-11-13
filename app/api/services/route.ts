import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let services;

    if (category) {
      // Filter services by category
      services = await prisma.service.findMany({
        where: {
          category: category as any,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } else {
      // Get all services
      services = await prisma.service.findMany({
        orderBy: {
          name: 'asc',
        },
      });
    }

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Chyba při načítání služeb' }, { status: 500 });
  }
}
