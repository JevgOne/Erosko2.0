import prisma from '../lib/prisma';

async function fixMistressName() {
  console.log('🔧 Fixing Mistress Karolína name...\n');

  try {
    const updated = await prisma.profile.update({
      where: { slug: 'mistress-karolina-praha-bdsm' },
      data: {
        name: 'Karolína',
      },
    });

    console.log('✅ Updated profile:', updated.name);
    console.log('   Slug:', updated.slug);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMistressName();
