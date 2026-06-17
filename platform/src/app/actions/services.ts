'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getServices() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { order: 'asc' },
      include: {
        features: true,
        pricing: true,
      }
    });
    return { success: true, data: services };
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return { success: false, error: error.message };
  }
}

export async function createService(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const icon = formData.get('icon') as string || 'Briefcase';
    
    // Auto-generate slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const service = await prisma.service.create({
      data: {
        title,
        description,
        icon,
        slug,
        isActive: true,
      }
    });

    revalidatePath('/admin/services');
    revalidatePath('/services');
    return { success: true, data: service };
  } catch (error: any) {
    console.error('Error creating service:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteService(id: string) {
  try {
    await prisma.service.delete({
      where: { id }
    });
    revalidatePath('/admin/services');
    revalidatePath('/services');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleServiceStatus(id: string, isActive: boolean) {
  try {
    const service = await prisma.service.update({
      where: { id },
      data: { isActive }
    });
    revalidatePath('/admin/services');
    revalidatePath('/services');
    return { success: true, data: service };
  } catch (error: any) {
    console.error('Error toggling service status:', error);
    return { success: false, error: error.message };
  }
}
