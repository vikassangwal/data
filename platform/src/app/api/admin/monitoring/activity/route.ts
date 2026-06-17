import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'SUPER-ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activity = await prisma.userActivityLog.findMany({
      include: {
        user: { select: { name: true, email: true, image: true } }
      },
      orderBy: { timestamp: 'desc' },
      take: 100 // Limit to recent 100
    });

    return NextResponse.json({ success: true, activity });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
