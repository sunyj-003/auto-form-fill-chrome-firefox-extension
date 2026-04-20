/**
 * Additional extension regression coverage.
 * Keeps assertions honest by only running with the extension-enabled project.
 */

const { test, expect } = require('./fixtures/extension-test');
const { triggerShortcutFill } = require('./helpers/real-extension');

test.describe('Real Chrome Extension Loading', () => {
  test('should keep the page world separate from the real extension runtime', async ({ page }) => {
    await page.goto('/native-extension.html');

    const pageWorldState = await page.evaluate(() => ({
      hasFillHook: typeof window.__bengaliFakeFill,
      hasStorageBridge: typeof window.__BengaliStorage__,
    }));

    expect(pageWorldState).toEqual({
      hasFillHook: 'undefined',
      hasStorageBridge: 'undefined',
    });
  });

  test('should still fill core text inputs after a page reload', async ({ page }) => {
    await page.goto('/native-extension.html');
    await page.reload();
    await triggerShortcutFill(page);

    await expect.poll(async () => {
      return page.evaluate(() => ({
        username: document.querySelector('#native-username')?.value || '',
        email: document.querySelector('#native-email')?.value || '',
        phone: document.querySelector('#native-phone')?.value || '',
      }));
    }).toMatchObject({
      username: expect.any(String),
      email: expect.stringMatching(/@/),
      phone: expect.stringMatching(/^01\d{10}$/),
    });

    const values = await page.evaluate(() => ({
      username: document.querySelector('#native-username')?.value || '',
      email: document.querySelector('#native-email')?.value || '',
      phone: document.querySelector('#native-phone')?.value || '',
    }));

    expect(values.username).toBeTruthy();
    expect(values.email).toContain('@');
  });
});
