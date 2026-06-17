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

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [allPayments, todayPayments, monthlyPayments, yearlyPayments] = await Promise.all([
      prisma.paymentLog.findMany({ where: { paymentStatus: 'SUCCESS' } }),
      prisma.paymentLog.findMany({ where: { paymentStatus: 'SUCCESS', paymentDate: { gte: todayStart } } }),
      prisma.paymentLog.findMany({ where: { paymentStatus: 'SUCCESS', paymentDate: { gte: monthStart } } }),
      prisma.paymentLog.findMany({ where: { paymentStatus: 'SUCCESS', paymentDate: { gte: yearStart } } }),
    ]);

    const sumAmount = (logs: any[]) => logs.reduce((acc, log) => acc + log.amount, 0);

    const stats = {
      totalRevenue: sumAmount(allPayments),
      todayRevenue: sumAmount(todayPayments),
      monthlyRevenue: sumAmount(monthlyPayments),
      yearlyRevenue: sumAmount(yearlyPayments),
    };

    // Revenue by gateway
    const gatewayData = allPayments.reduce((acc: any, log) => {
      acc[log.gatewayUsed] = (acc[log.gatewayUsed] || 0) + log.amount;
      return acc;
    }, {});

    const gatewayChart = Object.keys(gatewayData).map(key => ({ name: key, value: gatewayData[key] }));

    return NextResponse.json({ success: true, stats, gatewayChart });
  } catch (error) {
    console.error('Error fetching revenue:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
