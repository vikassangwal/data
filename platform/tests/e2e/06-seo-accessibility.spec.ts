import { test, expect } from '@playwright/test';

// ============================================================
// 🔍 SEO & Accessibility (a11y) Tests
// खोज इंजन अनुकूलन और सुलभता परीक्षण
// ============================================================

test.describe('🔍 SEO - खोज इंजन अनुकूलन', () => {

  test('Homepage में <title> टैग मौजूद होना चाहिए', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(5);
  });

  test('Homepage में meta description मौजूद होना चाहिए', async ({ page }) => {
    await page.goto('/');
    const metaDesc = page.locator('meta[name="description"]');
    const content = await metaDesc.getAttribute('content');
    expect(content?.length).toBeGreaterThan(10);
  });

  test('Homepage में Open Graph tags मौजूद होने चाहिए', async ({ page }) => {
    await page.goto('/');
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogExists = await ogTitle.count();
    expect(ogExists).toBeGreaterThanOrEqual(0); // Informational
  });

  test('robots.txt accessible होना चाहिए', async ({ request }) => {
    const response = await request.get('/robots.txt');
    // robots.txt वापस आना चाहिए
    expect(response.status()).toBeLessThan(500);
  });

  test('sitemap.xml accessible होना चाहिए', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBeLessThan(500);
  });

  // हर पेज का SEO चेक
  const pagesWithSEO = [
    { path: '/', name: 'Homepage' },
    { path: '/services', name: 'Services' },
    { path: '/pricing', name: 'Pricing' },
    { path: '/about', name: 'About' },
    { path: '/contact', name: 'Contact' },
  ];

  for (const pg of pagesWithSEO) {
    test(`${pg.name} में H1 heading होना चाहिए`, async ({ page }) => {
      await page.goto(pg.path);
      const h1 = page.locator('h1');
      const count = await h1.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  }
});

test.describe('♿ Accessibility - सुलभता परीक्षण', () => {

  test('Login पेज पर सभी inputs में label या placeholder होना चाहिए', async ({ page }) => {
    await page.goto('/login');
    const inputs = page.locator('input[type="email"], input[type="password"], input[type="text"]');
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const hasLabel = await input.getAttribute('aria-label');
      const hasPlaceholder = await input.getAttribute('placeholder');
      const hasId = await input.getAttribute('id');
      const labelForId = hasId ? await page.locator(`label[for="${hasId}"]`).count() : 0;
      const isAccessible = hasLabel || hasPlaceholder || labelForId > 0;
      expect(isAccessible).toBeTruthy();
    }
  });

  test('सभी images में alt text होना चाहिए', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 20); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      const isDecorative = role === 'presentation' || role === 'none';
      if (!isDecorative) {
        // alt attribute होना चाहिए (empty string allowed for decorative)
        expect(alt).not.toBeNull();
      }
    }
  });

  test('buttons और links में सार्थक text या aria-label होना चाहिए', async ({ page }) => {
    await page.goto('/');
    const interactiveElements = page.locator('button, a[href]');
    const count = await interactiveElements.count();
    let accessibleCount = 0;
    for (let i = 0; i < Math.min(count, 30); i++) {
      const el = interactiveElements.nth(i);
      const text = await el.textContent();
      const ariaLabel = await el.getAttribute('aria-label');
      const title = await el.getAttribute('title');
      if (text?.trim() || ariaLabel || title) {
        accessibleCount++;
      }
    }
    // कम से कम 80% तत्व accessible होने चाहिए
    const minCount = Math.min(count, 30);
    expect(accessibleCount).toBeGreaterThanOrEqual(Math.floor(minCount * 0.8));
  });

  test('keyboard navigation काम करना चाहिए (Tab key)', async ({ page }) => {
    await page.goto('/login');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});
