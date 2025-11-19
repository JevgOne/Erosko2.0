import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testContentBlock() {
  try {
    console.log('\n📝 Creating test content block...\n');

    // Create a test block for homepage > main section
    const block = await prisma.contentBlock.create({
      data: {
        identifier: `test-homepage-main-${Date.now()}`,
        title: 'Test Block - Hlavní Sekce',
        content: '<h2>Test Nadpis</h2><p>Toto je testovací content block. Pokud vidíš tento text na homepage mezi Categories a Trust Signals, znamená to, že systém funguje!</p>',
        page: 'homepage',
        section: 'main',
        type: 'RICH_TEXT',
        published: true,
        order: 0,
      },
    });

    console.log('✅ Block created:');
    console.log(`   ID: ${block.id}`);
    console.log(`   Title: ${block.title}`);
    console.log(`   Page: ${block.page}`);
    console.log(`   Section: ${block.section}`);
    console.log(`   Published: ${block.published}`);
    console.log(`\n🌐 Check erosko.cz homepage to see if it appears!\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testContentBlock();
