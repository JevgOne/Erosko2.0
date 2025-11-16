import prisma from '../lib/prisma';

async function main() {
  console.log('🔍 Kontroluji admin uživatele...\n');

  try {
    // Check for admin users
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    console.log(`📊 Počet admin uživatelů: ${admins.length}\n`);

    if (admins.length === 0) {
      console.log('❌ Žádný admin uživatel nenalezen!');
      console.log('   Potřebuješ vytvořit admin účet.');
    } else {
      console.log('✅ Admin uživatelé:');
      admins.forEach((admin, i) => {
        console.log(`\n${i + 1}. ${admin.email || admin.phone}`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Vytvořen: ${admin.createdAt}`);
      });
    }

    // Check total profiles count
    const profileCount = await prisma.profile.count();
    console.log(`\n📦 Celkem profilů v databázi: ${profileCount}`);

  } catch (error) {
    console.error('❌ Chyba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
