import prisma from '../lib/prisma';

async function checkNikola() {
  const nikola = await prisma.profile.findUnique({
    where: { slug: 'nikola-brno-escort' },
    include: { photos: true }
  });

  console.log('Nikola profil:', JSON.stringify(nikola, null, 2));
  await prisma.$disconnect();
}

checkNikola();
