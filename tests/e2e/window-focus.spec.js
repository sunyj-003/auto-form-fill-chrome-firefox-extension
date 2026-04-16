// 窗口区分功能测试
// 运行: npx playwright test tests/e2e/window-focus.spec.js --project=chromium --headed

const { test, expect } = require('@playwright/test');

const contentJsCode = require('fs').readFileSync('./extensions/chrome/content.js', 'utf8');

test.describe('窗口区分功能', () => {

  test('should fill when window is focused', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/tests/form-test/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#native-username', { timeout: 10000 });

    // 注入 chrome API mock
    await page.addScriptTag({ content: `
      window.chrome = {
        runtime: { id: 'test-extension' },
        storage: {
          sync: {
            get: (keys, cb) => setTimeout(() => cb({
              formSettings: { name: true, email: true },
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

    await page.addScriptTag({ content: contentJsCode });
    await page.waitForTimeout(500);

    // 验证窗口聚焦状态
    const focusState = await page.evaluate(() => ({
      hidden: document.hidden,
      hasFocus: document.hasFocus()
    }));
    console.log('窗口聚焦状态:', focusState);
    expect(focusState.hasFocus).toBe(true);

    // 调用填充
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
    await page.waitForTimeout(1500);

    // 获取填充结果
    const username = await page.evaluate(() => document.querySelector('#native-username')?.value);
    console.log('填充后 username:', username);

    expect(username).toBeTruthy();
  });

  test('should skip fill when window is not focused', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/tests/form-test/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#native-username', { timeout: 10000 });

    // 注入 chrome API mock
    await page.addScriptTag({ content: `
      window.chrome = {
        runtime: { id: 'test-extension' },
        storage: {
          sync: {
            get: (keys, cb) => setTimeout(() => cb({
              formSettings: { name: true, email: true },
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

    await page.addScriptTag({ content: contentJsCode });
    await page.waitForTimeout(500);

    // 初始值
    const initialValue = await page.evaluate(() => document.querySelector('#native-username')?.value || '');
    console.log('填充前 username:', initialValue);

    // 模拟窗口未聚焦 - 覆盖 hasFocus 方法
    await page.evaluate(() => {
      // 保存原始方法
      window._originalHasFocus = document.hasFocus;
      // 覆盖为返回 false
      document.hasFocus = () => false;
    });

    // 调用填充
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
    await page.waitForTimeout(500);

    // 获取填充后的值
    const afterValue = await page.evaluate(() => document.querySelector('#native-username')?.value || '');
    console.log('未聚焦时填充后 username:', afterValue);

    // 恢复 hasFocus
    await page.evaluate(() => {
      if (window._originalHasFocus) {
        document.hasFocus = window._originalHasFocus;
      }
    });

    // 窗口未聚焦时应该跳过填充，值应该为空
    expect(afterValue).toBe(initialValue);
  });

  test('should detect hidden document', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/tests/form-test/index.html');
    await page.waitForLoadState('networkidle');

    await page.addScriptTag({ content: contentJsCode });
    await page.waitForTimeout(500);

    // 测试 document.hidden
    const visibilityInfo = await page.evaluate(() => ({
      hidden: document.hidden,
      visibilityState: document.visibilityState,
      hasFocus: document.hasFocus()
    }));
    console.log('可见性信息:', visibilityInfo);

    expect(visibilityInfo.hidden).toBe(false);
    expect(visibilityInfo.visibilityState).toBe('visible');
  });
});
