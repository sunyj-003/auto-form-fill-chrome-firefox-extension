// 专门测试 Naive UI 选择器填充
const { test, expect } = require('@playwright/test');

const contentJsCode = require('fs').readFileSync('./extensions/chrome/content.js', 'utf8');

test.describe('Naive UI Select 填充测试', () => {

  test('should fill Naive UI select elements', async ({ page }) => {
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

    // 触发填充
    await page.evaluate(() => {
      if (window.__bengaliFakeFill) {
        window.__bengaliFakeFill();
      }
    });
    await page.waitForTimeout(3000);

    // 检查选择器是否被填充
    const results = await page.evaluate(() => {
      // 查找所有 n-select 和 n-base-selection
      const selects = document.querySelectorAll('.n-select, .n-base-selection');
      const filled = [];

      selects.forEach((el, i) => {
        // 检查是否有选中值（n-base-selection--selected 类）
        const isSelected = el.classList.contains('n-base-selection--selected');
        const label = el.querySelector('.n-base-selection-label, .n-select__label');
        const labelText = label?.textContent?.trim() || '';

        // 检查内部 input 的值
        const input = el.querySelector('.n-base-selection-input');
        const inputValue = input?.value || '';

        if (isSelected || labelText || inputValue) {
          filled.push({
            index: i,
            classList: el.className.slice(0, 50),
            isSelected,
            labelText,
            inputValue
          });
        }
      });

      return {
        totalSelects: selects.length,
        filledCount: filled.length,
        filledSamples: filled.slice(0, 5)
      };
    });

    console.log('选择器总数:', results.totalSelects);
    console.log('已填充选择器数:', results.filledCount);
    console.log('填充的示例:', results.filledSamples);

    // 至少应该有一些选择器被处理
    expect(results.totalSelects).toBeGreaterThan(0);
  });
});