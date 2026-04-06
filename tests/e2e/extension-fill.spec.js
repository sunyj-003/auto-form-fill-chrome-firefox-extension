// 扩展表单填充 E2E 测试
// 运行: npx playwright test e2e/extension-fill.spec.js

const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Chrome Extension Form Fill', () => {

  // 测试原生 HTML 表单
  test('should fill native HTML form', async ({ page }) => {
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

  // 测试 Element Plus 表单 - 使用本地测试页面
  test('should load Element Plus form', async ({ page }) => {
    await page.goto('file://' + path.join(process.cwd(), 'tests/form-test/index.html'));
    await page.waitForSelector('.el-select', { timeout: 15000 });

    // 等待 Vue 渲染完成
    await page.waitForTimeout(1000);

    // 使用更精确的定位方式 - 通过 Element Plus 的特定类
    const elementPlusInput = page.locator('#elementPlusApp .el-input__inner').first();
    await expect(elementPlusInput).toBeVisible({ timeout: 5000 });

    console.log('Element Plus form loaded successfully');
  });
});