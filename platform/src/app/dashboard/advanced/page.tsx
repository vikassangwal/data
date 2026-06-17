import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdvancedClient from './client';

export const metadata = {
  title: 'Advanced Settings | Dashboard',
};

export default async function AdvancedPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return <AdvancedClient />;
}
