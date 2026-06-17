'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        metrics: true,
        tags: true,
      }
    });
    return { success: true, data: projects };
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return { success: false, error: error.message };
  }
}

export async function createProject(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string || 'Web Development';
    const liveUrl = formData.get('liveUrl') as string || '';
    const githubUrl = formData.get('githubUrl') as string || '';
    const imageUrl = formData.get('imageUrl') as string || '';
    
    // Auto-generate slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const project = await prisma.project.create({
      data: {
        title,
        description,
        category,
        slug,
        liveUrl,
        githubUrl,
        imageUrl,
        isActive: true,
      }
    });

    revalidatePath('/admin/projects');
    revalidatePath('/projects');
    return { success: true, data: project };
  } catch (error: any) {
    console.error('Error creating project:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({
      where: { id }
    });
    revalidatePath('/admin/projects');
    revalidatePath('/projects');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleProjectStatus(id: string, isActive: boolean) {
  try {
    const project = await prisma.project.update({
      where: { id },
      data: { isActive }
    });
    revalidatePath('/admin/projects');
    revalidatePath('/projects');
    return { success: true, data: project };
  } catch (error: any) {
    console.error('Error toggling project status:', error);
    return { success: false, error: error.message };
  }
}
