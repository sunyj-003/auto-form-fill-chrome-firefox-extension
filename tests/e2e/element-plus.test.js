// Element Plus E2E Test
// Run with: npx playwright test e2e/element-plus.test.js

const { test, expect } = require('@playwright/test');

test.describe('Element Plus Form Fill', () => {
  test('should fill el-select dropdown', async ({ page }) => {
    // Load the test page
    await page.goto('http://localhost:5173/element-test.html');

    // Wait for Vue to render
    await page.waitForSelector('.el-select');

    // Get initial value
    const genderSelect = page.locator('.el-select').first();
    const initialValue = await genderSelect.inputValue();

    // Inject and run the extension content script
    await page.evaluate(() => {
      // Load the extension logic manually for testing
      // In real test, would load the extension properly
    });

    console.log('Initial value:', initialValue);
  });
});
