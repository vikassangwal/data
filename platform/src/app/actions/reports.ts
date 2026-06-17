'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Authentication required.');
  return session;
}

// ─── 1. GET ALL REPORTS ───
export async function getReports() {
  await requireAuth();
  
  const reports = [
    { id: 'rep-1', name: 'Monthly Financial Summary', type: 'PDF', schedule: 'Monthly (1st)', lastGenerated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), status: 'Active', downloads: 14 },
    { id: 'rep-2', name: 'User Engagement Metrics', type: 'Excel', schedule: 'Weekly (Mon)', lastGenerated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), status: 'Active', downloads: 32 },
    { id: 'rep-3', name: 'Security Audit Log Q2', type: 'CSV', schedule: 'Quarterly', lastGenerated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), status: 'Paused', downloads: 3 },
    { id: 'rep-4', name: 'Sales Pipeline Review', type: 'PDF', schedule: 'Daily', lastGenerated: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), status: 'Active', downloads: 89 },
  ];

  return { success: true, reports };
}

// ─── 2. GENERATE NEW REPORT (On-Demand) ───
export async function generateReport(name: string, type: string, dataSources: string[]) {
  await requireAuth();
  
  if (!name || !type) return { success: false, error: 'Name and type are required.' };

  // Simulate report generation delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  return { 
    success: true, 
    message: `${type} Report generated successfully!`,
    report: {
      id: `rep-${Date.now()}`,
      name,
      type,
      schedule: 'On-Demand',
      lastGenerated: new Date().toISOString(),
      status: 'Generated',
      downloads: 0
    }
  };
}

// ─── 3. TOGGLE REPORT SCHEDULE ───
export async function toggleReportSchedule(reportId: string, currentStatus: string) {
  await requireAuth();
  const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
  return { success: true, message: `Report schedule ${newStatus.toLowerCase()}.`, newStatus };
}

// ─── 4. DELETE REPORT ───
export async function deleteReport(reportId: string) {
  await requireAuth();
  return { success: true, message: 'Report deleted successfully.' };
}
