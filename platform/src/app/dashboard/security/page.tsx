import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import SecurityClient from './client';

export const metadata = {
  title: 'Security Center | Dashboard',
  description: 'Monitor login activity, manage sessions, and configure privacy settings.',
};

export default async function SecurityPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return <SecurityClient />;
}
