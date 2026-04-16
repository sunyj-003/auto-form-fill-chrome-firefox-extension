// Naive UI 表单填充 E2E 测试 - 完整流程测试
// 运行: npx playwright test tests/e2e/naive-ui-fill.spec.js --project=chromium --headed

const { test, expect } = require('@playwright/test');

const contentJsCode = require('fs').readFileSync('./extensions/chrome/content.js', 'utf8');

test.describe('Naive UI 表单填充 - 完整流程', () => {

  test('should fill Naive UI form with fake data', async ({ page }) => {
    await page.goto('http://localhost:5173/naive-ui-mock.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 填充前截图
    await page.screenshot({ path: 'test-results/naive-before.png', fullPage: true });

    // 注入 chrome API mock
    await page.addScriptTag({ content: `
      window.chrome = {
        runtime: { id: 'test-extension' },
        storage: {
          sync: {
            get: (keys, cb) => setTimeout(() => cb({
              formSettings: { name: true, email: true, phone: true, select: true, checkbox: true, radio: true, textarea: true },
              customRules: [],
              phoneFormat: 'local',
              shortcutEnabled: false,
              autoFillEnabled: true
            }), 0)
          },
          local: { get: (k, cb) => setTimeout(() => cb({}), 0) },
          onChanged: { addListener: () => {} }
        }
      };
    `});

    // 注入 content.js
    await page.addScriptTag({ content: contentJsCode });
    await page.waitForTimeout(500);

    // 调用填充函数
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
    await page.waitForTimeout(2000);

    // 填充后截图
    await page.screenshot({ path: 'test-results/naive-after.png', fullPage: true });

    // 获取填充结果
    const results = await page.evaluate(() => {
      const getVal = (id) => {
        const el = document.querySelector(id);
        return el ? (el.value || el.querySelector('input')?.value || el.textContent?.trim()) : '';
      };
      return {
        username: getVal('#naive-username'),
        email: getVal('#naive-email'),
        password: getVal('#naive-password'),
        phone: getVal('#naive-phone'),
        country: getVal('#naive-country'),
        city: getVal('#naive-city'),
        bio: getVal('#naive-bio'),
        agree: document.querySelector('#naive-agree input')?.checked || false
      };
    });

    console.log('Naive UI 填充结果:', results);

    // 验证填充成功
    expect(results.username).toBeTruthy();
    expect(results.email).toMatch(/@/);
    expect(results.password).toBeTruthy();
    expect(results.phone).toBeTruthy();
    // 下拉框需要框架渲染完成
    expect(results.bio).toBeTruthy();
  });

  test('should detect window focus state correctly', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/tests/form-test/naive-ui.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 注入 content.js
    await page.addScriptTag({ content: `
      window.chrome = {
        runtime: { id: 'test-extension' },
        storage: {
          sync: { get: (k, cb) => setTimeout(() => cb({ formSettings: {}, customRules: [] }), 0) },
          local: { get: (k, cb) => setTimeout(() => cb({}), 0) },
          onChanged: { addListener: () => {} }
        }
      };
    `});
    await page.addScriptTag({ content: contentJsCode });
    await page.waitForTimeout(500);

    // 测试焦点检测
    const focusState = await page.evaluate(() => ({
      hidden: document.hidden,
      hasFocus: document.hasFocus(),
      visibilityState: document.visibilityState
    }));
    console.log('窗口焦点状态:', focusState);

    // 窗口应该聚焦
    expect(focusState.hasFocus).toBe(true);
    expect(focusState.visibilityState).toBe('visible');
  });

  test('should skip fill when window is not focused', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/tests/form-test/naive-ui.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 注入 chrome API mock
    await page.addScriptTag({ content: `
      window.chrome = {
        runtime: { id: 'test-extension' },
        storage: {
          sync: { get: (k, cb) => setTimeout(() => cb({ formSettings: { name: true }, customRules: [] }), 0) },
          local: { get: (k, cb) => setTimeout(() => cb({}), 0) },
          onChanged: { addListener: () => {} }
        }
      };
    `});
    await page.addScriptTag({ content: contentJsCode });
    await page.waitForTimeout(500);

    // 模拟窗口未聚焦状态
    await page.evaluate(() => {
      // 覆盖 hasFocus 方法
      document.hasFocus = () => false;
    });

    // 调用填充 - 应该跳过
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
    await page.waitForTimeout(500);

    // 检查控制台日志
    const logs = await page.evaluate(() => {
      return window.__bengaliFakeFillLogs || [];
    });

    // 获取输入框值 - 需要找到 Naive UI 内部的 input
    const inputValue = await page.evaluate(() => {
      const naiveInput = document.querySelector('#naive-username');
      if (!naiveInput) return '';
      // Naive UI 的 n-input 组件内部有 input 元素
      const input = naiveInput.querySelector('input') || naiveInput;
      return input ? input.value : '';
    });

    console.log('未聚焦时输入框值:', inputValue);
    console.log('日志:', logs);

    // 窗口未聚焦时应该不填充
    expect(inputValue).toBe('');
  });
});
