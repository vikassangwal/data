import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get('key');
    
    // Simple protection
    if (key !== 'devforge-secret-seed-key') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = 'vikas.sangwal.05@gmail.com';
    const password = 'Password@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'SUPER-ADMIN',
        passwordHash: hashedPassword,
        emailVerified: new Date(),
      },
      create: {
        email,
        name: 'Vikas Sangwal',
        role: 'SUPER-ADMIN',
        passwordHash: hashedPassword,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Super Admin created/updated successfully',
      email: adminUser.email,
      role: adminUser.role 
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to seed admin', details: error.message }, { status: 500 });
  }
}
