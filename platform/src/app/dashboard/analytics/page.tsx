import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AnalyticsClient from './client';

export const metadata = {
  title: 'Analytics Dashboard | DevFort',
  description: 'High-end data visualization and business intelligence dashboard.',
};

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return <AnalyticsClient />;
}
