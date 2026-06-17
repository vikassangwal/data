import { getAnalyticsData } from '@/app/actions/analytics';
import AnalyticsClient from './client';

export const metadata = {
  title: 'Analytics | Admin Dashboard',
};

export default async function AnalyticsPage() {
  const res = await getAnalyticsData();
  
  // Default to some empty/fake data if fetch fails so the dashboard doesn't crash
  const initialData = res.success && res.data ? res.data : {
    totalViews: 0,
    uniqueVisitors: 0,
    topPages: []
  };

  return <AnalyticsClient initialData={initialData} />;
}
