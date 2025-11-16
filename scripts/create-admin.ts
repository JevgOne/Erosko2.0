// Create or update admin user
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  console.log('👑 Creating admin user...\n');

  try {
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Update existing user or create new one
    const admin = await prisma.user.upsert({
      where: { phone: '+420777888999' },
      update: {
        role: 'ADMIN',
        email: 'admin@erosko.cz',
        phoneVerified: true,
      },
      create: {
        phone: '+420777888999',
        email: 'admin@erosko.cz',
        passwordHash,
        phoneVerified: true,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user ready!');
    console.log('\n📋 Credentials:');
    console.log('   Phone: +420777888999');
    console.log('   Email: admin@erosko.cz');
    console.log('   Password: admin123');
    console.log('   Role: ADMIN');
    console.log('\n🌐 Login at: http://localhost:3000/prihlaseni');
    console.log('   Then visit: http://localhost:3000/admin_panel');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  }
}

createAdmin()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('❌ Fatal error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
