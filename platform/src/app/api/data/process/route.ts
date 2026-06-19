export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { processFileAndChunk } from '@/lib/data/data-loaders';
import { getVectorDBClient, VectorDocument } from '@/lib/data/vector-clients';

// Let Vercel run this for longer if needed
export const maxDuration = 300; 

export async function POST(req: NextRequest) {
  try {
    const { datasetId, fileId, providerId = 'chromadb' } = await req.json();

    if (!datasetId || !fileId) {
      return NextResponse.json({ error: 'Missing datasetId or fileId' }, { status: 400 });
    }

    const dataFile = await prisma.dataFile.findUnique({ where: { id: fileId } });
    if (!dataFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // 1. Mark processing
    await prisma.adminDataset.update({
      where: { id: datasetId },
      data: { status: 'processing' }
    });

    // 2. Load and Chunk using LangChain
    const chunkedDocs = await processFileAndChunk(dataFile.filePath, dataFile.fileType.replace('.', ''));

    // 3. Generate mock embeddings for now (later connect to AIGateway/OpenAI embeddings)
    // In a real app, you would pass `chunk.pageContent` to OpenAI API `v1/embeddings`
    const vectorDocs: VectorDocument[] = chunkedDocs.map((chunk, i) => ({
      id: `${fileId}-chunk-${i}`,
      text: chunk.pageContent,
      metadata: { ...chunk.metadata, datasetId, fileId },
      // random 1536 vector
      embedding: Array.from({ length: 1536 }, () => Math.random()),
    }));

    // 4. Upsert into Vector DB
    const vectorDB = getVectorDBClient(providerId);
    
    // Connect with dummy credentials. In real app, fetch from DB.
    await vectorDB.connect({}); 
    
    const indexName = `dataset-${datasetId}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    await vectorDB.upsert(indexName, vectorDocs);

    // 5. Update Database Record
    await prisma.vectorIndex.create({
      data: {
        datasetId,
        provider: providerId,
        indexName,
        vectorCount: vectorDocs.length,
        status: 'ready'
      }
    });

    await prisma.adminDataset.update({
      where: { id: datasetId },
      data: { status: 'ready' }
    });

    return NextResponse.json({ success: true, chunksProcessed: vectorDocs.length });

  } catch (error: any) {
    console.error('Data Processing Error:', error);
    return NextResponse.json({ error: 'Failed to process dataset', details: error.message }, { status: 500 });
  }
}
