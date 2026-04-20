const { test, expect } = require('@playwright/test');
const { installInjectedExtension } = require('./helpers/module-injection');

test.describe('Naive UI Select Diagnostics', () => {
  test('should inspect select-related DOM and selection state', async ({ page }) => {
    await page.goto('/naive-ui.html');
    await page.waitForTimeout(2000);

    await installInjectedExtension(page, { autoFillEnabled: true });
    await page.waitForTimeout(500);

    const debugInfo = await page.evaluate(() => ({
      nInputs: document.querySelectorAll('.n-input').length,
      nSelects: document.querySelectorAll('[class*="n-select"]').length,
      nBaseSelection: document.querySelectorAll('[class*="n-base-selection"]').length,
      totalInputs: document.querySelectorAll('input:not([type=hidden])').length,
    }));

    await page.evaluate(() => {
      if (window.__bengaliFakeFill) window.__bengaliFakeFill();
    });
    await page.waitForTimeout(2000);

    const results = await page.evaluate(() => {
      const selects = document.querySelectorAll('.n-select, .n-base-selection');
      return {
        selectCount: selects.length,
        filledSelectCount: Array.from(selects).filter((el) => el.classList.contains('n-base-selection--selected')).length,
      };
    });

    expect(debugInfo.nSelects + debugInfo.nBaseSelection).toBeGreaterThan(0);
    expect(results.selectCount).toBeGreaterThan(0);
  });
});
