import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function resetAdminPassword() {
  try {
    console.log('Resetting admin password...');

    // Find admin user
    const admin = await prisma.user.findFirst({
      where: {
        phone: '+420777888999',
      },
    });

    if (!admin) {
      console.error('Admin user not found!');
      process.exit(1);
    }

    console.log('Admin found:', admin.id, admin.email);

    // Hash new password
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        passwordHash: hashedPassword,
      },
    });

    console.log('✅ Password reset successfully!');
    console.log('New credentials:');
    console.log('  Phone: +420777888999');
    console.log('  Email: admin@erosko.cz');
    console.log('  Password: admin123');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

resetAdminPassword();
