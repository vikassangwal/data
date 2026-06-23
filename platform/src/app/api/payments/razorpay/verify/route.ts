import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planId,
      amount
    } = body;

    // Get keys
    const integration = await prisma.apiIntegration.findUnique({
      where: { providerName: 'razorpay' }
    });

    const key_secret = integration?.baseUrl || '';

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(text)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Payment is valid! Update User and log it
    
    // Grant 1 Year access
    const newTrialEndsAt = new Date();
    newTrialEndsAt.setDate(newTrialEndsAt.getDate() + 365);

    // Provide default string if session.user.id is undefined but that's handled by first check
    const userId = session.user.id || '';

    await prisma.$transaction(async (tx) => {
      // Update User
      await tx.user.update({
        where: { id: userId },
        data: {
          planId: planId,
          trialEndsAt: newTrialEndsAt
        }
      });

      // Log payment
      await tx.paymentLog.create({
        data: {
          userId: userId,
          planName: planId,
          amount: amount,
          currency: 'INR',
          gatewayUsed: 'Razorpay',
          transactionId: razorpay_payment_id,
          paymentStatus: 'SUCCESS',
          paymentDate: new Date(),
          expiryDate: newTrialEndsAt
        }
      });

      // Log Subscription
      await tx.subscriptionLog.create({
        data: {
          userId: userId,
          action: 'UPGRADED',
          planName: planId,
        }
      });
    });

    return NextResponse.json({ success: true, message: 'Payment verified successfully' });

  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: error.message || 'Verification Failed' }, { status: 500 });
  }
}
