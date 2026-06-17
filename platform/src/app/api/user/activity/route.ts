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

    const activityLogs = await prisma.userActivityLog.findMany({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' },
      take: 50, // Limit to recent 50
    });

    const loginHistory = await prisma.loginHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { loginTime: 'desc' },
      take: 20,
    });

    return NextResponse.json({ success: true, activityLogs, loginHistory });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
