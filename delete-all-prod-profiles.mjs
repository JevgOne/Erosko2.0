import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production.local' });

const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

const prisma = new PrismaClient({ adapter });

async function deleteAllProfiles() {
  try {
    // First, get count
    const count = await prisma.profile.count();
    console.log(`\n🗑️  Preparing to delete ${count} profiles from production database...\n`);

    // Delete all profiles (CASCADE will delete related photos, services, reviews, etc.)
    const result = await prisma.profile.deleteMany({});

    console.log(`✅ Successfully deleted ${result.count} profiles`);
    console.log('✅ All related data (photos, services, reviews) was automatically deleted via CASCADE');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllProfiles();
