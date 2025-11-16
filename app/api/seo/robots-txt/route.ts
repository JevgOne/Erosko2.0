import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const ROBOTS_TXT_PATH = path.join(process.cwd(), 'public', 'robots.txt');

// GET - Fetch current robots.txt
export async function GET() {
  try {
    let content = '';

    if (fs.existsSync(ROBOTS_TXT_PATH)) {
      content = fs.readFileSync(ROBOTS_TXT_PATH, 'utf-8');
    } else {
      // Default content
      content = `# robots.txt for Erosko.cz

User-agent: *
Allow: /

# Sitemaps
Sitemap: https://erosko.cz/sitemap.xml

# Block admin areas
Disallow: /admin_panel/
Disallow: /api/
`;
    }

    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error('Get robots.txt error:', error);
    return NextResponse.json({ success: false, error: 'Failed to read robots.txt' }, { status: 500 });
  }
}

// POST - Save robots.txt
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }

    // Ensure public directory exists
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(ROBOTS_TXT_PATH, content, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'robots.txt saved successfully',
    });
  } catch (error) {
    console.error('Save robots.txt error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save robots.txt' }, { status: 500 });
  }
}
