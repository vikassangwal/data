import AboutClient from './client';
import { getAboutSettings } from '@/app/actions/cms-editors';
import { getStats } from '@/app/actions/homepage-cms';

export const revalidate = 3600;

export default async function AboutPage() {
  const [settings, stats] = await Promise.all([
    getAboutSettings(),
    getStats()
  ]);

  return (
    <AboutClient 
      settings={settings}
      stats={stats}
    />
  );
}
