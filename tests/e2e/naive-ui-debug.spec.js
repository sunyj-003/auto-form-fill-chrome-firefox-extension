// Naive UI 表单填充 E2E 测试 - 简化版用于调试
// 运行: npx playwright test tests/e2e/naive-ui-debug.spec.js --project=chromium --headed

const { test, expect } = require('@playwright/test');

const contentJsCode = require('fs').readFileSync('./extensions/chrome/content.js', 'utf8');

test.describe('Naive UI 表单填充调试', () => {

  test('should debug Naive UI form rendering', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/tests/form-test/naive-ui.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // 获取页面 DOM 结构
    const domInfo = await page.evaluate(() => {
      return {
        vueLoaded: typeof window.Vue !== 'undefined',
        naiveLoaded: typeof window.naive !== 'undefined',
        nInputCount: document.querySelectorAll('.n-input').length,
        nativeInputCount: document.querySelectorAll('input').length,
        appNormal: !!document.querySelector('#app-normal'),
        bodyInner: document.body.innerHTML.substring(0, 500)
      };
    });
    console.log('DOM 信息:', domInfo);

    // 注入 chrome API mock
    await page.addScriptTag({ content: `
      window.chrome = {
        runtime: { id: 'test-extension' },
        storage: {
          sync: {
            get: (keys, cb) => setTimeout(() => cb({
              formSettings: { name: true, email: true, phone: true },
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

    // 检查 __bengaliFakeFill 是否加载
    const extLoaded = await page.evaluate(() => typeof window.__bengaliFakeFill === 'function');
    console.log('扩展加载:', extLoaded);

    // 获取第一个 n-input 的详细信息
    const inputInfo = await page.evaluate(() => {
      const el = document.querySelector('.n-input');
      if (!el) return 'No .n-input found';

      return {
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        innerHTML: el.innerHTML.substring(0, 200),
        childCount: el.children.length,
        firstChild: el.firstElementChild?.tagName,
        firstChildClass: el.firstElementChild?.className
      };
    });
    console.log('n-input 详情:', inputInfo);

    // 调用填充函数并等待
    await page.evaluate(() => {
      console.log('调用 __bengaliFakeFill');
      window.__bengaliFakeFill && window.__bengaliFakeFill();
    });
    await page.waitForTimeout(2000);

    // 获取填充后的值 - 现在是原生 input，value 属性就是值
    const fillResult = await page.evaluate(() => {
      const inputs = document.querySelectorAll('.n-input, .n-select, textarea');
      const results = [];
      inputs.forEach((el, i) => {
        results.push({
          index: i,
          id: el.id,
          value: el.value,
          tag: el.tagName
        });
      });
      return results;
    });
    console.log('填充结果:', fillResult);
  });
});
