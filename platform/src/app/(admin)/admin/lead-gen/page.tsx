import { db } from '@/lib/db';
import LeadGenClient from './client';

export const metadata = {
  title: 'SEO Lead Gen & Audit Engine | Admin Panel',
};

export const dynamic = 'force-dynamic';

export default async function LeadGenPage() {
  // Fetch available AI providers for the routing selection
  const providers = await db.apiIntegration.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      providerName: true,
    }
  });

  // Fetch recent audits
  const recentAudits = await db.leadAudit.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      emails: true,
    }
  });

  return (
    <LeadGenClient 
      providers={providers} 
      recentAudits={recentAudits} 
    />
  );
}
