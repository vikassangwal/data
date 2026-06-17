import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';
import { sendMail } from '@/lib/email';

export const dynamic = 'force-dynamic';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// REQUEST OTP
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { newEmail } = body;

    if (!newEmail || !newEmail.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) {
      return NextResponse.json({ error: 'Email is already in use by another account.' }, { status: 400 });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailChangeOtp: otp,
        emailChangeOtpExpires: expiresAt,
        newEmailRequest: newEmail,
      }
    });

    // Send real email via SMTP
    await sendMail({
      to: newEmail,
      subject: 'Verify your new email address - DevFort',
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
              <h2 style="color: #6366f1;">Email Change Request</h2>
              <p>You requested to change your email address for your DevFort account. Please use the OTP below to verify this new email address.</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1e293b; padding: 16px; background: #f8fafc; border-radius: 8px; text-align: center; margin: 24px 0;">
                ${otp}
              </div>
              <p>This code expires in 10 minutes.</p>
             </div>`,
    });

    return NextResponse.json({ success: true, message: 'OTP sent successfully to your new email.' });
  } catch (error) {
    console.error('Error generating email change OTP:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// VERIFY OTP
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { otp } = body;

    if (!otp) {
      return NextResponse.json({ error: 'OTP is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    
    if (!user || !user.emailChangeOtp || !user.emailChangeOtpExpires || !user.newEmailRequest) {
      return NextResponse.json({ error: 'No email change request found' }, { status: 400 });
    }

    if (new Date() > user.emailChangeOtpExpires) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    if (user.emailChangeOtp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Verify successful! Change email.
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        email: user.newEmailRequest,
        emailChangeOtp: null,
        emailChangeOtpExpires: null,
        newEmailRequest: null,
      }
    });

    return NextResponse.json({ success: true, message: 'Email updated successfully!' });
  } catch (error) {
    console.error('Error verifying email change OTP:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
