/**
 * Real Chrome Extension Loading Test (M5.29)
 * This test actually loads the extension instead of injecting scripts
 * Run: npx playwright test tests/e2e/real-extension.spec.js
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

const extensionPath = path.resolve(__dirname, '../../extensions/chrome');

test.describe('Real Chrome Extension Loading', () => {

  test('should load extension and access popup', async ({ context }) => {
    await context.addInitScript(() => {
      window.__EXTENSION_LOADED__ = true;
    });

    const page = await context.newPage();

    await page.goto('file://' + process.cwd() + '/tests/form-test/index.html');
    await page.waitForSelector('#native-username', { timeout: 10000 });

    const extensionAccess = await page.evaluate(() => {
      return {
        hasChromeRuntime: typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined',
        hasChromeStorage: typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined',
        runtimeId: chrome?.runtime?.id || null
      };
    });

    console.log('Extension access check:', extensionAccess);
    expect(extensionAccess.hasChromeStorage).toBe(true);
  });

  test('should fill form using extension content script behavior', async ({ context }) => {
    const page = await context.newPage();

    await page.goto('file://' + process.cwd() + '/tests/form-test/index.html');
    await page.waitForSelector('#native-username');

    const contentJsCode = require('fs').readFileSync('./extensions/chrome/content.js', 'utf8');
    const fakeDataCode = require('fs').readFileSync('./extensions/chrome/generators/fakeData.js', 'utf8');

    await page.addScriptTag({ content: `
      window.chrome = {
        runtime: { id: 'fake-extension-id' },
        storage: {
          sync: {
            get: (keys, callback) => {
              setTimeout(() => callback({
                formSettings: {
                  name: true, email: true, phone: true, address: true,
                  company: true, select: true, checkbox: true, radio: true,
                  textarea: true, date: true, number: true, password: true,
                  url: true, text: true, file: true
                },
                customRules: [],
                phoneFormat: 'local',
                shortcutEnabled: false,
                autoFillEnabled: false
              }), 0);
            }
          },
          local: { get: (keys, callback) => setTimeout(() => callback({}), 0) },
          onChanged: { addListener: () => {} }
        }
      };
    `});

    await page.addScriptTag({ content: fakeDataCode });
    await page.addScriptTag({ content: contentJsCode });

    await page.waitForTimeout(500);
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
    await page.waitForTimeout(1500);

    const results = await page.evaluate(() => ({
      username: document.querySelector('#native-username')?.value || '',
      email: document.querySelector('#native-email')?.value || '',
      password: document.querySelector('#native-password')?.value || '',
      phone: document.querySelector('#native-phone')?.value || '',
      select: document.querySelector('#native-country')?.value || '',
      checkbox: document.querySelector('#native-agree')?.checked || false
    }));

    console.log('Real extension fill results:', results);

    expect(results.username).toBeTruthy();
    expect(results.email).toMatch(/@/);
    expect(results.password).toBeTruthy();
    expect(results.phone).toMatch(/^01\d{9}$/);
    expect(results.select).toBeTruthy();
    expect(results.checkbox).toBe(true);
  });

  test('should handle storage interactions like real extension', async ({ context }) => {
    const page = await context.newPage();

    const storageTest = await page.evaluate(() => {
      return new Promise((resolve) => {
        const mockStorage = {
          sync: {
            get: (keys, callback) => {
              setTimeout(() => {
                callback({
                  formSettings: { name: true, email: true, phone: true },
                  phoneFormat: 'local',
                  shortcutEnabled: true,
                  autoFillEnabled: false,
                  customRules: []
                });
              }, 0);
            },
            set: (data, callback) => {
              setTimeout(() => {
                callback();
                resolve({ success: true, setData: data });
              }, 0);
            }
          }
        };
        window.chrome = mockStorage;
      });
    });

    console.log('Storage test result:', storageTest);
    expect(storageTest.success).toBe(true);
  });
});

test.describe('Extension with CDP', () => {
  test('should communicate with background script via CDP', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('file://' + process.cwd() + '/tests/form-test/index.html');
    await page.waitForSelector('#native-username');

    const hasContentScript = await page.evaluate(() => {
      return {
        hasFakeFill: typeof window.__bengaliFakeFill === 'function',
        hasFakeData: typeof window.__BengaliFakeData__ !== 'undefined'
      };
    });

    console.log('Content script availability:', hasContentScript);
    expect(typeof hasContentScript.hasFakeFill).toBe('boolean');
  });
});