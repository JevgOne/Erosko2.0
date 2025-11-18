import type { NextAuthConfig } from 'next-auth';

// Edge-compatible auth config (without database access)
// This config is used only in middleware for session validation
// Authentication logic (with database) is in auth.config.ts
export default {
  providers: [], // Providers are defined in auth.config.ts (server-side only)
  pages: {
    signIn: '/prihlaseni',
  },
  callbacks: {
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
      if (url.startsWith(baseUrl)) {
        if (url === baseUrl || url === `${baseUrl}/`) {
          return `${baseUrl}/inzerent_dashboard`;
        }
        return url;
      }
      return baseUrl;
    },
  },
} satisfies NextAuthConfig;
