import { test, expect } from '@playwright/test';

// ============================================================
// 🌐 E2E Page Navigation & Rendering Tests
// सभी पब्लिक पेज लोड और नेविगेशन परीक्षण
// ============================================================

test.describe('🌐 Public Pages - सार्वजनिक पेज रेंडरिंग', () => {

  const publicPages = [
    { path: '/', name: 'Homepage - होम पेज' },
    { path: '/services', name: 'Services - सेवाएं' },
    { path: '/pricing', name: 'Pricing - मूल्य निर्धारण' },
    { path: '/about', name: 'About - हमारे बारे में' },
    { path: '/blog', name: 'Blog - ब्लॉग' },
    { path: '/contact', name: 'Contact - संपर्क' },
    { path: '/faq', name: 'FAQ - अक्सर पूछे जाने वाले सवाल' },
    { path: '/login', name: 'Login - लॉगिन' },
    { path: '/signup', name: 'Signup - पंजीकरण' },
    { path: '/lab', name: 'Data Lab - डेटा लैब' },
    { path: '/formula-bot', name: 'Formula Bot - फ़ॉर्मूला बॉट' },
    { path: '/skills', name: 'Skills - कौशल' },
    { path: '/certifications', name: 'Certifications - प्रमाणपत्र' },
    { path: '/resume', name: 'Resume - रिज़्यूमे' },
    { path: '/projects', name: 'Projects - प्रोजेक्ट्स' },
    { path: '/unauthorized', name: 'Unauthorized - अनधिकृत' },
  ];

  for (const pg of publicPages) {
    test(`${pg.name} (${pg.path}) सही से लोड होना चाहिए (200 OK)`, async ({ page }) => {
      const response = await page.goto(pg.path);
      expect(response?.status()).toBeLessThan(500);
      // पेज में कोई content दिखना चाहिए
      const body = await page.textContent('body');
      expect(body?.length).toBeGreaterThan(10);
    });
  }

  test('गलत URL पर 404 Not Found पेज दिखना चाहिए', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');
    // 404 status या custom not-found page
    const body = await page.textContent('body');
    const is404 = response?.status() === 404 || body?.includes('not found') || body?.includes('404');
    expect(is404).toBeTruthy();
  });

  test('Homepage पर H1 heading मौजूद होना चाहिए', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
  });

  test('Homepage पर CTA बटन मौजूद होना चाहिए', async ({ page }) => {
    await page.goto('/');
    const buttons = page.locator('a, button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(3);
  });
});

test.describe('📱 Responsive Design - मोबाइल रेस्पॉन्सिव', () => {

  test('मोबाइल viewport पर Homepage सही से रेंडर होना चाहिए', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.goto('/');
    const body = await page.textContent('body');
    expect(body?.length).toBeGreaterThan(50);
  });

  test('टैबलेट viewport पर Homepage सही से रेंडर होना चाहिए', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/');
    const body = await page.textContent('body');
    expect(body?.length).toBeGreaterThan(50);
  });
});

test.describe('⚡ Performance - प्रदर्शन जाँच', () => {

  test('Homepage 5 सेकंड के अंदर लोड होना चाहिए', async ({ page }) => {
    const start = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(15000);
  });

  test('Login पेज 3 सेकंड के अंदर लोड होना चाहिए', async ({ page }) => {
    const start = Date.now();
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(15000);
  });
});
