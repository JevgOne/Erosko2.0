import { createClient } from '@libsql/client';

async function checkSEO() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  // Check how many profiles exist
  const profiles = await client.execute('SELECT COUNT(*) as count FROM Profile');
  console.log('📊 Total profiles:', profiles.rows[0].count);

  // Check how many have SEO
  const withSEO = await client.execute('SELECT COUNT(*) as count FROM Profile WHERE seoTitle IS NOT NULL');
  console.log('✅ Profiles with SEO:', withSEO.rows[0].count);

  // Check sample profile
  const sample = await client.execute('SELECT id, name, city, seoTitle, seoQualityScore FROM Profile LIMIT 5');
  console.log('\n📝 Sample profiles:');
  sample.rows.forEach((row: any) => {
    console.log(`  - ${row.name} (${row.city}): SEO=${row.seoTitle ? '✅' : '❌'}, Score=${row.seoQualityScore || 'N/A'}`);
  });
}

checkSEO().catch(console.error);
