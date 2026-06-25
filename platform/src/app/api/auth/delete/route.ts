import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Because of foreign keys and onDelete: Cascade in prisma, 
    // deleting the user deletes their sessions, accounts, and mostly everything linked.
    await prisma.user.delete({
      where: { id: session.user.id }
    });

    // You may also want to cancel any active Stripe/Razorpay subscriptions here via their APIs.

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete Account Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
