// Element Plus E2E Test
// Run with: npx playwright test e2e/element-plus.test.js

const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Element Plus Form Fill', () => {
  test('should load Element Plus form', async ({ page }) => {
    // Load the local test page
    await page.goto('file://' + path.join(process.cwd(), 'tests/form-test/index.html'));

    // Wait for Vue to render
    await page.waitForSelector('.el-select', { timeout: 15000 });
    await page.waitForTimeout(1000);

    // 使用更精确的定位方式 - 通过 Element Plus 的特定类
    const elementPlusInput = page.locator('#elementPlusApp .el-input__inner').first();
    await expect(elementPlusInput).toBeVisible({ timeout: 5000 });

    console.log('Element Plus form loaded successfully');
  });
});
