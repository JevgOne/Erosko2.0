#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const phone = '+420777000000';
  const email = 'admin@erosko.cz';
  const password = 'admin123';

  console.log('\n🔐 Creating admin user...\n');

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { phone },
        { email },
      ],
    },
  });

  if (existing) {
    console.log('✅ Admin user already exists:');
    console.log(`   ID: ${existing.id}`);
    console.log(`   Email: ${existing.email}`);
    console.log(`   Phone: ${existing.phone}`);
    console.log(`   Role: ${existing.role}\n`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      phone,
      email,
      passwordHash,
      role: 'ADMIN',
      phoneVerified: true,
      emailVerified: true,
    },
  });

  console.log('✅ Admin user created!');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password: ${password}\n`);
}

createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
