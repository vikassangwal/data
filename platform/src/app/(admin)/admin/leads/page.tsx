import { getLeads } from '@/app/actions/leads';
import LeadsClient from './client';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const { success, data: leads, error } = await getLeads();

  if (!success) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold mb-2">Error loading leads</h2>
        <p>{error}</p>
      </div>
    );
  }

  return <LeadsClient initialLeads={leads || []} />;
}
