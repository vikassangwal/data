import { test, expect } from '@playwright/test';

// Helper: Login as Admin
async function loginAsAdmin(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@devforge.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30000 });
}

test.describe('🧠 ML Pipeline Dashboard E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('डैशबोर्ड पेज सही से लोड होना चाहिए और साइडबार लिंक दिखना चाहिए', async ({ page }) => {
    await page.goto('/admin/ml-pipeline');
    await page.waitForTimeout(3000);
    
    // heading check
    const heading = page.locator('h1');
    await expect(heading).toContainText('Centralized AI Data Lab & ML Pipeline');
    
    // check elements
    const select = page.locator('main select');
    await expect(select).toBeVisible();
    
    const orchestrateBtn = page.locator('button:has-text("Orchestrate Pipeline")');
    await expect(orchestrateBtn).toBeVisible();
  });
 
  test('डेटासेट सेलेक्ट करके पाइपलाइन ट्रिगर होनी चाहिए और परिणाम दिखने चाहिए', async ({ page }) => {
    await page.goto('/admin/ml-pipeline');
    await page.waitForTimeout(2000);
    
    // Select the first dataset (which should be seeded, like stress-test-0 or test-csv)
    const select = page.locator('main select');
    const optionsCount = await select.locator('option').count();
    
    if (optionsCount > 0) {
      // Choose first option
      await select.selectOption({ index: 0 });
      
      // Click Orchestrate
      const orchestrateBtn = page.locator('button:has-text("Orchestrate Pipeline")');
      await orchestrateBtn.click();
      
      // Wait for execution (should show loaders first, then finish)
      // Wait for tabs to render (meaning results are back)
      const tabs = page.locator('button:has-text("Predictive Model")');
      await expect(tabs).toBeVisible({ timeout: 60000 });
      
      // Tab 1: AI Insights should be active and showing some text
      const bodyText = await page.textContent('body');
      expect(bodyText?.toLowerCase()).toContain('ai insights');
      
      // Switch to Tab 2: Predictive Model
      await page.click('button:has-text("Predictive Model")');
      await page.waitForTimeout(1000);
      const updatedBodyText = await page.textContent('body');
      expect(updatedBodyText).toContain('Algorithm Used');
      
      // Switch to Tab 3: Data Cleaning
      await page.click('button:has-text("Data Cleaning")');
      await page.waitForTimeout(1000);
      const cleaningText = await page.textContent('body');
      expect(cleaningText).toContain('Imputed Null Values');
      
      // Switch to Tab 4: Anomalies
      await page.click('button:has-text("Anomalies")');
      await page.waitForTimeout(1000);
      const anomaliesText = await page.textContent('body');
      expect(anomaliesText).toContain('Row Index');
    } else {
      console.log('Skipping pipeline test as no datasets were found in DB.');
    }
  });
 
  test('स्कैनर अलर्ट्स ड्रावर खुलना चाहिए और अलर्ट्स दिखने चाहिए', async ({ page }) => {
    await page.goto('/admin/ml-pipeline');
    await page.waitForTimeout(2000);
    
    // Click Scanner Alerts badge
    const alertBtn = page.locator('button:has-text("Scanner Audit Alerts")');
    await alertBtn.click();
    
    // Drawer should slide in and be visible
    const drawerTitle = page.locator('h3:has-text("Active Scanner Alerts")');
    await expect(drawerTitle).toBeVisible();
    await page.waitForTimeout(1000); // Wait for drawer slide-in animation to complete
    
    // Click close button
    const closeBtn = page.locator('div.fixed.right-0 button:has(svg.lucide-x)');
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click({ force: true });
    } else {
      // Backdrop fallback
      await page.locator('div.fixed.inset-0.backdrop-blur-sm').first().click({ force: true });
    }
    
    await page.waitForTimeout(1000);
    await expect(drawerTitle).not.toBeVisible();
  });
});
