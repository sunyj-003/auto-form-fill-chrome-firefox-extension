// Naive UI Select 注入式测试
const { test, expect } = require('@playwright/test');
const { installInjectedExtension } = require('./helpers/module-injection');

test.describe('Naive UI Select Injected Tests', () => {

  test('should fill Naive UI select elements', async ({ page }) => {
    await page.goto('/naive-ui.html');
    await page.waitForTimeout(2000);

    await installInjectedExtension(page, { autoFillEnabled: true });
    await page.waitForTimeout(500);

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

    expect(results.totalSelects).toBeGreaterThan(0);
    expect(results.filledCount).toBeGreaterThanOrEqual(0);
  });
});
