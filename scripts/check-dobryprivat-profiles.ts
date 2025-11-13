// Zkontroluj, jestli v databázi jsou profily z dobryprivat.cz
import prisma from '../lib/prisma';
import fs from 'fs';

async function main() {
  // Načti JSON
  const jsonData = JSON.parse(fs.readFileSync('/Users/zen/Desktop/erosko.cz/scrapers/output/dobryprivat-FINAL.json', 'utf-8'));
  console.log(`📦 JSON má ${jsonData.length} profilů`);

  // Vezmi první 5 slugů z JSON
  const testSlugs = jsonData.slice(0, 5).map((p: any) => p.slug);
  console.log('🔍 Testuji slugy:', testSlugs);

  // Zkontroluj, jestli jsou v databázi
  for (const slug of testSlugs) {
    const profile = await prisma.profile.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true }
    });

    if (profile) {
      console.log(`✅ ${slug} - NALEZEN v databázi`);
    } else {
      console.log(`❌ ${slug} - NENÍ v databázi`);
    }
  }

  // Celkový počet profilů v databázi
  const total = await prisma.profile.count();
  console.log(`\n📊 Celkem profilů v databázi: ${total}`);
}

main().catch(console.error);
