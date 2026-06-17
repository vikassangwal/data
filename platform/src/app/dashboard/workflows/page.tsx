import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import WorkflowsClient from './client';

export const metadata = {
  title: 'Workflow Automation | Dashboard',
  description: 'Build and manage enterprise workflow automations visually.',
};

export default async function WorkflowsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return <WorkflowsClient />;
}
