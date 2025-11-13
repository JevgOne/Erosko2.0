// Porovnání slugů v databázi vs JSON
import { turso } from '../lib/turso';
import fs from 'fs';

async function main() {
  // Načti slugy z databáze
  const dbResult = await turso.execute('SELECT slug FROM Profile LIMIT 10');
  const dbSlugs = dbResult.rows.map((r: any) => r.slug);

  // Načti slugy z JSON
  const jsonData = JSON.parse(fs.readFileSync('/Users/zen/Desktop/erosko.cz/scrapers/output/dobryprivat-FINAL.json', 'utf-8'));
  const jsonSlugs = jsonData.slice(0, 10).map((p: any) => p.slug);

  console.log('📋 Slugy v databázi:', dbSlugs);
  console.log('\n📦 Slugy v JSON:', jsonSlugs);

  // Najdi průniky
  const matches = dbSlugs.filter((slug: string) => jsonSlugs.includes(slug));
  console.log('\n✅ Shody:', matches.length);
}

main().catch(console.error);
