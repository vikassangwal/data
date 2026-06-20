import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'vikas.sangwal.05@gmail.com',
        pass: 'bjmcrensqyfqjyyt',
      },
    });

    const info = await transporter.sendMail({
      from: '"DevFort Team" <vikas.sangwal.05@gmail.com>',
      to: 'vikas.sangwal.05@gmail.com',
      subject: 'Vercel Diagnostic Test',
      html: '<p>This is a diagnostic test from the Vercel server.</p>',
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack });
  }
}
