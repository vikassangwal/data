import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'SUPER-ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // e.g. "SUCCESS", "FAILED"

    const whereClause = status ? { paymentStatus: status } : {};

    const payments = await prisma.paymentLog.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { paymentDate: 'desc' },
      take: 100 // Limit to recent 100
    });

    return NextResponse.json({ success: true, payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
