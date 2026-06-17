'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Authentication required.');
  return session;
}

// ─── 1. GET PAGES ───
export async function getBuilderPages() {
  await requireAuth();
  
  const pages = [
    { id: 'pg-1', title: 'Landing Page (v2)', url: '/home-v2', lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: 'Published' },
    { id: 'pg-2', title: 'Pricing 2026', url: '/pricing', lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: 'Draft' },
    { id: 'pg-3', title: 'About Us', url: '/about', lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), status: 'Published' },
  ];

  return { success: true, pages };
}

// ─── 2. SAVE PAGE DATA ───
export async function savePageData(id: string, layout: any) {
  await requireAuth();
  // Simulate network delay for saving complex layout
  await new Promise(resolve => setTimeout(resolve, 800));
  return { success: true, message: 'Layout saved successfully.' };
}
