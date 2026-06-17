import { Pinecone } from '@pinecone-database/pinecone';
import { ChromaClient } from 'chromadb';

export interface VectorDocument {
  id: string;
  text: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

export interface VectorDBPlugin {
  id: string;
  name: string;
  connect(credentials: Record<string, any>): Promise<boolean>;
  upsert(indexName: string, documents: VectorDocument[]): Promise<boolean>;
  search(indexName: string, queryEmbedding: number[], topK?: number): Promise<VectorDocument[]>;
  deleteIndex(indexName: string): Promise<boolean>;
}

export class PineconePlugin implements VectorDBPlugin {
  id = 'pinecone';
  name = 'Pinecone';
  private client: Pinecone | null = null;

  async connect(credentials: { apiKey: string }) {
    if (!credentials.apiKey) throw new Error('Pinecone API Key is required');
    this.client = new Pinecone({ apiKey: credentials.apiKey });
    return true;
  }

  async upsert(indexName: string, documents: VectorDocument[]) {
    if (!this.client) throw new Error('Not connected');
    const index = this.client.index(indexName);
    
    // Pinecone upserts vectors
    const vectors = documents.map(doc => ({
      id: doc.id,
      values: doc.embedding!,
      metadata: { text: doc.text, ...doc.metadata }
    }));

    await index.upsert(vectors as any);
    return true;
  }

  async search(indexName: string, queryEmbedding: number[], topK = 5) {
    if (!this.client) throw new Error('Not connected');
    const index = this.client.index(indexName);
    
    const results = await index.query({
      topK,
      vector: queryEmbedding,
      includeMetadata: true
    });

    return results.matches.map(m => ({
      id: m.id,
      text: m.metadata?.text as string || '',
      metadata: m.metadata || {},
      embedding: m.values
    }));
  }

  async deleteIndex(indexName: string) {
    if (!this.client) throw new Error('Not connected');
    await this.client.deleteIndex(indexName);
    return true;
  }
}

export class ChromaDBPlugin implements VectorDBPlugin {
  id = 'chromadb';
  name = 'ChromaDB';
  private client: ChromaClient | null = null;

  async connect(credentials: { url?: string }) {
    this.client = new ChromaClient({ path: credentials.url || 'http://localhost:8000' });
    return true;
  }

  async upsert(indexName: string, documents: VectorDocument[]) {
    if (!this.client) throw new Error('Not connected');
    const collection = await this.client.getOrCreateCollection({ name: indexName });

    await collection.add({
      ids: documents.map(d => d.id),
      embeddings: documents.map(d => d.embedding!),
      metadatas: documents.map(d => d.metadata),
      documents: documents.map(d => d.text)
    });
    return true;
  }

  async search(indexName: string, queryEmbedding: number[], topK = 5) {
    if (!this.client) throw new Error('Not connected');
    const collection = await this.client.getCollection({ name: indexName });

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK
    });

    const docs: VectorDocument[] = [];
    if (results.ids[0]) {
      for (let i = 0; i < results.ids[0].length; i++) {
        docs.push({
          id: results.ids[0][i],
          text: results.documents[0]?.[i] || '',
          metadata: results.metadatas[0]?.[i] || {},
        });
      }
    }
    return docs;
  }

  async deleteIndex(indexName: string) {
    if (!this.client) throw new Error('Not connected');
    await this.client.deleteCollection({ name: indexName });
    return true;
  }
}

// Global factory to get client
export function getVectorDBClient(providerId: string): VectorDBPlugin {
  switch (providerId) {
    case 'pinecone': return new PineconePlugin();
    case 'chromadb': return new ChromaDBPlugin();
    default: throw new Error(`Vector DB Provider ${providerId} not supported.`);
  }
}
