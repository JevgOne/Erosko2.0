import { createClient } from '@libsql/client';

async function migrateSEO() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  console.log('🔄 Adding SEO fields to Profile table...');

  const commands = [
    // Profile SEO fields
    'ALTER TABLE Profile ADD COLUMN seoTitle TEXT',
    'ALTER TABLE Profile ADD COLUMN seoDescription TEXT',
    'ALTER TABLE Profile ADD COLUMN seoDescriptionA TEXT',
    'ALTER TABLE Profile ADD COLUMN seoDescriptionB TEXT',
    'ALTER TABLE Profile ADD COLUMN seoDescriptionC TEXT',
    'ALTER TABLE Profile ADD COLUMN seoKeywords TEXT',
    'ALTER TABLE Profile ADD COLUMN seoQualityScore INTEGER',
    'ALTER TABLE Profile ADD COLUMN ogImageUrl TEXT',
    'ALTER TABLE Profile ADD COLUMN seoManualOverride INTEGER DEFAULT 0',
    'ALTER TABLE Profile ADD COLUMN seoLastGenerated TEXT',
    'ALTER TABLE Profile ADD COLUMN seoLastReviewed TEXT',
    'ALTER TABLE Profile ADD COLUMN seoActiveVariant TEXT DEFAULT "A"',
    'ALTER TABLE Profile ADD COLUMN seoVariantStats TEXT',

    // Business SEO fields
    'ALTER TABLE Business ADD COLUMN seoTitle TEXT',
    'ALTER TABLE Business ADD COLUMN seoDescription TEXT',
    'ALTER TABLE Business ADD COLUMN seoKeywords TEXT',
    'ALTER TABLE Business ADD COLUMN seoQualityScore INTEGER',
    'ALTER TABLE Business ADD COLUMN ogImageUrl TEXT',
    'ALTER TABLE Business ADD COLUMN seoManualOverride INTEGER DEFAULT 0',
    'ALTER TABLE Business ADD COLUMN seoLastGenerated TEXT',

    // Photo ALT quality
    'ALTER TABLE Photo ADD COLUMN altQualityScore INTEGER',
  ];

  for (const cmd of commands) {
    try {
      await client.execute(cmd);
      console.log('✅', cmd.substring(0, 50) + '...');
    } catch (error: any) {
      if (error.message?.includes('duplicate column')) {
        console.log('⏭️  Column already exists, skipping');
      } else {
        console.error('❌', error.message);
      }
    }
  }

  console.log('\n🎉 Migration complete!');
}

migrateSEO().catch(console.error);
