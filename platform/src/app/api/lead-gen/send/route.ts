import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { targetEmail, subject, body, auditId } = await req.json();

    if (!targetEmail || !subject || !body) {
      return NextResponse.json({ error: 'Missing required email fields' }, { status: 400 });
    }

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT || '587';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user;

    if (!host || !user || !pass) {
      return NextResponse.json({ error: 'SMTP credentials are not configured in .env' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: port === '465',
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"${from}" <${user}>`,
      to: targetEmail,
      subject: subject,
      text: body,
      // html: body.replace(/\n/g, '<br>') // Optional HTML version
    });

    // Mark email as sent in DB
    try {
      if (auditId && !auditId.startsWith('temp-')) {
        await db.outreachEmail.updateMany({
          where: { auditId },
          data: { status: 'SENT', sentAt: new Date(), targetEmail }
        });
      }
    } catch (e) {
      console.warn('Failed to update email status in DB', e);
    }

    return NextResponse.json({ success: true, messageId: info.messageId });

  } catch (error: any) {
    console.error('Lead Gen Send Email Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
