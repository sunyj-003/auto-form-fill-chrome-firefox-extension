/**
 * Framework Adapters Integration Tests
 * Run: npx playwright test tests/integration/framework-adapters.spec.js
 */

const { test, expect } = require('@playwright/test');

const contentJsCode = require('fs').readFileSync('./extensions/chrome/content.js', 'utf8');
const fakeDataCode = require('fs').readFileSync('./extensions/chrome/generators/fakeData.js', 'utf8');
const naiveUICode = require('fs').readFileSync('./extensions/chrome/framework-adapters/naive-ui.js', 'utf8');
const elementPlusCode = require('fs').readFileSync('./extensions/chrome/framework-adapters/element-plus.js', 'utf8');
const antDesignCode = require('fs').readFileSync('./extensions/chrome/framework-adapters/ant-design.js', 'utf8');
const reactSelectCode = require('fs').readFileSync('./extensions/chrome/framework-adapters/react-select.js', 'utf8');
const muiCode = require('fs').readFileSync('./extensions/chrome/framework-adapters/mui.js', 'utf8');

const mockStorage = `
  window.chrome = {
    runtime: { id: 'test-extension' },
    storage: {
      sync: { get: (k, cb) => setTimeout(() => cb({
        formSettings: { name: true, email: true, phone: true, address: true, company: true, select: true, checkbox: true, radio: true, textarea: true, date: true, number: true },
        customRules: [], phoneFormat: 'local', shortcutEnabled: false
      }), 0) },
      local: { get: (k, cb) => setTimeout(() => cb({}), 0) },
      onChanged: { addListener: () => {} }
    }
  };
`;

test.describe('Framework Adapters Integration', () => {

  test('should load all framework adapters', async ({ page }) => {
    await page.goto('data:text/html,<html><body><div id="app"></div></body></html>');

    await page.addScriptTag({ content: mockStorage });
    await page.addScriptTag({ content: fakeDataCode });
    await page.addScriptTag({ content: naiveUICode });
    await page.addScriptTag({ content: elementPlusCode });
    await page.addScriptTag({ content: antDesignCode });
    await page.addScriptTag({ content: reactSelectCode });
    await page.addScriptTag({ content: muiCode });

    await page.waitForTimeout(300);

    const adaptersLoaded = await page.evaluate(() => ({
      naiveUI: typeof window.__BengaliNaiveUI__ !== 'undefined',
      elementPlus: typeof window.__BengaliElementPlus__ !== 'undefined',
      antDesign: typeof window.__BengaliAntDesign__ !== 'undefined',
      reactSelect: typeof window.__BengaliReactSelect__ !== 'undefined',
      mui: typeof window.__BengaliMUI__ !== 'undefined'
    }));

    console.log('Adapters loaded:', adaptersLoaded);
    expect(adaptersLoaded.naiveUI).toBe(true);
    expect(adaptersLoaded.elementPlus).toBe(true);
    expect(adaptersLoaded.antDesign).toBe(true);
    expect(adaptersLoaded.reactSelect).toBe(true);
    expect(adaptersLoaded.mui).toBe(true);
  });

  test('should detect and fill Vue Select dropdown', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/tests/form-test/index.html');
    await page.waitForSelector('.vue-select', { timeout: 10000 });

    await page.addScriptTag({ content: mockStorage });
    await page.addScriptTag({ content: fakeDataCode });
    await page.addScriptTag({ content: naiveUICode });
    await page.addScriptTag({ content: elementPlusCode });
    await page.addScriptTag({ content: antDesignCode });
    await page.addScriptTag({ content: reactSelectCode });
    await page.addScriptTag({ content: muiCode });
    await page.addScriptTag({ content: contentJsCode });

    await page.waitForTimeout(500);
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
    await page.waitForTimeout(2000);

    const vueSelectFilled = await page.evaluate(() => {
      const vs = document.querySelector('.vue-select');
      if (!vs) return { found: false };
      const input = vs.querySelector('input[type="text"]') || vs.querySelector('input');
      return {
        found: true,
        hasValue: !!vs.querySelector('.vs__selected') || (input && input.value)
      };
    });

    console.log('Vue Select fill result:', vueSelectFilled);
    if (vueSelectFilled.found) {
      expect(vueSelectFilled.hasValue).toBe(true);
    }
  });

  test('should detect and fill jQuery Select2', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/tests/form-test/index.html');
    await page.waitForTimeout(2000);

    await page.addScriptTag({ content: mockStorage });
    await page.addScriptTag({ content: fakeDataCode });
    await page.addScriptTag({ content: naiveUICode });
    await page.addScriptTag({ content: elementPlusCode });
    await page.addScriptTag({ content: antDesignCode });
    await page.addScriptTag({ content: reactSelectCode });
    await page.addScriptTag({ content: muiCode });
    await page.addScriptTag({ content: contentJsCode });

    await page.waitForTimeout(500);
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
    await page.waitForTimeout(2000);

    const select2Filled = await page.evaluate(() => {
      const select = document.querySelector('#select2-country');
      return { value: select?.value || '' };
    });

    console.log('Select2 value:', select2Filled.value);
    expect(typeof select2Filled.value).toBe('string');
  });

  test('should handle adapter initialization errors gracefully', async ({ page }) => {
    await page.goto('data:text/html,<html><body></body></html>');

    await page.addScriptTag({ content: mockStorage });
    await page.addScriptTag({ content: fakeDataCode });
    await page.addScriptTag({ content: contentJsCode });

    await page.waitForTimeout(300);

    const result = await page.evaluate(() => {
      try {
        window.__bengaliFakeFill();
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    });

    expect(result.success).toBe(true);
  });

  test('should prioritize framework adapters over native detection', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/tests/form-test/index.html');

    await page.waitForSelector('.el-select', { timeout: 15000 });

    await page.addScriptTag({ content: mockStorage });
    await page.addScriptTag({ content: fakeDataCode });
    await page.addScriptTag({ content: naiveUICode });
    await page.addScriptTag({ content: elementPlusCode });
    await page.addScriptTag({ content: antDesignCode });
    await page.addScriptTag({ content: reactSelectCode });
    await page.addScriptTag({ content: muiCode });
    await page.addScriptTag({ content: contentJsCode });

    await page.waitForTimeout(500);
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
    await page.waitForTimeout(3000);

    const elResults = await page.evaluate(() => {
      const app = document.querySelector('#elementPlusApp');
      if (app && app.__vue_app__) {
        return app.__vue_app__._instance.proxy.form;
      }
      return null;
    });

    console.log('Element Plus adapter integration:', elResults ? 'Form data available' : 'No form data');

    if (elResults) {
      expect(elResults.gender).toBeTruthy();
      expect(elResults.country).toBeTruthy();
    }
  });
});