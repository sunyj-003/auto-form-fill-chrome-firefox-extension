// Naive UI 注入式填充流程测试
// 运行: npx playwright test tests/e2e/naive-ui-fill.spec.js --project=chromium --headed

const { test, expect } = require('@playwright/test');
const { installInjectedExtension } = require('./helpers/module-injection');

test.describe('Naive UI Injected Autofill Flow', () => {

  test('should fill Naive UI form with fake data', async ({ page }) => {
    await page.goto('/naive-ui-mock.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await installInjectedExtension(page, { autoFillEnabled: true });
    await expect.poll(async () => {
      return page.evaluate(() => {
        const getVal = (id) => {
          const el = document.querySelector(id);
          return el ? (el.value || el.querySelector('input')?.value || el.textContent?.trim()) : '';
        };
        return {
          username: getVal('#naive-username'),
          email: getVal('#naive-email'),
        };
      });
    }).toMatchObject({
      username: expect.any(String),
      email: expect.stringMatching(/@/),
    });

    const results = await page.evaluate(() => {
      const getVal = (id) => {
        const el = document.querySelector(id);
        return el ? (el.value || el.querySelector('input')?.value || el.textContent?.trim()) : '';
      };
      return {
        username: getVal('#naive-username'),
        email: getVal('#naive-email'),
        country: getVal('#naive-country'),
        city: getVal('#naive-city'),
        agree: document.querySelector('#naive-agree input')?.checked || false
      };
    });

    expect(results.username).toBeTruthy();
    expect(results.email).toMatch(/@/);
  });

  test('should detect window focus state correctly', async ({ page }) => {
    await page.goto('/naive-ui.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await installInjectedExtension(page, { formSettings: {} });
    await page.waitForTimeout(500);

    const focusState = await page.evaluate(() => ({
      hidden: document.hidden,
      hasFocus: document.hasFocus(),
      visibilityState: document.visibilityState
    }));

    expect(focusState.hasFocus).toBe(true);
    expect(focusState.visibilityState).toBe('visible');
  });

  test('should still fill when window is not focused but document stays visible', async ({ page }) => {
    await page.goto('/naive-ui.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await installInjectedExtension(page, { formSettings: { name: true } });
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      document.hasFocus = () => false;
    });

    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
    await expect.poll(async () => {
      return page.evaluate(() => {
        const naiveInput = document.querySelector('#naive-username');
        if (!naiveInput) return '';
        const input = naiveInput.querySelector('input') || naiveInput;
        return input ? input.value : '';
      });
    }).toEqual(expect.any(String));

    const inputValue = await page.evaluate(() => {
      const naiveInput = document.querySelector('#naive-username');
      if (!naiveInput) return '';
      const input = naiveInput.querySelector('input') || naiveInput;
      return input ? input.value : '';
    });

    expect(inputValue).toBeTruthy();
  });
});
