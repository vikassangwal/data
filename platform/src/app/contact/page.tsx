import ContactClient from './client';
import { getContactSettings } from '@/app/actions/cms-editors';

export const revalidate = 3600;

export default async function ContactPage() {
  const settings = await getContactSettings();

  return (
    <ContactClient settings={settings} />
  );
}
