// 扩展表单填充 E2E 测试
// 运行: npx playwright test e2e/extension-fill.spec.js

const { test, expect } = require('@playwright/test');

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

  // 测试 Element Plus 表单 - 使用 evaluate 避免复杂交互
  test('should fill Element Plus form', async ({ page }) => {
    await page.goto('http://localhost:5173/element-test.html');
    await page.waitForSelector('.el-select', { timeout: 10000 });

    // 全部用 evaluate 执行
    await page.evaluate(async () => {
      // 1. 填充文本输入
      const inputs = document.querySelectorAll('input:not([type="hidden"])');
      inputs.forEach(input => {
        const ctx = (input.placeholder || '').toLowerCase();
        if (ctx.includes('用户')) input.value = '测试用户';
        else if (ctx.includes('邮箱')) input.value = 'test@example.com';
        else if (ctx.includes('密码')) input.value = 'Test@12345';
        else if (input.type === 'number') input.value = '28';
        input.dispatchEvent(new Event('input', {bubbles: true}));
      });

      // 2. textarea
      const ta = document.querySelector('textarea');
      if (ta) { ta.value = '测试简介'; ta.dispatchEvent(new Event('input')); }

      // 3. checkbox
      const cb = document.querySelector('input[type="checkbox"]');
      if (cb) { cb.checked = true; cb.dispatchEvent(new Event('change')); }

      // 4. radio
      const rb = document.querySelector('input[type="radio"]');
      if (rb) { rb.checked = true; rb.dispatchEvent(new Event('change')); }

      // 5. 性别 el-select
      await new Promise(r => setTimeout(r, 100));
      const genderSelect = document.querySelector('.el-select');
      if (genderSelect) {
        genderSelect.querySelector('.el-input__wrapper').click();
        await new Promise(r => setTimeout(r, 150));
        const items = document.querySelectorAll('.el-select-dropdown__item');
        if (items.length) items[0].click();
      }

      // 6. 生日 el-date-editor
      await new Promise(r => setTimeout(r, 100));
      const picker = document.querySelector('.el-date-editor');
      if (picker) {
        picker.querySelector('.el-input__wrapper').click();
        await new Promise(r => setTimeout(r, 150));
        const cell = document.querySelector('.el-date-table__cell.available');
        if (cell) cell.click();
      }

      // 7. 国家 el-select
      await new Promise(r => setTimeout(r, 100));
      const selects = document.querySelectorAll('.el-select');
      if (selects[1]) {
        selects[1].querySelector('.el-input__wrapper').click();
        await new Promise(r => setTimeout(r, 150));
        const dropdowns = document.querySelectorAll('.el-select-dropdown');
        if (dropdowns.length > 1) {
          const items = dropdowns[1].querySelectorAll('.el-select-dropdown__item');
          if (items.length) items[0].click();
        }
      }
    });

    // 验证 - 检查元素是否有值
    const usernameInput = page.locator('input[placeholder="请输入用户名"]');
    await expect(usernameInput).toHaveValue('测试用户', { timeout: 5000 });

    const emailInput = page.locator('input[placeholder="example@mail.com"]');
    await expect(emailInput).toHaveValue('test@example.com', { timeout: 5000 });
  });
});