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
    const hardcodedProjects = [
      {
        id: 'hardcoded-1',
        title: 'Automata Labs',
        slug: 'automata-labs',
        description: 'An advanced AI automation platform and laboratory.',
        category: 'AI & Automation',
        liveUrl: 'https://automata-labs.vercel.app/',
        githubUrl: '',
        imageUrl: '',
        gradient: 'from-blue-500 to-cyan-500',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: [],
        tags: [{ id: 't1', type: 'tech', name: 'Next.js' }, { id: 't2', type: 'tech', name: 'AI' }],
      },
      {
        id: 'hardcoded-2',
        title: 'AI Booking Agent',
        slug: 'ai-booking-agent',
        description: 'An intelligent AI booking agent built for modern businesses.',
        category: 'AI Agents',
        liveUrl: 'https://ai-booking-agent-r2go.onrender.com/',
        githubUrl: '',
        imageUrl: '',
        gradient: 'from-purple-500 to-indigo-500',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: [],
        tags: [{ id: 't3', type: 'tech', name: 'Python' }, { id: 't4', type: 'tech', name: 'AI' }],
      },
      {
        id: 'hardcoded-3',
        title: 'Study Fintech',
        slug: 'study-fintech',
        description: 'A dedicated platform for financial technology learning and insights.',
        category: 'Fintech',
        liveUrl: 'https://studyfintech.vercel.app/',
        githubUrl: '',
        imageUrl: '',
        gradient: 'from-green-500 to-emerald-500',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: [],
        tags: [{ id: 't5', type: 'tech', name: 'Next.js' }, { id: 't6', type: 'tech', name: 'Finance' }],
      },
      {
        id: 'hardcoded-4',
        title: 'VK Fort',
        slug: 'vk-fort',
        description: 'Enterprise AI & Analytics Dashboard.',
        category: 'Dashboard',
        liveUrl: 'https://vkfort.vercel.app/',
        githubUrl: '',
        imageUrl: '',
        gradient: 'from-orange-500 to-red-500',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: [],
        tags: [{ id: 't7', type: 'tech', name: 'React' }, { id: 't8', type: 'tech', name: 'Analytics' }],
      }
    ];

    const allProjects = [...hardcodedProjects, ...projects];
    return { success: true, data: allProjects };
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
