import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payments = await prisma.paymentLog.findMany({
      where: { userId: session.user.id },
      orderBy: { paymentDate: 'desc' },
    });

    return NextResponse.json({ success: true, payments });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
