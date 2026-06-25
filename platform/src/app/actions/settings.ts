'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function getSiteSettings() {
  const session = await auth();
  if (session?.user?.role !== 'SUPER-ADMIN' && session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  let settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        siteName: 'DevFort',
      }
    });
  }
  return settings;
}

export async function togglePublicReviews(currentState: boolean) {
  const session = await auth();
  if (session?.user?.role !== 'SUPER-ADMIN' && session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const settings = await prisma.siteSettings.findFirst();
  if (settings) {
    await prisma.siteSettings.update({
      where: { id: settings.id },
      data: { showPublicReviews: !currentState }
    });
  }
  revalidatePath('/admin/settings');
  revalidatePath('/'); // Revalidate home page to update layout JSON-LD
}
