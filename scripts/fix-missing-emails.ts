import prisma from '../lib/prisma';

async function fixMissingEmails() {
  try {
    console.log('Finding users without email...');

    const usersWithoutEmail = await prisma.user.findMany({
      where: {
        OR: [
          { email: null },
          { email: '' }
        ]
      }
    });

    console.log(`Found ${usersWithoutEmail.length} users without email`);

    for (const user of usersWithoutEmail) {
      // Generate email from phone: +420777888999 -> user777888999@erosko.cz
      const emailUsername = user.phone.replace(/\+/g, '').replace(/\s/g, '');
      const generatedEmail = `user${emailUsername}@erosko.cz`;

      await prisma.user.update({
        where: { id: user.id },
        data: { email: generatedEmail }
      });

      console.log(`✅ Updated user ${user.id}: ${user.phone} -> ${generatedEmail}`);
    }

    console.log('\n✨ Done! All users now have emails.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

fixMissingEmails();
