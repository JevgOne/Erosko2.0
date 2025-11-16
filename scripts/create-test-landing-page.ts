import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function createTestLandingPage() {
  console.log('🚀 Creating test landing page...\n');

  const testPage = {
    path: '/holky-na-sex',
    type: 'CATEGORY',
    seoTitle: 'Holky na sex Praha | Ověřené Profily | EROSKO.CZ',
    seoDescription: 'Nejlepší holky na sex v Praze. Ověřené profily, diskrétní kontakt bez zprostředkovatele. Přímý kontakt s dívkami pro erotické služby.',
    h1: 'Holky na sex Praha',
    content: `
      <h2>Holky na sex v Praze</h2>
      <p>Vítejte na největším portálu pro erotické služby v Praze. Najdete zde stovky ověřených profilů holek na sex, které nabízejí diskrétní a profesionální služby.</p>

      <h3>Proč EROSKO.CZ?</h3>
      <ul>
        <li>✓ Ověřené profily bez podvodů</li>
        <li>✓ Přímý kontakt bez zprostředkovatele</li>
        <li>✓ Diskrétnost zaručena</li>
        <li>✓ Nejnovější nabídky každý den</li>
      </ul>

      <h3>Jak to funguje?</h3>
      <ol>
        <li>Prohlédněte si profily dívek níže</li>
        <li>Vyberte si profil který se vám líbí</li>
        <li>Kontaktujte dívku přímo přes telefon nebo WhatsApp</li>
        <li>Domluvte si schůzku</li>
      </ol>

      <p>Všechny profily na EROSKO.CZ jsou ověřené a nabízejí profesionální erotické služby v Praze a okolí.</p>
    `,
    keywords: 'holky na sex praha, sex holky, společnice praha, erotické služby praha, sex inzeráty, escort praha, privát praha, erotika praha, sex rande, holky na telefon, erotické masáže, tantra praha',
    ogImageUrl: 'https://erosko.cz/api/seo/generate-og-image?name=Holky na sex&city=Praha&category=HOLKY_NA_SEX',
    published: true,
  };

  try {
    // Check if page already exists
    const existing = await client.execute({
      sql: 'SELECT * FROM StaticPage WHERE path = ?',
      args: [testPage.path],
    });

    if (existing.rows.length > 0) {
      console.log('⚠️  Landing page already exists:', testPage.path);
      console.log('   Updating...');

      await client.execute({
        sql: `UPDATE StaticPage SET
          seoTitle = ?,
          seoDescription = ?,
          h1 = ?,
          content = ?,
          keywords = ?,
          ogImageUrl = ?,
          published = ?,
          updatedAt = ?
        WHERE path = ?`,
        args: [
          testPage.seoTitle,
          testPage.seoDescription,
          testPage.h1,
          testPage.content,
          testPage.keywords,
          testPage.ogImageUrl,
          testPage.published ? 1 : 0,
          new Date().toISOString(),
          testPage.path,
        ],
      });

      console.log('✅ Landing page updated!');
    } else {
      // Create new page
      await client.execute({
        sql: `INSERT INTO StaticPage (
          id, path, type, seoTitle, seoDescription, h1, content, keywords, ogImageUrl, published, viewCount, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          `page-${Date.now()}`,
          testPage.path,
          testPage.type,
          testPage.seoTitle,
          testPage.seoDescription,
          testPage.h1,
          testPage.content,
          testPage.keywords,
          testPage.ogImageUrl,
          testPage.published ? 1 : 0,
          0,
          new Date().toISOString(),
          new Date().toISOString(),
        ],
      });

      console.log('✅ Landing page created!');
    }

    console.log('\n📊 Page Details:');
    console.log('   Path:', testPage.path);
    console.log('   Type:', testPage.type);
    console.log('   Title:', testPage.seoTitle);
    console.log('   URL: http://localhost:3002' + testPage.path);
    console.log('\n🎉 Success! Open the URL above to see your landing page!');
  } catch (error) {
    console.error('❌ Error creating landing page:', error);
  }
}

createTestLandingPage().catch(console.error);
