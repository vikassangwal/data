import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature found' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const notes = paymentEntity.notes;

      // Update payment log
      await prisma.paymentLog.updateMany({
        where: { transactionId: orderId },
        data: {
          paymentStatus: 'SUCCESS',
          paymentDate: new Date(),
        }
      });

      // Upgrade user plan
      if (notes && notes.userId && notes.planId) {
        await prisma.user.update({
          where: { id: notes.userId },
          data: {
            planId: notes.planId,
          }
        });

        await prisma.subscriptionLog.create({
          data: {
            userId: notes.userId,
            action: 'ACTIVATED',
            planName: notes.planId,
          }
        });
      }
    } else if (event.event === 'payment.failed') {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      
      await prisma.paymentLog.updateMany({
        where: { transactionId: orderId },
        data: {
          paymentStatus: 'FAILED',
        }
      });
    } else if (event.event === 'subscription.cancelled' || event.event === 'subscription.halted') {
      const subEntity = event.payload.subscription.entity;
      const notes = subEntity.notes;
      
      if (notes && notes.userId) {
        // Downgrade back to trial/free
        await prisma.user.update({
          where: { id: notes.userId },
          data: { planId: 'trial' }
        });

        await prisma.subscriptionLog.create({
          data: {
            userId: notes.userId,
            action: 'CANCELED',
            planName: 'trial',
          }
        });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    console.error('Webhook Error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
