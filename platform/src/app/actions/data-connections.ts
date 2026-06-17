'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getConnections() {
  return await prisma.dataSourceConnection.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function connectDataSource(provider: string, credentials: string) {
  // Mock connection delay
  await new Promise(res => setTimeout(res, 1000));

  const conn = await prisma.dataSourceConnection.create({
    data: {
      name: `${provider} Connection`,
      provider,
      credentials: 'encrypted_mock_credentials',
      status: 'connected'
    }
  });

  revalidatePath('/dashboard/datasets');
  revalidatePath('/dashboard');
  return conn;
}
