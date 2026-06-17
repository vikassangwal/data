import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { registerDataFile } from '@/app/actions/data-management';

// Limit configuration for App Router (although Vercel has its own limits, locally this allows large files)
export const maxDuration = 300; // 5 minutes

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const datasetId = formData.get('datasetId') as string;
    const file = formData.get('file') as File | null;
    const link = formData.get('link') as string | null;

    if (!datasetId) {
      return NextResponse.json({ error: 'Dataset ID is required' }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    let filePath = '';
    let fileName = '';
    let fileSize = 0;
    let fileType = '';

    if (file) {
      // Handle physical file upload (up to 500MB depending on client/server config)
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      fileName = file.name;
      fileType = file.type || fileName.split('.').pop() || 'unknown';
      fileSize = buffer.length;
      filePath = join(uploadDir, `${Date.now()}-${fileName}`);

      await writeFile(filePath, buffer);

    } else if (link) {
      // Handle remote link ingestion
      // In a real app, we'd stream this using fetch to our disk
      fileName = new URL(link).pathname.split('/').pop() || 'remote-file.bin';
      fileType = 'url';
      filePath = link;
      fileSize = 0; // We'd fetch headers to get content-length

      // Simulate a quick fetch head check
      try {
        const headRes = await fetch(link, { method: 'HEAD' });
        fileSize = parseInt(headRes.headers.get('content-length') || '0', 10);
      } catch (e) {
        console.warn('Could not fetch head for remote link');
      }
    } else {
      return NextResponse.json({ error: 'No file or link provided' }, { status: 400 });
    }

    const savedFile = await registerDataFile(datasetId, {
      fileName,
      fileType,
      filePath,
      fileSize,
    });

    return NextResponse.json({ success: true, file: savedFile });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload or ingest data', details: error.message }, { status: 500 });
  }
}
