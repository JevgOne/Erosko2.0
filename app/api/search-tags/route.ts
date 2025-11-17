import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // If category is specified, filter by it
    const where = category ? { category } : {};

    const tags = await prisma.searchTag.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
      ],
    });

    // Group tags by category
    const groupedTags = tags.reduce((acc, tag) => {
      if (!acc[tag.category]) {
        acc[tag.category] = [];
      }
      acc[tag.category].push(tag);
      return acc;
    }, {} as Record<string, typeof tags>);

    return NextResponse.json({
      tags,
      grouped: groupedTags,
    });
  } catch (error) {
    console.error('[SEARCH-TAGS] Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search tags' },
      { status: 500 }
    );
  }
}
