'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createAdminDataset(data: {
  name: string;
  description?: string;
  category?: string;
  tags?: string;
  sourceType: string;
  purpose?: string;
  visibility?: string;
}) {
  const dataset = await prisma.adminDataset.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      tags: data.tags,
      sourceType: data.sourceType,
      purpose: data.purpose,
      visibility: data.visibility || 'private',
      status: 'pending',
    }
  });

  revalidatePath('/dashboard/datasets');
  return dataset;
}

export async function registerDataFile(datasetId: string, fileData: {
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
}) {
  const file = await prisma.dataFile.create({
    data: {
      datasetId,
      fileName: fileData.fileName,
      fileType: fileData.fileType,
      filePath: fileData.filePath,
      fileSize: fileData.fileSize,
    }
  });
  
  return file;
}

export async function getDatasets() {
  return await prisma.adminDataset.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      files: true,
      vectorIndexes: true,
    }
  });
}

export async function processDataset(datasetId: string) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const updated = await prisma.adminDataset.update({
    where: { id: datasetId },
    data: { status: 'ready' }
  });
  
  revalidatePath('/dashboard/datasets');
  return updated;
}

export async function updateDataset(datasetId: string, data: {
  name?: string;
  description?: string;
  category?: string;
  visibility?: string;
}) {
  const updated = await prisma.adminDataset.update({
    where: { id: datasetId },
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      visibility: data.visibility,
    }
  });

  revalidatePath('/dashboard/datasets');
  return updated;
}

export async function deleteDataset(datasetId: string) {
  // Delete associated files first
  await prisma.dataFile.deleteMany({
    where: { datasetId }
  });

  // Delete associated vector indexes
  await prisma.vectorIndex.deleteMany({
    where: { datasetId }
  });

  // Delete the dataset itself
  await prisma.adminDataset.delete({
    where: { id: datasetId }
  });

  revalidatePath('/dashboard/datasets');
  return { success: true };
}

