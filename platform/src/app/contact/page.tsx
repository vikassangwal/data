import ContactClient from './client';
import { getContactSettings } from '@/app/actions/cms-editors';

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const settings = await getContactSettings();

  return (
    <ContactClient settings={settings} />
  );
}
