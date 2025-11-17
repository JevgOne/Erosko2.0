import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // Use local SQLite for development, Turso for production
  if (process.env.NODE_ENV === 'development' && process.env.USE_LOCAL_DB === 'true') {
    // Local SQLite database for development
    return new PrismaClient({
      log: ['error', 'warn', 'query'],
    });
  }

  // Use LibSQL adapter for Turso cloud database
  const adapter = new PrismaLibSQL({
    url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || '',
    authToken: process.env.TURSO_AUTH_TOKEN || '',
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
