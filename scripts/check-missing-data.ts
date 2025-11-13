import { turso } from '../lib/turso';

async function main() {
  // Count profiles without physical attributes
  const missingHeight = await turso.execute('SELECT COUNT(*) as count FROM Profile WHERE height IS NULL');
  const missingWeight = await turso.execute('SELECT COUNT(*) as count FROM Profile WHERE weight IS NULL');
  const missingBust = await turso.execute('SELECT COUNT(*) as count FROM Profile WHERE bust IS NULL OR bust = ""');

  // Count Prague profiles without specific district
  const missingDistrict = await turso.execute(`
    SELECT COUNT(*) as count FROM Profile
    WHERE city = 'Praha'
    AND (location = 'Praha' OR location IS NULL)
  `);

  console.log('📊 Chybějící data:');
  console.log(`   ⚖️  Váha: ${missingWeight.rows[0].count} profilů`);
  console.log(`   📏 Výška: ${missingHeight.rows[0].count} profilů`);
  console.log(`   👙 Prsa: ${missingBust.rows[0].count} profilů`);
  console.log(`   📍 Praha bez konkrétní části: ${missingDistrict.rows[0].count} profilů`);
}

main().catch(console.error);
