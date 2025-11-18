import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load production env
dotenv.config({ path: '.env.production.local' });

const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

const prisma = new PrismaClient({ adapter });

async function createAdmin() {
  try {
    console.log('Connecting to production Turso database...');
    
    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@erosko.cz' }
    });
    
    if (existing) {
      console.log('✅ Admin already exists:', {
        id: existing.id,
        email: existing.email,
        role: existing.role
      });
      return;
    }
    
    // Create admin
    const passwordHash = await bcrypt.hash('erosko2024admin', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@erosko.cz',
        phone: '+420000000000',
        passwordHash,
        role: 'ADMIN',
      }
    });
    
    console.log('\n✅ Admin created successfully!');
    console.log({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      password: 'erosko2024admin'
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
