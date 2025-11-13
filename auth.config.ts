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
        phone: { label: 'Telefon', type: 'tel' },
        password: { label: 'Heslo', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          return null;
        }

        // Normalize phone number
        const normalizedPhone = normalizePhoneNumber(credentials.phone as string);

        const user = await prisma.user.findUnique({
          where: {
            phone: normalizedPhone,
          },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

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
