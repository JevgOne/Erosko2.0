import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production.local' });

const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

const prisma = new PrismaClient({ adapter });

async function deleteAllBusinesses() {
  try {
    // First, get count
    const count = await prisma.business.count();
    console.log(`\n🗑️  Preparing to delete ${count} businesses from production database...\n`);

    // Delete all businesses (CASCADE will delete related photos, profiles, reviews, etc.)
    const result = await prisma.business.deleteMany({});

    console.log(`✅ Successfully deleted ${result.count} businesses`);
    console.log('✅ All related data (photos, reviews) was automatically deleted via CASCADE');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllBusinesses();
