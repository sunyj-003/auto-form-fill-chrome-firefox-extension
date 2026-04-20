const { test, expect } = require('./fixtures/extension-test');
const { triggerShortcutFill } = require('./helpers/real-extension');

test.describe('Naive UI Select Real Extension', () => {
  test('should fill core text inputs on the local Naive UI page', async ({ page }) => {
    await page.goto('/naive-ui.html');
    await page.waitForTimeout(300);
    await triggerShortcutFill(page);

    await expect.poll(async () => {
      return page.evaluate(() => ({
        username: document.querySelector('#naive-username')?.value || '',
        email: document.querySelector('#naive-email')?.value || '',
        phone: document.querySelector('#naive-phone')?.value || '',
        country: document.querySelector('#naive-country')?.value || '',
      }));
    }).toMatchObject({
      username: expect.any(String),
    });

    const results = await page.evaluate(() => ({
      username: document.querySelector('#naive-username')?.value || '',
      email: document.querySelector('#naive-email')?.value || '',
      phone: document.querySelector('#naive-phone')?.value || '',
      country: document.querySelector('#naive-country')?.value || '',
    }));

    expect(results.username).toBeTruthy();
    expect(results.email).toContain('@');
  });
});
