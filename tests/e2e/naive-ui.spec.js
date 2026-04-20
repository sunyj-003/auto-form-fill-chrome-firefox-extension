// Naive UI 注入式模块测试
// 运行: npx playwright test tests/e2e/naive-ui.spec.js

const { test, expect } = require('@playwright/test');
const { installInjectedExtension } = require('./helpers/module-injection');

test.describe('Naive UI Injected Module Tests', () => {

  test('should inject modules and detect Naive UI page structure', async ({ page }) => {
    await page.goto('/naive-ui.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await installInjectedExtension(page, { autoFillEnabled: true });
    await page.waitForTimeout(500);

    const hasExtension = await page.evaluate(() => typeof window.__bengaliFakeFill === 'function');
    expect(hasExtension).toBe(true);

    const hasNaiveStructure = await page.evaluate(() => {
      return {
        hasVue: typeof window.Vue !== 'undefined',
        hasNaiveTags: document.body.innerHTML.includes('n-input') || document.body.innerHTML.includes('n-form'),
        hasAppNormal: document.querySelector('#app-normal') !== null
      };
    });
    expect(hasNaiveStructure.hasNaiveTags).toBe(true);
  });

  test('should collect form elements through the injected module stack', async ({ page }) => {
    await page.goto('/naive-ui.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await installInjectedExtension(page, { autoFillEnabled: true });
    await page.waitForTimeout(500);

    const elements = await page.evaluate(() => {
      try {
        const list = window.__BengaliCollector__.createCollectionState();
        return window.__BengaliCollector__.collectFromRoot(document, list).then(() => ({
          total: list.items.length,
          types: Array.from(new Set(list.items.map((item) => item.type))).sort(),
        }));
      } catch (e) {
        return { error: e.message };
      }
    });

    expect(elements.error).toBeUndefined();
    expect(elements.total).toBeGreaterThan(0);
    expect(elements.types.length).toBeGreaterThan(0);
  });

  test('should expose focus-related document state for window differentiation checks', async ({ page }) => {
    await page.goto('/naive-ui.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await installInjectedExtension(page, { formSettings: {}, autoFillEnabled: true });
    await page.waitForTimeout(500);

    const focusState = await page.evaluate(() => {
      return {
        hidden: document.hidden,
        hasFocus: document.hasFocus(),
        visibilityState: document.visibilityState
      };
    });
    expect(typeof focusState.hidden).toBe('boolean');
    expect(typeof focusState.hasFocus).toBe('boolean');
  });
});
