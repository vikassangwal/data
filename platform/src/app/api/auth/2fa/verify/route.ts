import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import speakeasy from 'speakeasy';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, secret } = await req.json();

    if (!code || !secret) {
      return NextResponse.json({ error: 'Code and secret are required' }, { status: 400 });
    }

    // Verify the TOTP code against the secret
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1, // Allow 1 step (30 seconds) before or after
    });

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 400 });
    }

    // If valid, save the secret to the user's database record and enable 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: true,
      },
    });

    return NextResponse.json({ success: true, message: 'Two-Factor Authentication enabled successfully' });
  } catch (error) {
    console.error('2FA Verify Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
