import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CMSClient from './client';

export const metadata = {
  title: 'Headless CMS | Dashboard',
  description: 'Manage your enterprise content and data models.',
};

export default async function CMSPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return <CMSClient />;
}
