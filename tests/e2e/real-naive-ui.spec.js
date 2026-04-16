// 真实 Naive UI 网站测试 - 详细分析
// 运行: npx playwright test tests/e2e/real-naive-ui.spec.js --project=chromium --headed

const { test, expect } = require('@playwright/test');

const contentJsCode = require('fs').readFileSync('./extensions/chrome/content.js', 'utf8');

test.describe('真实 Naive UI 网站测试', () => {

  test('should analyze form fields on findsoft.com.cn', async ({ page }) => {
    // 访问登录页
    await page.goto('http://develop.findsoft.com.cn/secman/login', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 登录 - 使用更通用的选择器
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].fill('admin');
      await inputs[1].fill('admin123');
      await page.click('button');
      await page.waitForTimeout(3000);
    }

    // 跳转到目标页面
    await page.goto('http://develop.findsoft.com.cn/secman/person/new', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // 注入 chrome API mock
    await page.addScriptTag({ content: `
      window.chrome = {
        runtime: { id: 'test-extension' },
        storage: {
          sync: {
            get: (keys, cb) => setTimeout(() => cb({
              formSettings: { name: true, email: true, phone: true, address: true, company: true, select: true, checkbox: true, radio: true, textarea: true, date: true, number: true },
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

    // 详细分析页面结构
    const pageAnalysis = await page.evaluate(() => {
      const results = {
        // 各种可能的选择器
        nInput: document.querySelectorAll('.n-input').length,
        nInputTextarea: document.querySelectorAll('.n-input__textarea-el').length,
        nBaseSelection: document.querySelectorAll('.n-base-selection').length,
        nSelect: document.querySelectorAll('.n-select').length,
        nCheckbox: document.querySelectorAll('.n-checkbox').length,
        nCheckboxBox: document.querySelectorAll('.n-checkbox-box').length,
        nRadio: document.querySelectorAll('.n-radio').length,
        nDatePicker: document.querySelectorAll('.n-date-picker').length,

        // 实际表单元素
        allInputs: document.querySelectorAll('input').length,
        allSelects: document.querySelectorAll('select').length,
        allTextareas: document.querySelectorAll('textarea').length,

        // 表单相关的 class
        formClasses: [],

        // 采样输入框
        sampleInputs: []
      };

      // 收集与表单相关的 class
      const allClasses = new Set();
      document.querySelectorAll('*').forEach(el => {
        if (el.className && typeof el.className === 'string') {
          el.className.split(' ').forEach(c => {
            if (c && c.length < 50) allClasses.add(c);
          });
        }
      });

      // 筛选与表单相关的 class
      allClasses.forEach(c => {
        if (/form|input|select|check|radio|date|picker|field|box|naive|base/i.test(c)) {
          results.formClasses.push(c);
        }
      });
      results.formClasses = results.formClasses.slice(0, 30);

      // 采样一些输入框
      Array.from(document.querySelectorAll('input')).slice(0, 10).forEach((el, i) => {
        results.sampleInputs.push({
          index: i,
          type: el.type,
          className: el.className.substring(0, 50),
          id: el.id,
          name: el.name,
          parentClass: el.parentElement?.className?.substring(0, 50)
        });
      });

      return results;
    });
    console.log('页面详细分析 - 表单相关 class:', pageAnalysis.formClasses);
    console.log('输入框采样:', JSON.stringify(pageAnalysis.sampleInputs, null, 2));

    // 填充前截图
    await page.screenshot({ path: 'test-results/findsoft-before.png', fullPage: true });

    // 调用填充
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
    await page.waitForTimeout(2000);

    // 填充后截图
    await page.screenshot({ path: 'test-results/findsoft-after.png', fullPage: true });

    // 获取填充结果
    const fillResults = await page.evaluate(() => {
      const results = [];

      // 获取所有输入字段的值
      document.querySelectorAll('input').forEach(el => {
        if (el.type !== 'hidden' && el.type !== 'submit' && el.type !== 'button') {
          results.push({
            element: 'input',
            type: el.type,
            id: el.id,
            name: el.name,
            className: el.className.substring(0, 40),
            value: el.value,
            parentClass: el.parentElement?.className?.substring(0, 40)
          });
        }
      });

      // 获取所有 textarea
      document.querySelectorAll('textarea').forEach(el => {
        results.push({
          element: 'textarea',
          id: el.id,
          name: el.name,
          className: el.className.substring(0, 40),
          value: el.value
        });
      });

      return results;
    });

    console.log('填充结果:', JSON.stringify(fillResults, null, 2));

    // 统计
    const filled = fillResults.filter(r => r.value && r.value.length > 0).length;
    const total = fillResults.length;
    console.log(`填充统计: ${filled}/${total} 字段有值`);
  });
});
