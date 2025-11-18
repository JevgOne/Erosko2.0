import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Security: Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists. This endpoint can only be used once.' },
        { status: 403 }
      );
    }

    // Get password from request body
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create admin user
    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.ADMIN,
        phone: '+420000000000', // Dummy phone for admin
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      {
        error: 'Failed to create admin',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
