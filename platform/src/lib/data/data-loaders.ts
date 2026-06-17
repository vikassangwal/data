import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import fs from 'fs';

export async function processFileAndChunk(filePath: string, fileType: string): Promise<Document[]> {
  let docs: Document[] = [];

  try {
    if (fileType === 'pdf') {
      const loader = new PDFLoader(filePath, { splitPages: true });
      docs = await loader.load();
    } else if (fileType === 'csv') {
      const loader = new CSVLoader(filePath);
      docs = await loader.load();
    } else if (fileType === 'txt' || fileType === 'md') {
      const text = fs.readFileSync(filePath, 'utf-8');
      docs = [new Document({ pageContent: text, metadata: { source: filePath } })];
    } else {
      // Fallback loader
      const text = fs.readFileSync(filePath, 'utf-8');
      docs = [new Document({ pageContent: text, metadata: { source: filePath } })];
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunkedDocs = await textSplitter.splitDocuments(docs);
    return chunkedDocs;
  } catch (error) {
    console.error('Error loading or chunking document:', error);
    throw error;
  }
}
