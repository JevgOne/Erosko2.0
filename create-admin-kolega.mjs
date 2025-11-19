import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production.local' });

const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

const prisma = new PrismaClient({ adapter });

async function createAdmin() {
  try {
    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'adminerosko.cz' }
    });

    if (existing) {
      console.log('⚠️  Admin už existuje, aktualizuji heslo...');

      const passwordHash = await bcrypt.hash('erosko2024admin', 10);

      await prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash }
      });

      console.log('✅ Heslo bylo aktualizováno!');
    } else {
      console.log('📝 Vytvářím nového admina...');

      const passwordHash = await bcrypt.hash('erosko2024admin', 10);

      const admin = await prisma.user.create({
        data: {
          email: 'adminerosko.cz',
          phone: '+420000000001',
          passwordHash,
          role: 'ADMIN',
        }
      });

      console.log('✅ Admin vytvořen!');
      console.log(`   Email: ${admin.email}`);
      console.log(`   ID: ${admin.id}`);
    }

    // Test password
    const user = await prisma.user.findUnique({
      where: { email: 'adminerosko.cz' }
    });

    const isValid = await bcrypt.compare('erosko2024admin', user.passwordHash);
    console.log('\n🔐 Test přihlášení:');
    console.log(`   Email: adminerosko.cz`);
    console.log(`   Heslo: erosko2024admin`);
    console.log(`   Výsledek: ${isValid ? '✅ FUNGUJE' : '❌ NEFUNGUJE'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
