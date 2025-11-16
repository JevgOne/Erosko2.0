import prisma from '../lib/prisma';

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      phone: true
    }
  });

  console.log('Users in database:', JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

checkUsers();
