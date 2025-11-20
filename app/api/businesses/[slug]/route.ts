import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentDomain } from '@/lib/domain-utils';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const domain = getCurrentDomain();
    const business = await prisma.business.findUnique({
      where: {
        slug_domain: {
          slug: params.slug,
          domain
        }
      },
      include: {
        photos: {
          orderBy: {
            order: 'asc',
          },
        },
        profiles: {
          where: {
            approved: true,
          },
          include: {
            photos: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();

    // Check if this is a view tracking request
    if (body.action === 'track_view') {
      const domain = getCurrentDomain();
      await prisma.business.update({
        where: {
          slug_domain: {
            slug: params.slug,
            domain
          }
        },
        data: {
          viewCount: {
            increment: 1
          }
        }
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
