// 注入式持续自动填充测试
// 运行: npx playwright test tests/e2e/auto-fill.spec.js

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { installInjectedExtension } = require('./helpers/module-injection');

test.describe('Injected Auto-Fill Behavior', () => {
  const screenshotDir = path.resolve(__dirname, '../../artifacts/test-report');

  function ensureScreenshotDir() {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  async function readDynamicStepValues(page) {
    return page.evaluate(() => ({
      step1: {
        name: document.querySelector('#dynamic-name-1')?.value || '',
        email: document.querySelector('#dynamic-email-1')?.value || '',
      },
      step2: {
        phone: document.querySelector('#dynamic-phone-2')?.value || '',
        address: document.querySelector('#dynamic-address-2')?.value || '',
      },
      step3: {
        company: document.querySelector('#dynamic-company-3')?.value || '',
        position: document.querySelector('#dynamic-position-3')?.value || '',
      }
    }));
  }

  async function readNavigationValues(page) {
    return page.evaluate(() => ({
      page1: {
        username: document.querySelector('#nav-username')?.value || '',
        password: document.querySelector('#nav-password')?.value || '',
      },
      page2: {
        realname: document.querySelector('#nav-realname')?.value || '',
        phone: document.querySelector('#nav-phone')?.value || '',
      }
    }));
  }

  test('should fill dynamic loaded form elements', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#dynamic-name-1', { timeout: 15000 });

    await installInjectedExtension(page, {
      formSettings: { name: true, email: true, phone: true, address: true, company: true },
      autoFillEnabled: true,
    });
    await expect.poll(async () => {
      const values = await readDynamicStepValues(page);
      return values.step1;
    }).toMatchObject({
      name: expect.any(String),
      email: expect.stringMatching(/@/),
    });

    await page.click('#nextStepBtn');
    await expect.poll(async () => {
      const values = await readDynamicStepValues(page);
      return values.step2;
    }).toMatchObject({
      phone: expect.any(String),
      address: expect.any(String),
    });

    ensureScreenshotDir();
    await page.evaluate(() => {
      document.querySelector('#dynamic-phone-2')?.scrollIntoView({ block: 'center' });
    });
    await page.screenshot({
      path: path.join(screenshotDir, 'dynamic-step-2-filled.png'),
      fullPage: true,
    });

    await page.click('#nextStepBtn');
    await expect.poll(async () => {
      const values = await readDynamicStepValues(page);
      return values.step3;
    }).toMatchObject({
      company: expect.any(String),
    });
  });

  test('should fill after page navigation', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#nav-username', { timeout: 15000 });

    await installInjectedExtension(page, {
      formSettings: { name: true, email: true, phone: true, password: true },
      autoFillEnabled: true,
    });
    await expect.poll(async () => {
      const values = await readNavigationValues(page);
      return values.page1;
    }).toMatchObject({
      username: expect.any(String),
      password: expect.any(String),
    });

    await page.click('#nextNavBtn');
    await expect.poll(async () => {
      const values = await readNavigationValues(page);
      return values.page2;
    }).toMatchObject({
      realname: expect.any(String),
      phone: expect.any(String),
    });
  });

  test('should NOT fill when auto-fill is disabled', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#dynamic-name-1', { timeout: 15000 });

    await installInjectedExtension(page, {
      formSettings: { name: true, email: true, phone: true, address: true },
      autoFillEnabled: false,
    });
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());

    await expect.poll(async () => {
      const values = await readDynamicStepValues(page);
      return values.step1.name;
    }).toEqual(expect.any(String));

    await page.click('#nextStepBtn');
    await expect.poll(async () => {
      const values = await readDynamicStepValues(page);
      return values.step2;
    }).toMatchObject({
      phone: '',
      address: '',
    });
  });
});
