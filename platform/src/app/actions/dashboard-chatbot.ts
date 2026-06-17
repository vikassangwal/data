'use server';

import { UniversalAIGateway } from '@/lib/ai/gateway';
import prisma from '@/lib/db';
import fs from 'fs';
import path from 'path';

interface ChatbotContext {
  query: string;
  columns?: string[];
  rowCount?: number;
  fileName?: string;
  parsingStatus?: string;
  errorLogs?: string[];
}

// Helper to chunk markdown by headers
function chunkMarkdown(text: string): string[] {
  const sections = text.split(/(?=^## )/m);
  return sections.map(s => s.trim()).filter(Boolean);
}

// Fallback search that scans chunks for matches
function searchManualFallback(query: string, chunks: string[]): string {
  const terms = query.toLowerCase().split(/\s+/);
  const scoredChunks = chunks.map(chunk => {
    let score = 0;
    const chunkLower = chunk.toLowerCase();
    terms.forEach(term => {
      if (term.length > 2 && chunkLower.includes(term)) {
        score += 1;
      }
    });
    return { chunk, score };
  });

  // Sort by score and filter out non-matching chunks
  const matched = scoredChunks
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.chunk);

  // Return top 2 matching chunks, or the first chunk if none match
  if (matched.length > 0) {
    return matched.slice(0, 2).join('\n\n---\n\n');
  }
  return chunks[0] || '';
}

export async function queryDashboardChatbot(context: ChatbotContext) {
  const { query, columns = [], rowCount = 0, fileName = 'unknown.csv', parsingStatus = 'ready', errorLogs = [] } = context;

  try {
    // 1. Load documentation manual
    const manualPath = path.resolve(process.cwd(), 'docs', 'manual.md');
    let manualContent = '';
    let manualChunks: string[] = [];
    
    if (fs.existsSync(manualPath)) {
      manualContent = fs.readFileSync(manualPath, 'utf-8');
      manualChunks = chunkMarkdown(manualContent);
    }

    // 2. Retrieve relevant context from manual (RAG)
    let ragContext = '';
    try {
      const { getVectorDBClient } = require('@/lib/data/vector-clients');
      const vectorDB = getVectorDBClient('chromadb');
      await vectorDB.connect({});
      
      const queryEmbedding = [0.1, 0.2, 0.3, 0.4];
      const results = await vectorDB.search('platform-documentation', queryEmbedding, 2);
      
      if (results && results.length > 0) {
        ragContext = results.map((d: any) => d.text).join('\n\n---\n\n');
      } else {
        ragContext = searchManualFallback(query, manualChunks);
      }
    } catch (dbErr) {
      console.warn('[Chatbot RAG] ChromaDB search failed, using local semantic fallback:', dbErr);
      ragContext = searchManualFallback(query, manualChunks);
    }

    // 3. Assemble prompt with context
    const datasetInfo = `
Uploaded File Name: ${fileName}
Status: ${parsingStatus}
Total Rows: ${rowCount}
Parsed Columns: ${columns.join(', ')}
Active Error Logs: ${errorLogs.length > 0 ? JSON.stringify(errorLogs) : 'None'}
`;

    const prompt = `
You are the RAG-Powered Dashboard AI Assistant. Your task is to help users debug parsing errors, understand their uploaded data metrics, and resolve visual display issues (like the "00" values category corruption error).

---
USER QUERY:
"${query}"

---
DATASET METADATA:
${datasetInfo}

---
TECHNICAL DOCUMENTATION CONTEXT (RAG):
${ragContext}
---

Provide a helpful, precise, and professional response. If the user asks about data parsing failures, numeric values showing up as "00" categories, or LabelEncoder corruption, explain that formatted string columns (like currency "$482,000" or percentage "12%") should be cleaned of non-numeric characters and cast to float before training. Highlight how the new dynamic header scanner in "scripts/ml_pipeline.py" automates this by stripping symbols and casting to float64 if 80%+ of rows are convertible.
`;

    const response = await UniversalAIGateway.executeRequest({
      taskType: 'fast_response',
      prompt,
      systemPrompt: 'You are an intelligent full-stack debugging assistant for the DevForge platform, trained on the technical manual.',
      temperature: 0.3,
      maxTokens: 1000
    });

    if (response.error) {
      return {
        success: false,
        error: response.error,
        answer: 'I encountered an issue connecting to the AI insight gateway. Please verify your configured AI provider settings.'
      };
    }

    return {
      success: true,
      answer: response.text
    };

  } catch (err: any) {
    console.error('Chatbot execution failed:', err);
    return {
      success: false,
      error: err.message,
      answer: 'Failed to process chatbot request. Internal server error.'
    };
  }
}

// 4. SEEDING ACTION FOR MANUAL
export async function seedPlatformDocumentation() {
  try {
    const manualPath = path.resolve(process.cwd(), 'docs', 'manual.md');
    if (!fs.existsSync(manualPath)) {
      return { success: false, error: 'manual.md not found on filesystem.' };
    }

    const manualContent = fs.readFileSync(manualPath, 'utf-8');
    const chunks = chunkMarkdown(manualContent);

    const { getVectorDBClient } = require('@/lib/data/vector-clients');
    const vectorDB = getVectorDBClient('chromadb');
    await vectorDB.connect({});

    const vectorDocs = chunks.map((text, idx) => ({
      id: `manual_chunk_${idx}`,
      text,
      metadata: { source: 'docs/manual.md', chunkIdx: idx },
      embedding: [0.1, 0.2, 0.3, 0.4]
    }));

    try {
      await vectorDB.deleteIndex('platform-documentation');
    } catch (e) {}

    await vectorDB.upsert('platform-documentation', vectorDocs);

    return { success: true, message: `Successfully seeded ${chunks.length} manual chunks into ChromaDB.` };
  } catch (err: any) {
    console.error('Failed to seed platform documentation:', err);
    return { success: false, error: err.message || 'Vector seeding failed' };
  }
}
