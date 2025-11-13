// Najdi shodu mezi JSON a databází podle telefonu/jména
import { turso } from '../lib/turso';
import fs from 'fs';

async function main() {
  // Načti JSON
  const jsonData = JSON.parse(fs.readFileSync('/Users/zen/Desktop/erosko.cz/scrapers/output/dobryprivat-FINAL.json', 'utf-8'));
  console.log(`📦 JSON má ${jsonData.length} profilů\n`);

  // Vezmi první 10 z JSON
  const testProfiles = jsonData.slice(0, 10);

  let matches = 0;
  let noMatches = 0;

  for (const profile of testProfiles) {
    // Zkus najít podle telefonu
    const phoneResult = await turso.execute({
      sql: 'SELECT id, name, slug, phone FROM Profile WHERE phone = ?',
      args: [profile.phone]
    });

    if (phoneResult.rows.length > 0) {
      console.log(`✅ MATCH: ${profile.name} (${profile.phone})`);
      console.log(`   JSON slug: ${profile.slug}`);
      console.log(`   DB slug:   ${phoneResult.rows[0].slug}`);
      matches++;
    } else {
      console.log(`❌ NO MATCH: ${profile.name} (${profile.phone})`);
      noMatches++;
    }
  }

  console.log(`\n📊 Výsledky:`);
  console.log(`   ✅ Shody: ${matches}`);
  console.log(`   ❌ Žádná shoda: ${noMatches}`);
}

main().catch(console.error);
