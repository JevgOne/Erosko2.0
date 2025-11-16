// Fix Praha locations - use location field from eroguide data
import prisma from '../lib/prisma';
import fs from 'fs';

async function main() {
  console.log('🔧 Opravuji lokace Praha...\n');

  // Load eroguide data
  const eroguideData = JSON.parse(
    fs.readFileSync('/Users/zen/Desktop/eroguide-complete.json', 'utf-8')
  );

  console.log(`📦 Načteno ${eroguideData.length} profilů z eroguide\n`);

  let updated = 0;
  let notFound = 0;
  let skipped = 0;

  for (const profileData of eroguideData) {
    // Only process Praha profiles
    if (profileData.city !== 'Praha') {
      continue;
    }

    // Find profile by slug
    const profile = await prisma.profile.findUnique({
      where: { slug: profileData.slug },
    });

    if (!profile) {
      notFound++;
      continue;
    }

    // Skip if already has specific location
    if (profile.location && profile.location !== 'Praha' && profile.location.startsWith('Praha ')) {
      skipped++;
      continue;
    }

    // Update location
    const newLocation = profileData.location || profileData.address || 'Praha';

    await prisma.profile.update({
      where: { id: profile.id },
      data: { location: newLocation },
    });

    console.log(`  ✓ ${profile.name}: ${profile.location} → ${newLocation}`);
    updated++;
  }

  console.log(`\n📊 VÝSLEDKY:`);
  console.log(`   Aktualizováno: ${updated} profilů`);
  console.log(`   Přeskočeno (už má správnou lokaci): ${skipped}`);
  console.log(`   Nenalezeno v databázi: ${notFound}\n`);

  // Show distribution
  const locations = await prisma.profile.groupBy({
    by: ['location'],
    where: { city: 'Praha' },
    _count: true,
  });

  console.log('📍 DISTRIBUCE LOKACÍ PRAHA:');
  locations.sort((a, b) => b._count - a._count).forEach((loc: any) => {
    console.log(`   ${loc.location}: ${loc._count} profilů`);
  });

  console.log('\n✨ Hotovo!\n');
}

main()
  .catch((error) => {
    console.error('❌ Chyba:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
