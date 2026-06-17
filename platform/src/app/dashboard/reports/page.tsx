import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ReportsClient from './client';

export const metadata = {
  title: 'Report Studio | Dashboard',
  description: 'Generate, schedule, and export enterprise reports.',
};

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return <ReportsClient />;
}
