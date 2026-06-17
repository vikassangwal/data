import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import IntegrationsClient from './client';

export const metadata = {
  title: 'Data Integrations | Dashboard',
  description: 'Connect your apps and databases for seamless data analysis.',
};

export default async function IntegrationsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return <IntegrationsClient />;
}
