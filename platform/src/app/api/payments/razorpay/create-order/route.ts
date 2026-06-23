import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import prisma from '@/lib/db';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 });
    }

    const body = await req.json();
    const { planId, amount, currency = 'INR' } = body;

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    // Get Razorpay keys from ApiIntegration
    const integration = await prisma.apiIntegration.findUnique({
      where: { providerName: 'razorpay' }
    });

    if (!integration || !integration.apiKey) {
      return NextResponse.json({ 
        error: 'Razorpay integration not configured. Please add "razorpay" keys in Admin Panel.' 
      }, { status: 400 });
    }

    // Using apiKey as key_id and baseUrl as key_secret
    const key_id = integration.apiKey;
    const key_secret = integration.baseUrl || ''; 

    if (!key_secret) {
      return NextResponse.json({ 
        error: 'Razorpay secret missing. Please save it in the "Base URL" field of the integration.' 
      }, { status: 400 });
    }

    const instance = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency,
      receipt: `rcpt_${session.user.id}_${Date.now()}`,
      notes: {
        planId,
        userId: session.user.id
      }
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({ 
      success: true, 
      orderId: order.id, 
      amount: order.amount,
      key: key_id 
    });

  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
