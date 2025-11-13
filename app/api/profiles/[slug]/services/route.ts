import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN
    });

    const result = await client.execute({
      sql: 'SELECT servicesJson FROM Profile WHERE slug = ?',
      args: [params.slug]
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ services: [] });
    }

    const servicesJson = result.rows[0].servicesJson;

    if (!servicesJson) {
      return NextResponse.json({ services: [] });
    }

    // Parse servicesJson if it's a string
    const services = typeof servicesJson === 'string'
      ? JSON.parse(servicesJson)
      : servicesJson;

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ services: [] }, { status: 500 });
  }
}
