/**
 * Real extension smoke tests.
 * These tests only make sense when the browser is launched with the extension.
 */

const fs = require('fs');
const path = require('path');
const { test, expect } = require('./fixtures/extension-test');
const { triggerShortcutFill } = require('./helpers/real-extension');

test.describe('Chrome Extension Real Load Test', () => {
  const screenshotDir = path.resolve(__dirname, '../../artifacts/test-report');

  function ensureScreenshotDir() {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  test('should keep extension globals isolated from the page world', async ({ page }) => {
    await page.goto('/native-extension.html');

    const globals = await page.evaluate(() => ({
      fakeFill: typeof window.__bengaliFakeFill,
      storageApi: typeof window.__BengaliStorage__,
      fieldDetection: typeof window.__BengaliFieldDetection__,
    }));

    expect(globals).toEqual({
      fakeFill: 'undefined',
      storageApi: 'undefined',
      fieldDetection: 'undefined',
    });
  });

  test('should fill a native form using the loaded extension', async ({ page }) => {
    await page.goto('/native-extension.html');
    await triggerShortcutFill(page);

    await expect.poll(async () => {
      return page.evaluate(() => ({
        username: document.querySelector('#native-username')?.value || '',
        email: document.querySelector('#native-email')?.value || '',
        phone: document.querySelector('#native-phone')?.value || '',
        website: document.querySelector('#native-website')?.value || '',
        agree: document.querySelector('#native-agree')?.checked || false,
        country: document.querySelector('#native-country')?.value || '',
      }));
    }).toMatchObject({
      agree: true,
    });

    const results = await page.evaluate(() => ({
      username: document.querySelector('#native-username')?.value || '',
      email: document.querySelector('#native-email')?.value || '',
      phone: document.querySelector('#native-phone')?.value || '',
      website: document.querySelector('#native-website')?.value || '',
      agree: document.querySelector('#native-agree')?.checked || false,
      country: document.querySelector('#native-country')?.value || '',
    }));

    expect(results.username).toBeTruthy();
    expect(results.email).toMatch(/@/);
    expect(results.phone).toMatch(/^01\d{10}$/);
    expect(results.website).toMatch(/^https?:\/\//);
    expect(results.country).toBeTruthy();
    expect(results.agree).toBe(true);

    ensureScreenshotDir();
    await page.locator('body').screenshot({
      path: path.join(screenshotDir, 'real-extension-native-filled.png'),
    });
  });
});
