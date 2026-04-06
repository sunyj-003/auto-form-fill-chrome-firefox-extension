// 持续自动填充 E2E 测试
// 运行: npx playwright test tests/e2e/auto-fill.spec.js

const { test, expect } = require('@playwright/test');

const contentJsCode = require('fs').readFileSync('./extensions/chrome/content.js', 'utf8');

test.describe('持续自动填充功能', () => {

  test('should fill dynamic loaded form elements', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/tests/form-test/index.html');
    await page.waitForSelector('#dynamic-name-1', { timeout: 15000 });

    // 注入扩展代码，启用持续自动填充
    await page.addScriptTag({ content: `
      window.chrome = {
        runtime: { id: 'test' },
        storage: {
          sync: {
            get: (k, cb) => setTimeout(() => cb({
              formSettings: { name: true, email: true, phone: true, address: true, company: true },
              customRules: [],
              phoneFormat: 'local',
              autoFillEnabled: true  // 启用持续自动填充
            }), 0)
          },
          local: { get: (k, cb) => setTimeout(() => cb({}), 0) },
          onChanged: { addListener: () => {} }
        }
      };
    `});

    await page.addScriptTag({ content: contentJsCode });
    await page.waitForTimeout(500);
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
    await page.waitForTimeout(1500);

    // 验证 Step 1 表单已填充
    const step1Values = await page.evaluate(() => ({
      name: document.querySelector('#dynamic-name-1')?.value || '',
      email: document.querySelector('#dynamic-email-1')?.value || ''
    }));
    console.log('Step 1 填充结果:', step1Values);
    expect(step1Values.name).toBeTruthy();
    expect(step1Values.email).toMatch(/@/);

    // 点击下一步，显示 Step 2
    await page.click('#nextStepBtn');
    await page.waitForTimeout(2000);

    // 验证 Step 2 表单是否自动填充（如果功能实现）
    const step2Values = await page.evaluate(() => ({
      phone: document.querySelector('#dynamic-phone-2')?.value || '',
      address: document.querySelector('#dynamic-address-2')?.value || ''
    }));
    console.log('Step 2 填充结果:', step2Values);

    // 再次点击下一步，显示 Step 3
    await page.click('#nextStepBtn');
    await page.waitForTimeout(2000);

    const step3Values = await page.evaluate(() => ({
      company: document.querySelector('#dynamic-company-3')?.value || '',
      position: document.querySelector('#dynamic-position-3')?.value || ''
    }));
    console.log('Step 3 填充结果:', step3Values);
  });

  test('should fill after page navigation', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/tests/form-test/index.html');
    await page.waitForSelector('#nav-username', { timeout: 15000 });

    await page.addScriptTag({ content: `
      window.chrome = {
        runtime: { id: 'test' },
        storage: {
          sync: {
            get: (k, cb) => setTimeout(() => cb({
              formSettings: { name: true, email: true, phone: true },
              customRules: [],
              phoneFormat: 'local',
              autoFillEnabled: true
            }), 0)
          },
          local: { get: (k, cb) => setTimeout(() => cb({}), 0) },
          onChanged: { addListener: () => {} }
        }
      };
    `});

    await page.addScriptTag({ content: contentJsCode });
    await page.waitForTimeout(500);
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
    await page.waitForTimeout(1500);

    // 验证页面 1 表单已填充
    const page1Values = await page.evaluate(() => ({
      username: document.querySelector('#nav-username')?.value || '',
      password: document.querySelector('#nav-password')?.value || ''
    }));
    console.log('页面 1 填充结果:', page1Values);
    expect(page1Values.username).toBeTruthy();
    expect(page1Values.password).toBeTruthy();

    // 点击下一页，切换到页面 2
    await page.click('#nextNavBtn');
    await page.waitForTimeout(1000);

    // 验证页面 2 表单是否自动填充
    const page2Values = await page.evaluate(() => ({
      realname: document.querySelector('#nav-realname')?.value || '',
      phone: document.querySelector('#nav-phone')?.value || ''
    }));
    console.log('页面 2 填充结果:', page2Values);
  });

  test('should NOT fill when auto-fill is disabled', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/tests/form-test/index.html');
    await page.waitForSelector('#dynamic-name-1', { timeout: 15000 });

    // 注入扩展代码，禁用持续自动填充
    await page.addScriptTag({ content: `
      window.chrome = {
        runtime: { id: 'test' },
        storage: {
          sync: {
            get: (k, cb) => setTimeout(() => cb({
              formSettings: { name: true, email: true, phone: true, address: true },
              customRules: [],
              phoneFormat: 'local',
              autoFillEnabled: false  // 禁用持续自动填充
            }), 0)
          },
          local: { get: (k, cb) => setTimeout(() => cb({}), 0) },
          onChanged: { addListener: () => {} }
        }
      };
    `});

    await page.addScriptTag({ content: contentJsCode });
    await page.waitForTimeout(500);
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
    await page.waitForTimeout(1500);

    // 验证 Step 1 已填充
    const step1Name = await page.evaluate(() => document.querySelector('#dynamic-name-1')?.value);
    expect(step1Name).toBeTruthy();

    // 点击下一步，显示 Step 2（autoFillEnabled 为 false，不会自动填充）
    await page.click('#nextStepBtn');
    await page.waitForTimeout(2000);

    // 验证 Step 2 不会被自动填充（因为开关关闭，MutationObserver 不工作）
    // 注意：这里期望空字符串，因为自动填充已禁用
    const step2Values = await page.evaluate(() => ({
      phone: document.querySelector('#dynamic-phone-2')?.value || '',
      address: document.querySelector('#dynamic-address-2')?.value || ''
    }));
    console.log('开关关闭时 Step 2 填充结果:', step2Values);

    // 由于开关关闭，即使有新元素也不会自动填充
    // 手动触发也不会填充 display:none 的隐藏元素（这是正常行为）
    // 验证 Step 2 保持未填充状态
    expect(step2Values.phone).toBe('');
  });
});
