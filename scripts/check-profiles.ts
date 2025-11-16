import prisma from '../lib/prisma';

async function checkProfiles() {
  const count = await prisma.profile.count({ where: { approved: true } });
  console.log('Počet approved profilů:', count);

  const profiles = await prisma.profile.findMany({
    where: { approved: true },
    select: { name: true, slug: true },
    orderBy: { createdAt: 'desc' }
  });

  profiles.forEach(p => console.log('-', p.name, '(' + p.slug + ')'));
  await prisma.$disconnect();
}

checkProfiles();
