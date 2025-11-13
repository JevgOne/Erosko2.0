// Zkontroluj, jestli v databázi jsou profily z dobryprivat.cz
import { turso } from '../lib/turso';
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
    const result = await turso.execute({
      sql: 'SELECT id, name, slug FROM Profile WHERE slug = ?',
      args: [slug]
    });

    if (result.rows.length > 0) {
      console.log(`✅ ${slug} - NALEZEN v databázi`);
    } else {
      console.log(`❌ ${slug} - NENÍ v databázi`);
    }
  }

  // Celkový počet profilů v databázi
  const total = await turso.execute('SELECT COUNT(*) as count FROM Profile');
  console.log(`\n📊 Celkem profilů v databázi: ${total.rows[0].count}`);
}

main().catch(console.error);
