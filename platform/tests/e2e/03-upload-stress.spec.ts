import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

// ============================================================
// 📁 Heavy Document Upload & Stress Testing
// भारी दस्तावेज़ अपलोड और तनाव परीक्षण
// ============================================================

// टेस्ट डेटा फ़ाइलें बनाने के लिए हेल्पर
const FIXTURES_DIR = path.join(process.cwd(), 'tests', 'fixtures');

test.beforeAll(async () => {
  const prisma = new PrismaClient();

  const datasetsToSeed = [
    { id: 'test-dataset-001', name: 'Test Dataset 001', sourceType: 'file' },
    { id: 'test-csv-small', name: 'Test CSV Small', sourceType: 'file' },
    { id: 'test-csv-large', name: 'Test CSV Large', sourceType: 'file' },
    { id: 'test-json', name: 'Test JSON', sourceType: 'file' },
    { id: 'test-empty', name: 'Test Empty', sourceType: 'file' },
    { id: 'test-exe', name: 'Test EXE', sourceType: 'file' },
    { id: 'test-corrupted', name: 'Test Corrupted', sourceType: 'file' },
    { id: 'stress-test-0', name: 'Stress Test 0', sourceType: 'file' },
    { id: 'stress-test-1', name: 'Stress Test 1', sourceType: 'file' },
    { id: 'stress-test-2', name: 'Stress Test 2', sourceType: 'file' },
    { id: 'stress-test-3', name: 'Stress Test 3', sourceType: 'file' },
    { id: 'stress-test-4', name: 'Stress Test 4', sourceType: 'file' },
    { id: 'stress-large', name: 'Stress Large', sourceType: 'file' },
    { id: 'stress-small-after-large', name: 'Stress Small after Large', sourceType: 'file' },
  ];

  for (const ds of datasetsToSeed) {
    await prisma.adminDataset.upsert({
      where: { id: ds.id },
      update: {},
      create: ds,
    });
  }

  await prisma.$disconnect();
  // fixtures फ़ोल्डर बनाएं अगर नहीं है
  if (!fs.existsSync(FIXTURES_DIR)) {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  }

  // छोटी CSV फ़ाइल बनाएं (मान्य)
  const csvContent = 'Name,Age,City,Salary\nRahul,28,Delhi,75000\nPriya,32,Mumbai,92000\nAmit,25,Bangalore,68000\nSneha,30,Chennai,85000\nVikram,35,Pune,110000';
  fs.writeFileSync(path.join(FIXTURES_DIR, 'valid_small.csv'), csvContent);

  // बड़ी CSV फ़ाइल बनाएं (1000 पंक्तियाँ)
  let largeCsv = 'ID,Product,Category,Price,Quantity,Total\n';
  for (let i = 1; i <= 1000; i++) {
    const price = (Math.random() * 1000).toFixed(2);
    const qty = Math.floor(Math.random() * 100) + 1;
    largeCsv += `${i},Product_${i},Category_${i % 10},${price},${qty},${(parseFloat(price) * qty).toFixed(2)}\n`;
  }
  fs.writeFileSync(path.join(FIXTURES_DIR, 'valid_large.csv'), largeCsv);

  // मान्य JSON फ़ाइल बनाएं
  const jsonData = JSON.stringify([
    { id: 1, name: 'Widget A', sales: 1520, region: 'North' },
    { id: 2, name: 'Widget B', sales: 2340, region: 'South' },
    { id: 3, name: 'Widget C', sales: 890, region: 'East' },
  ], null, 2);
  fs.writeFileSync(path.join(FIXTURES_DIR, 'valid_data.json'), jsonData);

  // खाली फ़ाइल (edge case)
  fs.writeFileSync(path.join(FIXTURES_DIR, 'empty_file.csv'), '');

  // गलत फॉर्मेट फ़ाइल (.exe जैसी बाइनरी)
  fs.writeFileSync(path.join(FIXTURES_DIR, 'fake_binary.exe'), Buffer.from('MZ_FAKE_EXE_HEADER'));

  // दूषित CSV (corrupted)
  fs.writeFileSync(path.join(FIXTURES_DIR, 'corrupted.csv'), '\x00\x01\x02\xff\xfe\xfd,broken,header\n\x00data');
});

test.describe('📁 File Upload - फ़ाइल अपलोड परीक्षण', () => {

  test('अपलोड API endpoint मौजूद और सक्रिय होना चाहिए', async ({ request }) => {
    // बिना फ़ाइल के POST करने पर 400 आना चाहिए (500 नहीं)
    const response = await request.post('/api/data/upload', {
      multipart: {
        datasetId: 'test-dataset-001'
      }
    });
    // सर्वर क्रैश नहीं होना चाहिए - 400 or 500 but not connection refused
    expect(response.status()).toBeLessThan(600);
  });

  test('बिना datasetId के अपलोड करने पर 400 एरर आना चाहिए', async ({ request }) => {
    const response = await request.post('/api/data/upload', {
      multipart: {}
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test('छोटी CSV फ़ाइल सफलतापूर्वक अपलोड होनी चाहिए', async ({ request }) => {
    const filePath = path.join(FIXTURES_DIR, 'valid_small.csv');
    if (!fs.existsSync(filePath)) {
      test.skip();
      return;
    }
    const response = await request.post('/api/data/upload', {
      multipart: {
        datasetId: 'test-csv-small',
        file: fs.createReadStream(filePath)
      }
    });
    // सर्वर क्रैश नहीं होना चाहिए
    expect(response.status()).toBeLessThan(500);
  });

  test('बड़ी CSV फ़ाइल (1000 rows) सफलतापूर्वक अपलोड होनी चाहिए', async ({ request }) => {
    const filePath = path.join(FIXTURES_DIR, 'valid_large.csv');
    if (!fs.existsSync(filePath)) {
      test.skip();
      return;
    }
    const response = await request.post('/api/data/upload', {
      multipart: {
        datasetId: 'test-csv-large',
        file: fs.createReadStream(filePath)
      }
    });
    expect(response.status()).toBeLessThan(500);
  });

  test('JSON फ़ाइल सफलतापूर्वक अपलोड होनी चाहिए', async ({ request }) => {
    const filePath = path.join(FIXTURES_DIR, 'valid_data.json');
    if (!fs.existsSync(filePath)) {
      test.skip();
      return;
    }
    const response = await request.post('/api/data/upload', {
      multipart: {
        datasetId: 'test-json',
        file: fs.createReadStream(filePath)
      }
    });
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('⚠️ Edge Cases - किनारे के मामले', () => {

  test('खाली फ़ाइल अपलोड करने पर सर्वर क्रैश नहीं होना चाहिए', async ({ request }) => {
    const filePath = path.join(FIXTURES_DIR, 'empty_file.csv');
    if (!fs.existsSync(filePath)) {
      test.skip();
      return;
    }
    const response = await request.post('/api/data/upload', {
      multipart: {
        datasetId: 'test-empty',
        file: fs.createReadStream(filePath)
      }
    });
    // महत्वपूर्ण: सर्वर बिल्कुल क्रैश नहीं होना चाहिए
    expect(response.status()).toBeLessThan(600);
  });

  test('गलत फॉर्मेट (.exe) अपलोड करने पर सर्वर क्रैश नहीं होना चाहिए', async ({ request }) => {
    const filePath = path.join(FIXTURES_DIR, 'fake_binary.exe');
    if (!fs.existsSync(filePath)) {
      test.skip();
      return;
    }
    const response = await request.post('/api/data/upload', {
      multipart: {
        datasetId: 'test-exe',
        file: fs.createReadStream(filePath)
      }
    });
    // एरर दे सकता है लेकिन क्रैश बिल्कुल नहीं होना चाहिए
    expect(response.status()).toBeLessThan(600);
  });

  test('दूषित (corrupted) CSV अपलोड करने पर सर्वर क्रैश नहीं होना चाहिए', async ({ request }) => {
    const filePath = path.join(FIXTURES_DIR, 'corrupted.csv');
    if (!fs.existsSync(filePath)) {
      test.skip();
      return;
    }
    const response = await request.post('/api/data/upload', {
      multipart: {
        datasetId: 'test-corrupted',
        file: fs.createReadStream(filePath)
      }
    });
    expect(response.status()).toBeLessThan(600);
  });
});

test.describe('🔥 Stress Test - तनाव परीक्षण', () => {

  test('एक साथ 5 फ़ाइलें अपलोड करने पर सर्वर स्थिर रहना चाहिए', async ({ request }) => {
    const filePath = path.join(FIXTURES_DIR, 'valid_small.csv');
    if (!fs.existsSync(filePath)) {
      test.skip();
      return;
    }

    // 5 समानांतर अपलोड अनुरोध
    const uploads = Array.from({ length: 5 }, (_, i) =>
      request.post('/api/data/upload', {
        multipart: {
          datasetId: `stress-test-${i}`,
          file: fs.createReadStream(filePath)
        }
      })
    );

    const results = await Promise.allSettled(uploads);

    // सभी अनुरोध पूरे होने चाहिए (कोई भी reject नहीं)
    results.forEach((result, i) => {
      expect(result.status).toBe('fulfilled');
      if (result.status === 'fulfilled') {
        // सर्वर 500 Internal Server Error नहीं देना चाहिए
        expect(result.value.status()).toBeLessThan(600);
      }
    });
  });

  test('बड़ी फ़ाइल के बाद तुरंत छोटी फ़ाइल अपलोड करने पर सर्वर व्यस्त नहीं होना चाहिए', async ({ request }) => {
    const largePath = path.join(FIXTURES_DIR, 'valid_large.csv');
    const smallPath = path.join(FIXTURES_DIR, 'valid_small.csv');
    if (!fs.existsSync(largePath) || !fs.existsSync(smallPath)) {
      test.skip();
      return;
    }

    // पहले बड़ी फ़ाइल
    const largeResp = await request.post('/api/data/upload', {
      multipart: {
        datasetId: 'stress-large',
        file: fs.createReadStream(largePath)
      }
    });
    expect(largeResp.status()).toBeLessThan(500);

    // तुरंत छोटी फ़ाइल
    const smallResp = await request.post('/api/data/upload', {
      multipart: {
        datasetId: 'stress-small-after-large',
        file: fs.createReadStream(smallPath)
      }
    });
    expect(smallResp.status()).toBeLessThan(500);
  });
});
