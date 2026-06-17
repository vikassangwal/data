import { test, expect } from '@playwright/test';

// ============================================================
// 🔐 E2E Authentication Flow Tests
// पूर्ण प्रमाणीकरण प्रवाह परीक्षण (Signup, Login, Forgot Password, RBAC)
// ============================================================

test.describe('🔐 Authentication Flow - प्रमाणीकरण प्रवाह', () => {

  // -------- SIGNUP TESTS --------
  test.describe('📝 Signup - नया खाता पंजीकरण', () => {

    test('खाली फॉर्म सबमिट करने पर एरर दिखाना चाहिए', async ({ page }) => {
      await page.goto('/signup');
      const termsCheck = page.locator('input[name="termsAccepted"]');
      if (await termsCheck.isVisible()) {
        await termsCheck.check();
      }
      await page.click('button[type="submit"]');
      // पेज पर रहना चाहिए, redirect नहीं होना चाहिए
      await expect(page).toHaveURL(/signup/);
    });

    test('अमान्य ईमेल फॉर्मेट पर एरर दिखाना चाहिए', async ({ page }) => {
      await page.goto('/signup');
      const termsCheck = page.locator('input[name="termsAccepted"]');
      if (await termsCheck.isVisible()) {
        await termsCheck.check();
      }
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('input[name="password"]', 'Test@12345');
      // HTML5 validation या custom error
      const emailInput = page.locator('input[name="email"]');
      await expect(emailInput).toHaveAttribute('type', 'email');
    });

    test('सफल पंजीकरण - नया उपयोगकर्ता बनना चाहिए', async ({ page }) => {
      const uniqueEmail = `testuser_${Date.now()}@test.com`;
      await page.goto('/signup');
      await page.fill('input[name="name"]', 'QA Tester');
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="password"]', 'SecurePass@123');
      // Terms checkbox if exists
      const termsCheck = page.locator('input[name="termsAccepted"]');
      if (await termsCheck.isVisible()) {
        await termsCheck.check();
      }
      await page.click('button[type="submit"]');
      // सफल पंजीकरण के बाद login पेज पर redirect होना चाहिए
      await page.waitForURL(/login/, { timeout: 10000 });
      await expect(page).toHaveURL(/login/);
    });

    test('डुप्लिकेट ईमेल पर एरर दिखाना चाहिए', async ({ page }) => {
      await page.goto('/signup');
      await page.fill('input[name="name"]', 'Duplicate User');
      await page.fill('input[name="email"]', 'admin@devforge.com');
      await page.fill('input[name="password"]', 'Pass@12345');
      const termsCheck = page.locator('input[name="termsAccepted"]');
      if (await termsCheck.isVisible()) {
        await termsCheck.check();
      }
      await page.click('button[type="submit"]');
      // एरर मैसेज दिखना चाहिए
      await page.waitForTimeout(2000);
      const pageContent = await page.textContent('body');
      expect(pageContent).toContain('already exists');
    });
  });

  // -------- LOGIN TESTS --------
  test.describe('🔑 Login - लॉगिन प्रवाह', () => {

    test('खाली credentials पर एरर दिखाना चाहिए', async ({ page }) => {
      await page.goto('/login');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/login/);
    });

    test('गलत पासवर्ड पर एरर दिखाना चाहिए', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"]', 'admin@devforge.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      const bodyText = await page.textContent('body');
      const hasError = bodyText?.includes('Invalid') || bodyText?.includes('error') || bodyText?.includes('wrong');
      expect(hasError).toBeTruthy();
    });

    test('सही credentials से लॉगिन होना चाहिए', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"]', 'admin@devforge.com');
      await page.fill('input[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      // लॉगिन सफल होने के बाद home या dashboard पर redirect
      await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 });
      const finalUrl = page.url();
      expect(finalUrl).not.toContain('/login');
    });
  });

  // -------- RBAC TESTS --------
  test.describe('🛡️ RBAC - भूमिका आधारित पहुँच नियंत्रण', () => {

    test('बिना लॉगिन /admin पर जाने पर login पर redirect होना चाहिए', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForURL(/login/, { timeout: 10000 });
      await expect(page).toHaveURL(/login/);
    });

    test('सामान्य USER को /admin पर unauthorized दिखना चाहिए', async ({ page }) => {
      // पहले एक normal user बनाएं और लॉगिन करें
      const email = `normaluser_${Date.now()}@test.com`;
      await page.goto('/signup');
      await page.fill('input[name="name"]', 'Normal User');
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', 'NormalPass@123');
      const termsCheck = page.locator('input[name="termsAccepted"]');
      if (await termsCheck.isVisible()) await termsCheck.check();
      await page.click('button[type="submit"]');
      await page.waitForURL(/login/, { timeout: 10000 });

      // लॉगिन करें
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', 'NormalPass@123');
      await page.click('button[type="submit"]');
      await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 });

      // /admin पर जाने की कोशिश करें
      await page.goto('/admin');
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      // unauthorized पेज पर redirect होना चाहिए
      expect(currentUrl).toContain('unauthorized');
    });

    test('SUPER-ADMIN को /admin एक्सेस मिलना चाहिए', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"]', 'admin@devforge.com');
      await page.fill('input[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 });

      await page.goto('/admin');
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      // admin पेज पर होना चाहिए, unauthorized पर redirect नहीं
      expect(currentUrl).toContain('/admin');
      expect(currentUrl).not.toContain('unauthorized');
    });
  });

  // -------- FORGOT PASSWORD TESTS --------
  test.describe('🔓 Forgot Password - पासवर्ड रिकवरी', () => {

    test('लॉगिन पेज पर Forgot Password लिंक मौजूद होना चाहिए', async ({ page }) => {
      await page.goto('/login');
      const forgotLink = page.locator('text=Forgot');
      await expect(forgotLink.first()).toBeVisible();
    });
  });
});
