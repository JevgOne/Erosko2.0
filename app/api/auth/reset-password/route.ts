import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyCode, normalizePhoneNumber } from '@/lib/sms';
import { validatePassword } from '@/lib/validation';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { phone, verificationCode, newPassword } = await request.json();

    if (!phone || !verificationCode || !newPassword) {
      return NextResponse.json(
        { error: 'Všechna pole jsou povinná' },
        { status: 400 }
      );
    }

    // Use the same password validation as registration
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phone);

    // Verify the code one more time
    const codeVerification = await verifyCode(
      normalizedPhone,
      verificationCode,
      'PASSWORD_RESET'
    );

    if (!codeVerification.valid) {
      return NextResponse.json(
        { error: 'Neplatný nebo expirovaný ověřovací kód' },
        { status: 400 }
      );
    }

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Uživatel s tímto telefonním číslem nebyl nalezen' },
        { status: 404 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        phoneVerified: true, // Mark phone as verified
      },
    });

    // Delete all verification codes for this phone (cleanup)
    await prisma.verificationCode.deleteMany({
      where: { phone: normalizedPhone },
    });

    return NextResponse.json({
      success: true,
      message: 'Heslo bylo úspěšně změněno',
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Chyba serveru při změně hesla' },
      { status: 500 }
    );
  }
}
