import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { normalizePhoneNumber } from '@/lib/phone-utils';

export default {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Heslo', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[AUTH] Login attempt for:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing credentials');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user) {
          console.log('[AUTH] User not found:', credentials.email);
          return null;
        }

        if (!user.passwordHash) {
          console.log('[AUTH] User has no password hash');
          return null;
        }

        console.log('[AUTH] User found, checking password...');
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        console.log('[AUTH] Password valid:', isPasswordValid);

        if (!isPasswordValid) {
          return null;
        }

        console.log('[AUTH] Login successful for:', user.email);
        return {
          id: user.id,
          phone: user.phone,
          email: user.email || '',
          role: user.role,
        };
      },
    }),
  ],
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
