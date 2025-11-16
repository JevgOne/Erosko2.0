import prisma from '../lib/prisma';

async function checkServices() {
  const services = await prisma.service.findMany({
    orderBy: { category: 'asc' },
  });

  console.log('📋 Services in database:', services.length);
  console.log(JSON.stringify(services, null, 2));

  await prisma.$disconnect();
}

checkServices();
