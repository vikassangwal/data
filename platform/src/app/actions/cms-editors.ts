'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

// --- ABOUT CMS ---
export async function getAboutSettings() {
  let settings = await prisma.aboutPageSetting.findFirst();
  if (!settings) {
    settings = await prisma.aboutPageSetting.create({
      data: {
        title: 'About Us',
        content: 'Welcome to our platform. We build amazing things.',
      }
    });
  }
  return settings;
}

export async function updateAboutSettings(id: string, data: any) {
  const result = await prisma.aboutPageSetting.update({
    where: { id },
    data,
  });
  revalidatePath('/about');
  revalidatePath('/admin/about-editor');
  return result;
}

// --- CONTACT CMS ---
export async function getContactSettings() {
  let settings = await prisma.contactPageSetting.findFirst();
  if (!settings) {
    settings = await prisma.contactPageSetting.create({
      data: {
        title: 'Get In Touch',
        email: 'hello@example.com',
      }
    });
  }
  return settings;
}

export async function updateContactSettings(id: string, data: any) {
  const result = await prisma.contactPageSetting.update({
    where: { id },
    data,
  });
  revalidatePath('/contact');
  revalidatePath('/admin/contact-editor');
  return result;
}

// --- RESUME CMS ---
export async function getResumeEntries() {
  return await prisma.resumeEntry.findMany({
    orderBy: { order: 'asc' }
  });
}

export async function createResumeEntry(data: any) {
  const result = await prisma.resumeEntry.create({ data });
  revalidatePath('/resume');
  revalidatePath('/admin/resume-editor');
  return result;
}

export async function updateResumeEntry(id: string, data: any) {
  const result = await prisma.resumeEntry.update({
    where: { id },
    data
  });
  revalidatePath('/resume');
  revalidatePath('/admin/resume-editor');
  return result;
}

export async function deleteResumeEntry(id: string) {
  await prisma.resumeEntry.delete({ where: { id } });
  revalidatePath('/resume');
  revalidatePath('/admin/resume-editor');
}

// --- SKILL CMS ---
export async function getSkills() {
  return await prisma.skillLevel.findMany({
    orderBy: { order: 'asc' }
  });
}

export async function updateSkill(id: string, data: any) {
  const result = await prisma.skillLevel.update({
    where: { id },
    data
  });
  revalidatePath('/admin/skill-editor');
  return result;
}
