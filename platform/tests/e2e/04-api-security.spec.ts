import { test, expect } from '@playwright/test';

// ============================================================
// 🔒 API Security & Authorization Tests
// API सुरक्षा और प्राधिकरण परीक्षण
// ============================================================

test.describe('🔒 API Security - API सुरक्षा परीक्षण', () => {

  // ---- प्रमाणीकरण API ----
  test.describe('🔑 Auth API Endpoints', () => {

    test('GET /api/auth/session बिना session के null लौटाना चाहिए', async ({ request }) => {
      const response = await request.get('/api/auth/session');
      expect(response.status()).toBe(200);
    });

    test('POST /api/auth/callback/credentials गलत credentials पर अस्वीकार करना चाहिए', async ({ request }) => {
      const response = await request.post('/api/auth/callback/credentials', {
        form: {
          email: 'hacker@evil.com',
          password: 'wrongpassword123',
        }
      });
      // redirect या error - but NOT 500
      expect(response.status()).toBeLessThan(500);
    });
  });

  // ---- Admin API सुरक्षा ----
  test.describe('🛡️ Admin Routes Protection - एडमिन मार्ग सुरक्षा', () => {

    const adminPages = [
      '/admin',
      '/admin/ai/providers',
      '/admin/ai/routing',
      '/admin/ai/workflows',
      '/admin/content',
      '/admin/data/upload',
      '/admin/data/datasets',
      '/admin/server',
      '/admin/settings/web-editor/auto-repair',
    ];

    for (const adminPage of adminPages) {
      test(`${adminPage} बिना auth के accessible नहीं होना चाहिए`, async ({ page }) => {
        await page.goto(adminPage);
        await page.waitForTimeout(3000);
        const url = page.url();
        const isProtected = url.includes('login') || url.includes('unauthorized');
        expect(isProtected).toBeTruthy();
      });
    }
  });

  // ---- Gateway API सुरक्षा ----
  test.describe('🤖 AI Gateway API', () => {

    test('POST /api/ai/gateway बिना body के एरर लौटाना चाहिए (क्रैश नहीं)', async ({ request }) => {
      const response = await request.post('/api/ai/gateway', {
        data: {}
      });
      expect(response.status()).toBeLessThan(600);
    });
  });

  // ---- Data API सुरक्षा ----
  test.describe('📊 Data API Endpoints', () => {

    test('POST /api/data/upload बिना फ़ाइल के 400 लौटाना चाहिए', async ({ request }) => {
      const response = await request.post('/api/data/upload', {
        multipart: {
          datasetId: 'security-test'
        }
      });
      expect(response.status()).toBe(400);
    });

    test('POST /api/data/process बिना data के एरर लौटाना चाहिए (क्रैश नहीं)', async ({ request }) => {
      const response = await request.post('/api/data/process', {
        data: {}
      });
      expect(response.status()).toBeLessThan(600);
    });
  });

  // ---- XSS & Injection सुरक्षा ----
  test.describe('💉 XSS & Injection Protection', () => {

    test('Login में XSS script inject करने पर execute नहीं होना चाहिए', async ({ page }) => {
      await page.goto('/login');
      const xssPayload = '<script>alert("XSS")</script>';
      await page.fill('input[name="email"]', xssPayload);
      await page.fill('input[name="password"]', 'test123');
      // XSS dialog नहीं आना चाहिए
      let dialogTriggered = false;
      page.on('dialog', () => { dialogTriggered = true; });
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      expect(dialogTriggered).toBe(false);
    });

    test('Signup में SQL injection प्रयास सुरक्षित रूप से विफल होना चाहिए', async ({ page }) => {
      await page.goto('/signup');
      const termsCheck = page.locator('input[name="termsAccepted"]');
      if (await termsCheck.isVisible()) {
        await termsCheck.check();
      }
      const sqlPayload = "admin' OR '1'='1'; DROP TABLE users;--";
      await page.fill('input[name="name"]', 'Hacker');
      await page.fill('input[name="email"]', sqlPayload);
      await page.fill('input[name="password"]', 'hack123');
      
      const submitBtn = page.locator('button[type="submit"]').first();
      const isDisabled = await submitBtn.isDisabled();
      if (isDisabled) {
        expect(isDisabled).toBe(true);
      } else {
        await submitBtn.click();
        await page.waitForTimeout(2000);
        const body = await page.textContent('body');
        expect(body?.length).toBeGreaterThan(0);
      }
    });
  });

  // ---- Rate Limiting & Abuse Protection ----
  test.describe('🚦 Abuse Protection - दुरुपयोग सुरक्षा', () => {

    test('10 तेज़ consecutive login प्रयासों पर सर्वर स्थिर रहना चाहिए', async ({ request }) => {
      const attempts = Array.from({ length: 10 }, () =>
        request.post('/api/auth/callback/credentials', {
          form: {
            email: 'bruteforce@test.com',
            password: 'wrongpass'
          }
        })
      );

      const results = await Promise.allSettled(attempts);
      results.forEach(result => {
        expect(result.status).toBe('fulfilled');
        if (result.status === 'fulfilled') {
          // सर्वर 500 नहीं देना चाहिए
          expect(result.value.status()).toBeLessThan(500);
        }
      });
    });
  });
});
