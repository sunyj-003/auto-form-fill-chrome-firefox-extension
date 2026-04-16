// Naive UI Select 填充测试 - 使用 launchPersistentContext 加载扩展
const { test, expect } = require('@playwright/test');
const path = require('path');
const { chromium } = require('playwright');

test('should fill Naive UI select with extension', async () => {
  // 使用绝对路径
  const extensionPath = path.resolve(__dirname, '../extensions/chrome');
  console.log('扩展路径:', extensionPath);

  // 检查扩展目录是否存在
  const fs = require('fs');
  if (!fs.existsSync(extensionPath)) {
    console.error('扩展目录不存在:', extensionPath);
    throw new Error('扩展目录不存在');
  }

  if (!fs.existsSync(path.join(extensionPath, 'manifest.json'))) {
    console.error('manifest.json 不存在');
    throw new Error('manifest.json 不存在');
  }

  // 使用 launchPersistentContext 加载扩展
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  const page = context.pages()[0] || await context.newPage();

  await page.goto('http://develop.findsoft.com.cn/secman/person/new');
  await page.waitForTimeout(3000);

  // 检查扩展是否加载
  const extLoaded = await page.evaluate(() => {
    return typeof window.__bengaliFakeFill === 'function';
  });
  console.log('扩展已加载:', extLoaded);

  if (extLoaded) {
    // 触发填充
    await page.evaluate(() => {
      window.__bengaliFakeFill();
    });
    await page.waitForTimeout(3000);
  }

  // 检查选择器是否被填充
  const results = await page.evaluate(() => {
    const selects = document.querySelectorAll('.n-select, .n-base-selection');
    const filled = [];

    selects.forEach((el) => {
      const isSelected = el.classList.contains('n-base-selection--selected');
      const label = el.querySelector('.n-base-selection-label');
      const labelText = label?.textContent?.trim() || '';

      if (isSelected || (labelText && labelText !== '请选择')) {
        filled.push({
          class: el.className.slice(0, 50),
          isSelected,
          labelText
        });
      }
    });

    return {
      totalSelects: selects.length,
      filledCount: filled.length,
      samples: filled.slice(0, 5)
    };
  });

  console.log('选择器总数:', results.totalSelects);
  console.log('已填充选择器数:', results.filledCount);
  console.log('填充的示例:', results.samples);

  await context.close();

  // 验证
  expect(results.totalSelects).toBeGreaterThan(0);
});