const { ChromaClient } = require('chromadb');
const fs = require('fs');
const path = require('path');

async function main() {
  const manualPath = path.resolve(__dirname, '../docs/manual.md');
  if (!fs.existsSync(manualPath)) {
    console.error('manual.md not found at:', manualPath);
    process.exit(1);
  }

  const manualContent = fs.readFileSync(manualPath, 'utf-8');
  const sections = manualContent.split(/(?=^## )/m);
  const chunks = sections.map(s => s.trim()).filter(Boolean);

  console.log(`Loaded ${chunks.length} chunks from manual.md`);

  try {
    const client = new ChromaClient({ path: 'http://localhost:8000' });
    // Attempt connection test
    const version = await client.version();
    console.log(`Connected to ChromaDB server. Version: ${version}`);
    
    // Reset collection if exists
    try {
      await client.deleteCollection({ name: 'platform-documentation' });
    } catch (e) {}

    const collection = await client.getOrCreateCollection({ name: 'platform-documentation' });

    await collection.add({
      ids: chunks.map((_, idx) => `manual_chunk_${idx}`),
      embeddings: chunks.map(() => [0.1, 0.2, 0.3, 0.4]),
      metadatas: chunks.map((_, idx) => ({ source: 'docs/manual.md', chunkIdx: idx })),
      documents: chunks
    });

    console.log('Successfully seeded manual into ChromaDB!');
  } catch (err) {
    console.warn('ChromaDB seeding server not reachable. Fallback search will be used dynamically:', err.message);
  }
}

main().catch(console.error);
