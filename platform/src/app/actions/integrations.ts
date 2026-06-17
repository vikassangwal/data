'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';

export async function getApiIntegrations() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'SUPER-ADMIN') {
    return { error: 'Unauthorized access.' };
  }

  try {
    const integrations = await prisma.apiIntegration.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, integrations };
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch integrations.' };
  }
}

export async function saveApiIntegration(data: { providerName: string; apiKey: string; baseUrl?: string }) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'SUPER-ADMIN') {
    return { error: 'Unauthorized access.' };
  }

  try {
    const integration = await prisma.apiIntegration.upsert({
      where: { providerName: data.providerName },
      update: {
        apiKey: data.apiKey,
        baseUrl: data.baseUrl || null,
        status: 'ACTIVE'
      },
      create: {
        providerName: data.providerName,
        apiKey: data.apiKey,
        baseUrl: data.baseUrl || null,
        status: 'ACTIVE'
      }
    });

    return { success: true, integration };
  } catch (err: any) {
    return { error: err.message || 'Failed to save integration.' };
  }
}

export async function deleteApiIntegration(id: string) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'SUPER-ADMIN') {
    return { error: 'Unauthorized access.' };
  }

  try {
    await prisma.apiIntegration.delete({
      where: { id }
    });
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete integration.' };
  }
}

export async function getConnectedIntegrations() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'SUPER-ADMIN') return { keys: [] };
  
  try {
    const integrations = await prisma.apiIntegration.findMany({ select: { providerName: true } });
    return { keys: integrations.map(i => i.providerName) };
  } catch (err) {
    return { keys: [] };
  }
}

export async function saveIntegration(toolId: string, apiKey: string, baseUrl?: string) {
  return await saveApiIntegration({ providerName: toolId, apiKey, baseUrl });
}

