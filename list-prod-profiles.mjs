import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production.local' });

const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

const prisma = new PrismaClient({ adapter });

async function listProfiles() {
  try {
    const profiles = await prisma.profile.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        approved: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('\n📋 Profily v produkční databázi:\n');
    let num = 1;
    for (const p of profiles) {
      console.log(`${num}. ${p.name} (${p.slug})`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Approved: ${p.approved}`);
      console.log(`   Created: ${p.createdAt.toISOString()}`);
      console.log('');
      num++;
    }

    console.log(`Celkem: ${profiles.length} profilů`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listProfiles();
