import prisma from '../lib/prisma';

async function checkProfiles() {
  console.log('\n🔍 CHECKING PROFILE DATA CONSISTENCY WITH SEARCHBAR FILTERS\n');
  console.log('='.repeat(80) + '\n');

  const count = await prisma.profile.count({ where: { approved: true } });
  console.log(`✓ Total approved profiles: ${count}\n`);

  // Get profiles with filter fields
  const profiles = await prisma.profile.findMany({
    where: { approved: true },
    select: {
      name: true,
      hairColor: true,
      eyeColor: true,
      bust: true,
      bodyType: true,
      nationality: true,
      tattoos: true,
      piercing: true,
      age: true,
      height: true,
      weight: true,
    },
    take: 20
  });

  // Analyze field population
  const fieldStats: Record<string, { filled: number; null: number; values: Set<string> }> = {
    hairColor: { filled: 0, null: 0, values: new Set() },
    eyeColor: { filled: 0, null: 0, values: new Set() },
    bust: { filled: 0, null: 0, values: new Set() },
    bodyType: { filled: 0, null: 0, values: new Set() },
    nationality: { filled: 0, null: 0, values: new Set() },
    tattoos: { filled: 0, null: 0, values: new Set() },
    piercing: { filled: 0, null: 0, values: new Set() },
    age: { filled: 0, null: 0, values: new Set() },
    height: { filled: 0, null: 0, values: new Set() },
    weight: { filled: 0, null: 0, values: new Set() },
  };

  profiles.forEach(p => {
    Object.keys(fieldStats).forEach(field => {
      const value = p[field as keyof typeof p];
      if (value !== null && value !== undefined && value !== '') {
        fieldStats[field].filled++;
        fieldStats[field].values.add(String(value));
      } else {
        fieldStats[field].null++;
      }
    });
  });

  console.log('📊 FIELD POPULATION STATISTICS (based on 20 profiles):\n');
  Object.entries(fieldStats).forEach(([field, stats]) => {
    const fillPercent = Math.round((stats.filled / profiles.length) * 100);
    const emoji = fillPercent > 70 ? '✅' : fillPercent > 30 ? '⚠️ ' : '❌';
    console.log(`${emoji} ${field}:`);
    console.log(`   Filled: ${stats.filled}/${profiles.length} (${fillPercent}%)`);
    console.log(`   NULL: ${stats.null}/${profiles.length}`);
    if (stats.values.size > 0 && stats.values.size < 20) {
      console.log(`   Unique values: ${Array.from(stats.values).join(', ')}`);
    } else if (stats.values.size >= 20) {
      console.log(`   Unique values: ${stats.values.size} different values`);
    }
    console.log('');
  });

  console.log('\n📝 SEARCHBAR FILTER COMPARISON:\n');
  console.log('SearchBar offers these values:');
  console.log('  hairColor: Blond, Hnědá, Černá, Zrzavá, Jiná');
  console.log('  eyeColor: Modré, Zelené, Hnědé, Šedé, Jiné');
  console.log('  bust: 1, 2, 3, 4');
  console.log('  bodyType: Štíhlá, Atletická, Průměrná, Kulatá, Plus size');
  console.log('  nationality: Česká, Slovenská, Polská, Ukrajinská, Ruská, Asijská, Latina, Africká, Jiná');
  console.log('  tattoos: Ano, Ne, Malé');
  console.log('  piercing: Ano, Ne, Jen uši');
  console.log('  age: 18-50 range');
  console.log('  height: 150-190 range');
  console.log('  weight: 45-90 range\n');

  console.log('🔍 ACTUAL VALUES FOUND IN DATABASE:\n');
  Object.entries(fieldStats).forEach(([field, stats]) => {
    if (stats.values.size > 0 && stats.values.size < 20) {
      console.log(`  ${field}: ${Array.from(stats.values).join(', ')}`);
    } else if (stats.values.size >= 20) {
      const sample = Array.from(stats.values).slice(0, 10);
      console.log(`  ${field}: ${sample.join(', ')}... (${stats.values.size} total)`);
    } else {
      console.log(`  ${field}: [NO DATA]`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('\n⚠️  CRITICAL FINDINGS:\n');

  // Check for mismatches
  if (fieldStats.hairColor.filled === 0) {
    console.log('❌ hairColor: NO DATA - SearchBar filter will return 0 results!');
  }
  if (fieldStats.eyeColor.filled === 0) {
    console.log('❌ eyeColor: NO DATA - SearchBar filter will return 0 results!');
  }
  if (fieldStats.bodyType.filled === 0) {
    console.log('❌ bodyType: NO DATA - SearchBar filter will return 0 results!');
  }
  if (fieldStats.nationality.filled === 0) {
    console.log('❌ nationality: NO DATA - SearchBar filter will return 0 results!');
  }

  await prisma.$disconnect();
}

checkProfiles();
