import NextAuth from 'next-auth';
import authConfig from './auth.config.edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Edge-compatible auth instance for middleware
// Uses the same JWT/session callbacks as auth.ts but without database imports
const { auth: authMiddleware } = NextAuth(authConfig);

// Redirect middleware that checks for URL redirects in database
async function redirectMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip API routes, static files, and assets
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  try {
    // Call our API to check for redirects (uses Node.js runtime with Prisma)
    const apiUrl = new URL('/api/seo/redirects/check', request.url);
    apiUrl.searchParams.set('from', pathname);

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'x-middleware-redirect-check': 'true', // Prevent infinite loops
      },
    });

    if (response.ok) {
      const data = await response.json();

      if (data.redirect) {
        const { to, type } = data.redirect;

        // Prevent redirect loops - don't redirect to the same URL
        if (to === pathname) {
          console.warn(`[Middleware] Redirect loop detected: ${pathname} → ${to}`);
          return NextResponse.next();
        }

        // Perform redirect with appropriate status code
        const redirectUrl = new URL(to, request.url);
        return NextResponse.redirect(redirectUrl, {
          status: type === 301 ? 301 : type === 307 ? 307 : 302,
        });
      }
    }
  } catch (error) {
    // If redirect check fails, continue normally
    console.error('Redirect check error:', error);
  }

  return NextResponse.next();
}

// Combine redirect and auth middleware
export default async function middleware(request: NextRequest) {
  // First check for redirects
  const redirectResponse = await redirectMiddleware(request);

  // If we got a redirect, return it immediately
  if (redirectResponse.status >= 300 && redirectResponse.status < 400) {
    return redirectResponse;
  }

  // Otherwise, run auth middleware
  // @ts-ignore - auth middleware expects Request, but we have NextRequest
  return authMiddleware(request);
}

export const config = {
  // Exclude API routes, static files, and public business pages from auth check
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|eroticke-podniky).*)',
  ],
};
