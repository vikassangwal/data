import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import EmailsClient from './client';

export const metadata = {
  title: 'Email Library | Dashboard',
  description: 'Manage and design email templates for campaigns.',
};

export default async function EmailsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return <EmailsClient />;
}
