import { getDatasets } from '@/app/actions/data-management';
import { getAdminAlerts } from '@/app/actions/ml-pipeline';
import MlPipelineClient from './client';

export const dynamic = 'force-dynamic';

export default async function MlPipelinePage() {
  // Fetch available datasets
  const allDatasets = await getDatasets();
  const datasets = allDatasets ? allDatasets.filter((d: any) => d.files && d.files.length > 0) : [];
  
  // Fetch background scanner alerts
  const alerts = await getAdminAlerts();

  return (
    <MlPipelineClient 
      initialDatasets={datasets} 
      initialAlerts={alerts || []} 
    />
  );
}
