import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import 'dotenv/config';

const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

const prisma = new PrismaClient({ adapter });

async function checkAdmin() {
  try {
    console.log('Connecting to Turso...');
    console.log('URL:', process.env.TURSO_DATABASE_URL?.substring(0, 40) + '...');
    
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@erosko.cz' }
    });
    
    console.log('\nAdmin user:', admin ? {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      hasPassword: !!admin.passwordHash
    } : 'NOT FOUND ❌');
    
    const allUsers = await prisma.user.count();
    console.log('\nTotal users in database:', allUsers);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
