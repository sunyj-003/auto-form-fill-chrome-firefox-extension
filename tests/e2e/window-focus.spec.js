// 页面可见性与焦点相关行为测试
// 运行: npx playwright test tests/e2e/window-focus.spec.js --project=chromium --headed

const { test, expect } = require('@playwright/test');
const { installInjectedExtension } = require('./helpers/module-injection');

test.describe('Visibility And Focus Behavior', () => {

  test('should fill when window is focused', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#native-username', { timeout: 10000 });

    await installInjectedExtension(page, {
      formSettings: { name: true, email: true },
      autoFillEnabled: true,
    });
    await page.waitForTimeout(500);

    const focusState = await page.evaluate(() => ({
      hidden: document.hidden,
      hasFocus: document.hasFocus()
    }));
    expect(focusState.hasFocus).toBe(true);

    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
    await page.waitForTimeout(1500);

    const username = await page.evaluate(() => document.querySelector('#native-username')?.value);
    expect(username).toBeTruthy();
  });

  test('should skip fill when document is hidden (tab switch)', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#native-username', { timeout: 10000 });

    await installInjectedExtension(page, {
      formSettings: { name: true, email: true },
      autoFillEnabled: true,
    });
    await page.waitForTimeout(500);

    const initialValue = await page.evaluate(() => document.querySelector('#native-username')?.value || '');

    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        get: () => true,
        configurable: true
      });
      Object.defineProperty(document, 'visibilityState', {
        get: () => 'hidden',
        configurable: true
      });
    });

    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill(false));
    await page.waitForTimeout(500);

    const afterValue = await page.evaluate(() => document.querySelector('#native-username')?.value || '');
    expect(afterValue).toBe(initialValue);
  });

  test('should still fill when window loses focus but document is visible', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#native-username', { timeout: 10000 });

    await installInjectedExtension(page, {
      formSettings: { name: true, email: true },
      autoFillEnabled: true,
    });
    await page.waitForTimeout(500);

    const initialValue = await page.evaluate(() => document.querySelector('#native-username')?.value || '');

    await page.evaluate(() => {
      window._originalHasFocus = document.hasFocus;
      document.hasFocus = () => false;
    });

    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill(false));
    await page.waitForTimeout(1500);

    const afterValue = await page.evaluate(() => document.querySelector('#native-username')?.value || '');
    await page.evaluate(() => {
      if (window._originalHasFocus) {
        document.hasFocus = window._originalHasFocus;
      }
    });

    expect(afterValue).toBeTruthy();
    expect(afterValue).not.toBe(initialValue);
  });

  test('should detect hidden document', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    await installInjectedExtension(page, { formSettings: {} });
    await page.waitForTimeout(500);

    const visibilityInfo = await page.evaluate(() => ({
      hidden: document.hidden,
      visibilityState: document.visibilityState,
      hasFocus: document.hasFocus()
    }));

    expect(visibilityInfo.hidden).toBe(false);
    expect(visibilityInfo.visibilityState).toBe('visible');
  });
});
