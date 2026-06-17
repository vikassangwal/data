'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getAiProviders() {
  return await prisma.aiProvider.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addAiProvider(data: any) {
  const provider = await prisma.aiProvider.create({
    data: {
      name: data.name,
      type: data.type,
      apiKey: data.apiKey,
      baseUrl: data.baseUrl,
      endpointUrl: data.endpointUrl,
      models: JSON.stringify(data.models || []),
      isActive: data.isActive || false,
      isFallback: data.isFallback || false,
    }
  });
  
  if (data.isActive) {
    await prisma.aiProvider.updateMany({
      where: { id: { not: provider.id } },
      data: { isActive: false }
    });
  }

  revalidatePath('/admin/ai/providers');
  return provider;
}

export async function toggleProviderActive(id: string, isActive: boolean) {
  if (isActive) {
    await prisma.aiProvider.updateMany({
      data: { isActive: false }
    });
  }
  
  const updated = await prisma.aiProvider.update({
    where: { id },
    data: { isActive }
  });
  
  revalidatePath('/admin/ai/providers');
  return updated;
}

export async function deleteProvider(id: string) {
  await prisma.aiProvider.delete({ where: { id } });
  revalidatePath('/admin/ai/providers');
}
