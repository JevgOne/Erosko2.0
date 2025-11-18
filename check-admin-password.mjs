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

async function checkAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@erosko.cz' }
    });
    
    if (!admin) {
      console.log('❌ Admin NOT found in database');
      return;
    }
    
    console.log('✅ Admin found:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      hasPassword: !!admin.passwordHash,
      passwordHashLength: admin.passwordHash?.length
    });
    
    // Test password
    const testPassword = 'erosko2024admin';
    const isValid = await bcrypt.compare(testPassword, admin.passwordHash);
    
    console.log('\n🔐 Password test:');
    console.log('Testing password:', testPassword);
    console.log('Result:', isValid ? '✅ VALID' : '❌ INVALID');
    
    if (!isValid) {
      console.log('\n🔧 Fixing password...');
      const newHash = await bcrypt.hash(testPassword, 10);
      await prisma.user.update({
        where: { id: admin.id },
        data: { passwordHash: newHash }
      });
      console.log('✅ Password updated!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
