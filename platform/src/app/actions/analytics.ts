'use server';

import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

export async function getAnalyticsData() {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Basic stats
    const totalViews = await prisma.pageView.count();
    
    const uniqueVisitors = await prisma.pageView.groupBy({
      by: ['ipHash'],
    });

    const topPages = await prisma.pageView.groupBy({
      by: ['path'],
      _count: {
        path: true,
      },
      orderBy: {
        _count: {
          path: 'desc',
        },
      },
      take: 10,
    });

    // We can simulate some fake stats for empty dashboard if no data exists
    // so it doesn't look completely empty to the user on first install
    return {
      success: true,
      data: {
        totalViews: totalViews,
        uniqueVisitors: uniqueVisitors.length,
        topPages: topPages.map(page => ({
          path: page.path,
          views: page._count.path
        }))
      }
    };
  } catch (error) {
    console.error('Failed to get analytics:', error);
    return { success: false, error: 'Failed to fetch analytics' };
  }
}
