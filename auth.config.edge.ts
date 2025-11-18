import type { NextAuthConfig } from 'next-auth';

// Edge-compatible auth config (without database access)
// This config is used only in middleware for session validation
// Authentication logic (with database) is in auth.config.ts
// IMPORTANT: callbacks and session strategy must match auth.config.ts EXACTLY
export default {
  providers: [], // Providers are defined in auth.config.ts (server-side only)
  pages: {
    signIn: '/prihlaseni',
  },
  session: {
    strategy: 'jwt', // MUST match auth.config.ts
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    // These callbacks MUST be identical to auth.config.ts
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Check if user just logged in
      if (url.startsWith(baseUrl)) {
        // If returning to callback, redirect based on role
        if (url === baseUrl || url === `${baseUrl}/`) {
          return `${baseUrl}/inzerent_dashboard`;
        }
        return url;
      }
      return baseUrl;
    },
  },
} satisfies NextAuthConfig;
