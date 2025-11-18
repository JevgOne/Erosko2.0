import NextAuth from 'next-auth';
import authConfig from './auth.config.edge';

// Edge-compatible auth instance for middleware
// Uses the same JWT/session callbacks as auth.ts but without database imports
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Exclude API routes, static files, and public business pages from auth check
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|eroticke-podniky).*)',
  ],
};
