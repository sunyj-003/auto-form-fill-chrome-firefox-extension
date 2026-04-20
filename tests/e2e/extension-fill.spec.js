// 本地表单页面烟雾测试
// 运行: npx playwright test tests/e2e/extension-fill.spec.js

const { test, expect } = require('@playwright/test');

test.describe('Local Form Smoke Tests', () => {

  test('should allow native form interactions on the lightweight test page', async ({ page }) => {
    await page.goto('data:text/html,<html><body><form>' +
      '<input id="name" placeholder="用户名">' +
      '<input id="email" type="email">' +
      '<input id="phone" type="tel">' +
      '<input type="checkbox" id="agree">同意' +
      '<input type="radio" name="gender" value="male">男' +
      '<select id="country"><option value="">国家</option><option value="cn">中国</option></select>' +
      '</form></body></html>');

    await page.fill('#name', '测试用户');
    await page.fill('#email', 'test@example.com');
    await page.fill('#phone', '01345678901');
    await page.check('#agree');
    await page.check('input[value="male"]');
    await page.selectOption('#country', 'cn');

    await expect(page.locator('#name')).toHaveValue('测试用户');
    await expect(page.locator('#email')).toHaveValue('test@example.com');
    await expect(page.locator('#agree')).toBeChecked();
  });

  test('should load the demo form page from the local test server', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.el-select', { timeout: 15000 });

    const elementPlusInput = page.locator('#elementPlusApp .el-input__inner').first();
    await expect(elementPlusInput).toBeVisible({ timeout: 5000 });
  });
});
