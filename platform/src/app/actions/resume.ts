'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getResumeEntries() {
  try {
    const entries = await prisma.resumeEntry.findMany({
      orderBy: [
        { type: 'asc' },
        { order: 'asc' }
      ]
    });
    return { success: true, data: entries };
  } catch (error: any) {
    console.error('Error fetching resume entries:', error);
    return { success: false, error: error.message };
  }
}

export async function createResumeEntry(data: {
  type: string;
  title: string;
  organization: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description: string;
  order: number;
}) {
  try {
    const entry = await prisma.resumeEntry.create({
      data
    });
    revalidatePath('/admin/resume-editor');
    revalidatePath('/resume');
    return { success: true, data: entry };
  } catch (error: any) {
    console.error('Error creating resume entry:', error);
    return { success: false, error: error.message };
  }
}

export async function updateResumeEntry(id: string, data: any) {
  try {
    const entry = await prisma.resumeEntry.update({
      where: { id },
      data
    });
    revalidatePath('/admin/resume-editor');
    revalidatePath('/resume');
    return { success: true, data: entry };
  } catch (error: any) {
    console.error('Error updating resume entry:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteResumeEntry(id: string) {
  try {
    await prisma.resumeEntry.delete({
      where: { id }
    });
    revalidatePath('/admin/resume-editor');
    revalidatePath('/resume');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting resume entry:', error);
    return { success: false, error: error.message };
  }
}

export async function getResumeProfile() {
  try {
    let profile = await prisma.resumeProfileSetting.findFirst();
    if (!profile) {
      profile = await prisma.resumeProfileSetting.create({
        data: {
          name: 'Alex Kumar',
          initials: 'AK',
          title: 'Data Analyst · AI Engineer · Full-Stack Developer',
          bio: '7+ years transforming data into intelligence, building AI systems, and engineering premium digital platforms for global clients.',
          photoUrl: '',
          cvUrl: ''
        }
      });
    }
    return { success: true, data: profile };
  } catch (error: any) {
    console.error('Error fetching resume profile:', error);
    return { success: false, error: error.message };
  }
}

export async function updateResumeProfile(data: {
  name?: string;
  initials?: string;
  title?: string;
  bio?: string;
  photoUrl?: string | null;
  cvUrl?: string | null;
}) {
  try {
    const profile = await prisma.resumeProfileSetting.findFirst();
    if (!profile) {
      const newProfile = await prisma.resumeProfileSetting.create({
        data: {
          name: data.name || 'Alex Kumar',
          initials: data.initials || 'AK',
          title: data.title || 'Data Analyst · AI Engineer · Full-Stack Developer',
          bio: data.bio || '7+ years transforming data into intelligence...',
          photoUrl: data.photoUrl || '',
          cvUrl: data.cvUrl || ''
        }
      });
      revalidatePath('/resume');
      revalidatePath('/admin/resume-editor');
      return { success: true, data: newProfile };
    }

    const updated = await prisma.resumeProfileSetting.update({
      where: { id: profile.id },
      data
    });
    revalidatePath('/resume');
    revalidatePath('/admin/resume-editor');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Error updating resume profile:', error);
    return { success: false, error: error.message };
  }
}
