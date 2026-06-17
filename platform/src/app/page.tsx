import { 
  getHeroSetting, 
  getStats, 
  getTestimonials, 
  getSkills, 
  getTimelineEvents 
} from '@/app/actions/homepage-cms';
import prisma from '@/lib/db';
import HomeClient from './HomeClient';

export default async function HomePage() {
  // Fetch all CMS data in parallel
  const [
    heroSetting, 
    stats, 
    testimonials, 
    skills, 
    timelineEvents, 
    services
  ] = await Promise.all([
    getHeroSetting(),
    getStats(),
    getTestimonials(),
    getSkills(),
    getTimelineEvents(),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { order: 'asc' }, take: 3 })
  ]);

  return (
    <HomeClient 
      heroSetting={heroSetting}
      stats={stats}
      testimonials={testimonials}
      skills={skills}
      timelineEvents={timelineEvents}
      services={services}
    />
  );
}
