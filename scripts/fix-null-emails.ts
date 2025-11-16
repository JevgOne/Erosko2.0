import prisma from '../lib/prisma';

async function fixNullEmails() {
  try {
    console.log('Finding all users...');

    // Get ALL users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        phone: true,
        email: true
      }
    });

    console.log(`Total users: ${allUsers.length}`);

    for (const user of allUsers) {
      console.log(`User ${user.id}: phone=${user.phone}, email=${user.email}`);

      if (!user.email || user.email.trim() === '') {
        const emailUsername = user.phone.replace(/\+/g, '').replace(/\s/g, '').replace(/-/g, '');
        const generatedEmail = `user${emailUsername}@erosko.cz`;

        console.log(`  ⚠️  Updating user ${user.id} with email: ${generatedEmail}`);

        await prisma.user.update({
          where: { id: user.id },
          data: { email: generatedEmail }
        });

        console.log(`  ✅ Updated!`);
      }
    }

    console.log('\n✨ Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

fixNullEmails();
