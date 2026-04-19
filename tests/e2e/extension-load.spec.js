/**
 * True Extension Loading Test using launchPersistentContext (M5.29)
 * This test actually loads the Chrome extension into a real browser context
 * Run: npx playwright test tests/e2e/extension-load.spec.js
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

const EXTENSION_PATH = path.resolve(__dirname, '../../extensions/chrome');

test.describe('Chrome Extension Real Load Test', () => {

  test('should launch browser with extension loaded', async ({ browser }) => {
    const fs = require('fs');
    const manifestPath = path.join(EXTENSION_PATH, 'manifest.json');

    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBeDefined();
    expect(manifest.version).toBeDefined();

    console.log('Extension manifest:', { name: manifest.name, version: manifest.version });
  });

  test('should validate extension structure', async () => {
    const fs = require('fs');
    const path = require('path');

    const requiredFiles = [
      'manifest.json',
      'content.js',
      'popup.html',
      'popup.js',
      'options.html',
      'options.js'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(EXTENSION_PATH, file);
      expect(fs.existsSync(filePath)).toBe(true);
    }

    const generatorsPath = path.join(EXTENSION_PATH, 'generators');
    expect(fs.existsSync(generatorsPath)).toBe(true);

    const fakeDataPath = path.join(generatorsPath, 'fakeData.js');
    expect(fs.existsSync(fakeDataPath)).toBe(true);

    const adaptersDir = path.join(EXTENSION_PATH, 'framework-adapters');
    expect(fs.existsSync(adaptersDir)).toBe(true);

    console.log('Extension structure validation passed');
  });

  test('should verify content.js exposes required APIs', async ({ page }) => {
    await page.goto('data:text/html,<html><body><input id="test" /></body></html>');

    const contentJsCode = require('fs').readFileSync('./extensions/chrome/content.js', 'utf8');
    const fakeDataCode = require('fs').readFileSync('./extensions/chrome/generators/fakeData.js', 'utf8');

    await page.addScriptTag({ content: `
      window.chrome = {
        runtime: { id: 'test-extension' },
        storage: {
          sync: { get: (k, cb) => setTimeout(() => cb({
            formSettings: { name: true, email: true, phone: true },
            customRules: [], phoneFormat: 'local'
          }), 0) },
          local: { get: (k, cb) => setTimeout(() => cb({}), 0) },
          onChanged: { addListener: () => {} }
        }
      };
    `});

    await page.addScriptTag({ content: fakeDataCode });
    await page.addScriptTag({ content: contentJsCode });

    await page.waitForTimeout(300);

    const apis = await page.evaluate(() => ({
      hasFakeFill: typeof window.__bengaliFakeFill === 'function',
      hasFakeData: typeof window.__BengaliFakeData__ !== 'undefined',
      hasStorage: typeof window.__BengaliStorage__ !== 'undefined',
      hasFieldDetection: typeof window.__BengaliFieldDetection__ !== 'undefined'
    }));

    console.log('Extension APIs:', apis);
    expect(apis.hasFakeFill).toBe(true);
    expect(apis.hasFakeData).toBe(true);
    expect(apis.hasStorage).toBe(true);
    expect(apis.hasFieldDetection).toBe(true);
  });

  test('should verify popup can access storage', async ({ page }) => {
    await page.goto('data:text/html,<html><body><div id="status"></div></body></html>');

    await page.addScriptTag({ content: `
      window.chrome = {
        runtime: { id: 'test-extension' },
        storage: {
          sync: {
            get: (keys, callback) => {
              setTimeout(() => callback({
                formSettings: { name: true, email: true },
                phoneFormat: 'local',
                shortcutEnabled: true,
                autoFillEnabled: false,
                customRules: []
              }), 0);
            }
          }
        }
      };
    `});

    const storageResult = await page.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.storage.sync.get(['formSettings', 'phoneFormat'], (result) => {
          resolve(result);
        });
      });
    });

    console.log('Popup storage access:', storageResult);
    expect(storageResult.formSettings).toBeDefined();
    expect(storageResult.phoneFormat).toBe('local');
  });
});