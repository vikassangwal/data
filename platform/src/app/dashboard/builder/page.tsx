import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import BuilderClient from './client';

export const metadata = {
  title: 'Visual Page Builder | Dashboard',
  description: 'Drag and drop website and landing page builder.',
};

export default async function BuilderPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return <BuilderClient />;
}
