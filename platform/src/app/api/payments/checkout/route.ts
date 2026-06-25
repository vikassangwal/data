import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { auth } from '@/auth';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, amount, currency = 'INR' } = await req.json();

    if (!planId || !amount) {
      return NextResponse.json({ error: 'Missing planId or amount' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    // Amount should be in smallest unit (paise)
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: `rcpt_${Date.now()}_${session.user.id.substring(0, 5)}`,
      notes: {
        userId: session.user.id,
        planId: planId,
      },
    };

    const order = await razorpay.orders.create(options);

    // Save pending payment log
    await prisma.paymentLog.create({
      data: {
        userId: session.user.id,
        planName: planId,
        amount: amount,
        currency,
        gatewayUsed: 'Razorpay',
        transactionId: order.id,
        paymentStatus: 'PENDING',
      }
    });

    return NextResponse.json({ order });
  } catch (err: any) {
    console.error('Razorpay Checkout Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create order' }, { status: 500 });
  }
}
