'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

// ------------------------------------------------------------------
// HERO SETTING
// ------------------------------------------------------------------
export async function getHeroSetting() {
  const setting = await prisma.heroSetting.findFirst();
  if (!setting) {
    return await prisma.heroSetting.create({
      data: {
        badgeText: "AI-Powered Digital Solutions",
        titlePrefix: "Your Intelligence Hub for",
        typewriter: JSON.stringify(["Data Insights", "AI Automation", "Smart Platforms", "Growth Engine"]),
        description: "We turn complex data into clarity, build AI agents that work while you sleep, and engineer platforms that scale with your ambition.",
        cta1Text: "Start a Project",
        cta1Link: "/contact",
        cta2Text: "View Our Work",
        cta2Link: "/projects"
      }
    });
  }
  return setting;
}

export async function updateHeroSetting(data: any) {
  const setting = await getHeroSetting();
  await prisma.heroSetting.update({
    where: { id: setting.id },
    data
  });
  revalidatePath('/');
  revalidatePath('/admin/home-editor');
  return { success: true };
}

// ------------------------------------------------------------------
// STATS
// ------------------------------------------------------------------
export async function getStats() {
  const stats = await prisma.statistic.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });
  
  if (stats.length === 0) {
    // Seed initial stats if empty
    const initialStats = [
      { value: 50, suffix: '+', label: 'Projects Delivered', color: '#3B82F6', order: 1 },
      { value: 30, suffix: '+', label: 'Happy Clients', color: '#8B5CF6', order: 2 },
      { value: 99, suffix: '%', label: 'Satisfaction Rate', color: '#10B981', order: 3 },
      { value: 7, suffix: '+', label: 'Years Experience', color: '#06B6D4', order: 4 },
    ];
    for (const stat of initialStats) {
      await prisma.statistic.create({ data: stat });
    }
    return await prisma.statistic.findMany({ orderBy: { order: 'asc' } });
  }
  return stats;
}

export async function addStat(data: any) {
  await prisma.statistic.create({ data });
  revalidatePath('/');
  revalidatePath('/admin/home-editor');
}

export async function updateStat(id: string, data: any) {
  await prisma.statistic.update({ where: { id }, data });
  revalidatePath('/');
  revalidatePath('/admin/home-editor');
}

export async function deleteStat(id: string) {
  await prisma.statistic.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/admin/home-editor');
}

// ------------------------------------------------------------------
// TESTIMONIALS
// ------------------------------------------------------------------
export async function getTestimonials() {
  const t = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });

  if (t.length === 0) {
    const initial = [
      { name: 'Sarah Mitchell', role: 'CTO, FinanceFlow Inc.', quote: 'The AI-driven dashboards transformed how we analyze market data. Real-time insights that previously took days now arrive in seconds.', rating: 5, avatar: 'SM', color: '#3B82F6', order: 1 },
      { name: 'James Rodriguez', role: 'VP Engineering, CloudScale', quote: 'Their platform expertise helped us hit 99.99% uptime. The architecture they designed handles 10× our previous throughput.', rating: 5, avatar: 'JR', color: '#8B5CF6', order: 2 },
      { name: 'Emily Chen', role: 'Director of Data, MedTech Global', quote: 'Prediction accuracy improved by 40% and deployment time dropped by 80%. Absolutely exceptional team.', rating: 5, avatar: 'EC', color: '#10B981', order: 3 },
    ];
    for (const item of initial) {
      await prisma.testimonial.create({ data: item });
    }
    return await prisma.testimonial.findMany({ orderBy: { order: 'asc' } });
  }
  return t;
}

// ------------------------------------------------------------------
// SKILLS / PROFICIENCY
// ------------------------------------------------------------------
export async function getSkills() {
  const s = await prisma.skillLevel.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });

  if (s.length === 0) {
    const initial = [
      { label: 'Data Analytics & BI', value: 95, color: '#3B82F6', order: 1 },
      { label: 'AI & Machine Learning', value: 90, color: '#8B5CF6', order: 2 },
      { label: 'Web Development', value: 92, color: '#06B6D4', order: 3 },
      { label: 'Automation & Scripting', value: 88, color: '#10B981', order: 4 },
      { label: 'Cloud & DevOps', value: 84, color: '#F59E0B', order: 5 },
    ];
    for (const item of initial) {
      await prisma.skillLevel.create({ data: item });
    }
    return await prisma.skillLevel.findMany({ orderBy: { order: 'asc' } });
  }
  return s;
}

// ------------------------------------------------------------------
// TIMELINE EVENTS / ACHIEVEMENTS
// ------------------------------------------------------------------
export async function getTimelineEvents() {
  const ev = await prisma.timelineEvent.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });

  if (ev.length === 0) {
    const initial = [
      { icon: '🚀', text: 'AI sales chatbot deployed — 3× lead conversion rate', timeAgo: '2d ago', color: '#3B82F6', order: 1 },
      { icon: '📊', text: 'Executive dashboard shipped for FinTech startup', timeAgo: '5d ago', color: '#8B5CF6', order: 2 },
      { icon: '⚡', text: 'Automation pipeline saves 40hrs/week for e-commerce client', timeAgo: '1w ago', color: '#10B981', order: 3 },
      { icon: '🧠', text: 'ML churn prediction model — 89% accuracy achieved', timeAgo: '2w ago', color: '#06B6D4', order: 4 },
      { icon: '📈', text: '40% revenue uplift via demand forecasting for retailer', timeAgo: '3w ago', color: '#F59E0B', order: 5 },
    ];
    for (const item of initial) {
      await prisma.timelineEvent.create({ data: item });
    }
    return await prisma.timelineEvent.findMany({ orderBy: { order: 'asc' } });
  }
  return ev;
}
