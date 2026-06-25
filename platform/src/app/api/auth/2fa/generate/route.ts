import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a secure secret
    const secret = speakeasy.generateSecret({
      name: `DevFort (${session.user.email})`,
    });

    if (!secret.otpauth_url) {
      throw new Error('Failed to generate otpauth_url');
    }

    // Convert the URL into a QR Code image Data URI
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    return NextResponse.json({
      secret: secret.base32,
      qrCodeDataUrl,
    });
  } catch (error) {
    console.error('2FA Generate Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
