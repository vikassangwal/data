import { getHeroSetting } from '@/app/actions/homepage-cms';
import HomeEditorClient from './HomeEditorClient';

export const metadata = {
  title: 'Homepage Editor | Admin Panel',
};

export default async function HomeEditorPage() {
  const heroSetting = await getHeroSetting();
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Homepage CMS Editor</h1>
        <p className="text-muted-foreground mt-1">
          Dynamically change texts, statistics, testimonials, and timeline events displayed on the public landing page.
        </p>
      </div>

      <HomeEditorClient initialHero={heroSetting} />
    </div>
  );
}
