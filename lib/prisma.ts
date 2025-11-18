import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  console.log('[Prisma] Creating Prisma client...', {
    nodeEnv: process.env.NODE_ENV,
    useLocalDb: process.env.USE_LOCAL_DB,
    hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
    hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
    hasDbUrl: !!process.env.DATABASE_URL,
  });

  // Use local SQLite for development, Turso for production
  if (process.env.NODE_ENV === 'development' && process.env.USE_LOCAL_DB === 'true') {
    console.log('[Prisma] Using local SQLite database');
    // Local SQLite database for development
    return new PrismaClient({
      log: ['error', 'warn', 'query'],
    });
  }

  // Use LibSQL adapter for Turso cloud database
  const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || '';
  const tursoToken = process.env.TURSO_AUTH_TOKEN || '';

  if (!tursoUrl) {
    throw new Error('[Prisma] TURSO_DATABASE_URL or DATABASE_URL is not set!');
  }

  if (!tursoToken && tursoUrl.includes('turso.io')) {
    throw new Error('[Prisma] TURSO_AUTH_TOKEN is required for Turso database!');
  }

  console.log('[Prisma] Using LibSQL adapter for Turso:', {
    url: tursoUrl.substring(0, 30) + '...',
    hasToken: !!tursoToken,
  });

  const adapter = new PrismaLibSQL({
    url: tursoUrl,
    authToken: tursoToken,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
