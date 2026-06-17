import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CollaborationClient from './client';

export const metadata = {
  title: 'Team Collaboration | Dashboard',
  description: 'Manage workspaces, invite team members, and collaborate in real-time.',
};

export default async function CollaborationPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return <CollaborationClient />;
}
