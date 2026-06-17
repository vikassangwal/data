'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Authentication required.');
  return session;
}

// ─── 1. GET ALL CONTENT MODELS ───
export async function getContentModels() {
  await requireAuth();
  
  const models = [
    { id: 'cm-1', name: 'Blog Post', apiId: 'blog_post', itemsCount: 42, lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: 'Published' },
    { id: 'cm-2', name: 'Landing Page', apiId: 'landing_page', itemsCount: 8, lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: 'Published' },
    { id: 'cm-3', name: 'Author', apiId: 'author', itemsCount: 15, lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), status: 'Published' },
    { id: 'cm-4', name: 'Testimonial', apiId: 'testimonial', itemsCount: 124, lastUpdated: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'Draft' },
  ];

  return { success: true, models };
}

// ─── 2. GET CONTENT ENTRIES (For a specific model) ───
export async function getContentEntries(modelId: string) {
  await requireAuth();
  
  if (modelId === 'cm-1') {
    return {
      success: true,
      entries: [
        { id: 'ent-1', title: 'Top 10 Enterprise SaaS Trends for 2026', author: 'Sarah K.', status: 'Published', date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
        { id: 'ent-2', title: 'How to Build a Next.js 16 App', author: 'Mike R.', status: 'Draft', date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
        { id: 'ent-3', title: 'The Future of AI Automation', author: 'Priya S.', status: 'Archived', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
      ]
    };
  }

  return { success: true, entries: [] };
}

// ─── 3. CREATE NEW CONTENT MODEL ───
export async function createContentModel(name: string, apiId: string) {
  await requireAuth();
  if (!name || !apiId) return { success: false, error: 'Name and API ID are required.' };
  
  return { 
    success: true, 
    message: 'Content model created successfully',
    model: {
      id: `cm-${Date.now()}`,
      name,
      apiId,
      itemsCount: 0,
      lastUpdated: new Date().toISOString(),
      status: 'Draft'
    }
  };
}

// ─── 4. TOGGLE ENTRY STATUS ───
export async function toggleEntryStatus(entryId: string, currentStatus: string) {
  await requireAuth();
  const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
  return { success: true, message: `Status updated to ${newStatus}`, newStatus };
}
