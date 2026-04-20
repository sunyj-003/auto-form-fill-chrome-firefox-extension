// Naive UI 结构诊断测试
// 运行: npx playwright test tests/e2e/naive-ui-debug.spec.js --project=chromium --headed

const { test, expect } = require('@playwright/test');
const { installInjectedExtension } = require('./helpers/module-injection');

test.describe('Naive UI Diagnostics', () => {

  test('should inspect Naive UI form rendering and injected fill hooks', async ({ page }) => {
    await page.goto('/naive-ui.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const domInfo = await page.evaluate(() => {
      return {
        vueLoaded: typeof window.Vue !== 'undefined',
        naiveLoaded: typeof window.naive !== 'undefined',
        nInputCount: document.querySelectorAll('.n-input').length,
        nativeInputCount: document.querySelectorAll('input').length,
        appNormal: !!document.querySelector('#app-normal'),
        bodyInner: document.body.innerHTML.substring(0, 500)
      };
    });

    await installInjectedExtension(page, {
      formSettings: { name: true, email: true, phone: true },
      autoFillEnabled: true,
    });
    const extLoaded = await page.evaluate(() => typeof window.__bengaliFakeFill === 'function');

    const inputInfo = await page.evaluate(() => {
      const el = document.querySelector('.n-input');
      if (!el) return 'No .n-input found';

      return {
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        innerHTML: el.innerHTML.substring(0, 200),
        childCount: el.children.length,
        firstChild: el.firstElementChild?.tagName,
        firstChildClass: el.firstElementChild?.className
      };
    });

    await page.evaluate(() => {
      window.__bengaliFakeFill && window.__bengaliFakeFill();
    });

    await expect.poll(async () => {
      return page.evaluate(() => ({
        username: document.querySelector('#naive-username')?.value || '',
        email: document.querySelector('#naive-email')?.value || '',
      }));
    }).toMatchObject({
      username: expect.any(String),
      email: expect.stringMatching(/@/),
    });

    const fillResult = await page.evaluate(() => ({
      username: document.querySelector('#naive-username')?.value || '',
      email: document.querySelector('#naive-email')?.value || '',
      nInputCount: document.querySelectorAll('.n-input').length,
      nativeInputCount: document.querySelectorAll('input').length,
    }));

    expect(domInfo.nInputCount).toBeGreaterThan(0);
    expect(domInfo.nativeInputCount).toBeGreaterThan(0);
    expect(extLoaded).toBe(true);
    expect(inputInfo).toBeTruthy();
    expect(fillResult.username).toBeTruthy();
    expect(fillResult.email).toContain('@');
  });
});
