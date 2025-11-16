// Add category column to Service table
import prisma from '../lib/prisma';

async function main() {
  console.log('🔧 Adding category column to Service table...\n');

  try {
    // Use raw SQL to add the column
    await prisma.$executeRaw`
      ALTER TABLE Service ADD COLUMN category TEXT NOT NULL DEFAULT 'PRAKTIKY';
    `;

    console.log('✅ Column added successfully!\n');

    // Verify
    const service = await prisma.$queryRaw`SELECT * FROM Service LIMIT 1;`;
    console.log('Sample service:', service);

  } catch (error: any) {
    if (error.message.includes('duplicate column')) {
      console.log('⚠️  Column already exists, skipping...\n');
    } else {
      throw error;
    }
  }

  console.log('✨ Done!\n');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
