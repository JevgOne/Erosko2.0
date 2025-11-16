import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function createStaticPageTable() {
  console.log('🚀 Creating StaticPage table in Turso...\n');

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS StaticPage (
      id TEXT PRIMARY KEY NOT NULL,
      path TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL DEFAULT 'CUSTOM',
      seoTitle TEXT NOT NULL,
      seoDescription TEXT NOT NULL,
      h1 TEXT NOT NULL,
      content TEXT DEFAULT '',
      keywords TEXT,
      ogImageUrl TEXT,
      published INTEGER NOT NULL DEFAULT 1,
      viewCount INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `;

  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS StaticPage_path_idx ON StaticPage(path)',
    'CREATE INDEX IF NOT EXISTS StaticPage_type_idx ON StaticPage(type)',
    'CREATE INDEX IF NOT EXISTS StaticPage_published_idx ON StaticPage(published)',
  ];

  try {
    // Create table
    console.log('📝 Creating table...');
    await client.execute(createTableSQL);
    console.log('✅ Table created!');

    // Create indexes
    console.log('\n📝 Creating indexes...');
    for (const indexSQL of createIndexes) {
      await client.execute(indexSQL);
    }
    console.log('✅ Indexes created!');

    // Verify
    const result = await client.execute('SELECT COUNT(*) as count FROM StaticPage');
    console.log('\n✅ Verification: Table exists with', result.rows[0].count, 'rows');
    console.log('\n🎉 Success! StaticPage table is ready!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createStaticPageTable().catch(console.error);
