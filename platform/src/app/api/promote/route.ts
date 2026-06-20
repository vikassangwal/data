import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const email = 'admin@devfort.com';
    const password = 'admin';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      await prisma.user.update({
        where: { email },
        data: { role: 'SUPER-ADMIN', passwordHash }
      });
    } else {
      await prisma.user.create({
        data: {
          name: 'DevFort Admin',
          username: 'admin_devfort',
          email,
          passwordHash,
          role: 'SUPER-ADMIN',
          emailVerified: new Date(),
          termsAccepted: true,
        }
      });
    }

    // Also promote vikas just in case
    const vikas = await prisma.user.findUnique({ where: { email: 'vikas.sangwal.05@gmail.com' } });
    if (vikas) {
      await prisma.user.update({
        where: { email: 'vikas.sangwal.05@gmail.com' },
        data: { role: 'SUPER-ADMIN' }
      });
    }

    return NextResponse.json({ success: true, message: 'Admins promoted successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
