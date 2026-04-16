// 简化版：使用 inject 方式测试
const { test, expect } = require('@playwright/test');

const contentJsCode = require('fs').readFileSync('./extensions/chrome/content.js', 'utf8');

test('Naive UI Select 填充测试', async ({ page }) => {
  await page.goto('http://develop.findsoft.com.cn/secman/person/new');
  await page.waitForTimeout(2000);

  // 注入 chrome API mock
  await page.addScriptTag({ content: `
    window.chrome = {
      runtime: { id: 'test-extension' },
      storage: {
        sync: { get: (k, cb) => setTimeout(() => cb({
          formSettings: { name: true, email: true, phone: true, address: true, company: true, select: true, checkbox: true, radio: true, textarea: true, file: true, date: true, number: true },
          customRules: [], phoneFormat: 'local', shortcutEnabled: false, autoFillEnabled: true
        }), 0) },
        local: { get: (k, cb) => setTimeout(() => cb({}), 0) },
        onChanged: { addListener: () => {} }
      }
    };
  `});

  // 注入 content.js
  await page.addScriptTag({ content: contentJsCode });
  await page.waitForTimeout(500);

  // 打印收集到的元素信息
  const debugInfo = await page.evaluate(() => {
    // 使用属性选择器查找所有包含 n-base-selection 或 n-select 的元素
    const result = {
      nInputs: document.querySelectorAll('.n-input').length,
      // 使用属性选择器
      nSelects: document.querySelectorAll('[class*="n-select"]').length,
      nBaseSelection: document.querySelectorAll('[class*="n-base-selection"]').length,
      vueSelect: document.querySelectorAll('.vue-select, .v-select').length,
      antSelect: document.querySelectorAll('.ant-select').length,
      elSelect: document.querySelectorAll('.el-select').length,
      totalInputs: document.querySelectorAll('input:not([type=hidden])').length,
    };

    return result;
  });
  console.log('元素统计:', debugInfo);

  // 触发填充
  await page.evaluate(() => {
    if (window.__bengaliFakeFill) window.__bengaliFakeFill();
  });
  await page.waitForTimeout(2000);

  // 检查填充结果
  const results = await page.evaluate(() => {
    const nInputs = document.querySelectorAll('.n-input');
    const filledInputs = [];
    nInputs.forEach(el => {
      const input = el.querySelector('input');
      if (input && input.value) {
        filledInputs.push(input.value);
      }
    });

    // 检查选择器
    const selects = document.querySelectorAll('.n-select, .n-base-selection');
    const filledSelects = [];
    selects.forEach(el => {
      if (el.classList.contains('n-base-selection--selected')) {
        const label = el.querySelector('.n-base-selection-label');
        filledSelects.push(label?.textContent?.trim() || '已选中');
      }
    });

    return {
      inputCount: nInputs.length,
      filledInputCount: filledInputs.length,
      filledInputSamples: filledInputs.slice(0, 3),
      selectCount: selects.length,
      filledSelectCount: filledSelects.length,
      filledSelectSamples: filledSelects.slice(0, 3)
    };
  });

  console.log('填充结果:', results);
});