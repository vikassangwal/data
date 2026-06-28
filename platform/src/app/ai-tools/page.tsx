import { Metadata } from 'next';
import AIToolsClient from './client';
import prisma from '@/lib/db';

export const metadata: Metadata = {
  title: 'AI & ML Engine | DevForge',
  description: 'Advanced AI/ML tools: Automated Insights, Predictive Analytics, Natural Language Queries, Model Training, AI Agents, and Data Cleaning.',
};

export const revalidate = 3600;

export default async function AIToolsPage() {
  let datasets: any[] = [];
  let models: any[] = [];

  try {
    // Fetch available datasets
    datasets = await prisma.adminDataset.findMany({
      where: { status: 'ready' },
      orderBy: { updatedAt: 'desc' },
      include: { files: { select: { id: true, fileName: true, fileType: true } } }
    });

    // Fetch trained models
    models = await prisma.trainedModel.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  } catch (error) {
    console.error('Error fetching data for AI Tools page:', error);
  }

  return (
    <AIToolsClient
      datasets={datasets.map(d => ({
        id: d.id,
        name: d.name,
        description: d.description,
        category: d.category,
        status: d.status,
        fileCount: d.files.length,
        files: d.files
      }))}
      trainedModels={models.map(m => ({
        id: m.id,
        name: m.name,
        modelType: m.modelType,
        accuracy: m.accuracy,
        status: m.status,
        targetCol: m.targetCol,
        createdAt: m.createdAt.toISOString()
      }))}
    />
  );
}
