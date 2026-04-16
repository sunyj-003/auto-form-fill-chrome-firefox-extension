// 使用 evaluate 来确保 chrome 在正确的上下文
const { test } = require('@playwright/test');
const fs = require('fs');

test('direct form fill', async ({ page }) => {
  await page.goto('http://develop.findsoft.com.cn/secman/login');
  await page.waitForTimeout(2000);
  await page.locator('input[placeholder="请输入账号"]').fill('admin');
  await page.locator('input[placeholder="请输入密码"]').fill('admin123');
  await page.locator('.login-button').click();
  await page.waitForTimeout(3000);

  await page.goto('http://develop.findsoft.com.cn/secman/person/new');
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'test-results/formpage.png' });

  // 使用 page.evaluate 来设置 chrome mock 和注入 content.js
  const contentJs = fs.readFileSync('./extensions/chrome/content.js', 'utf8');

  await page.evaluate(() => {
    window.chrome = {
      runtime: { id: 'test' },
      storage: {
        sync: {
          get: (k, cb) => setTimeout(() => cb({
            formSettings: { name: true, email: true, phone: true, select: true, checkbox: true },
            customRules: [], phoneFormat: 'local', shortcutEnabled: false, autoFillEnabled: true
          }), 0)
        },
        local: { get: (k, cb) => setTimeout(() => cb({}), 0) },
        onChanged: { addListener: () => {} }
      }
    };
  });

  await page.addScriptTag({ content: contentJs });
  await page.waitForTimeout(1000);

  const loaded = await page.evaluate(() => typeof window.__bengaliFakeFill === 'function');
  console.log('扩展已加载:', loaded);

  if (loaded) {
    await page.evaluate(() => window.__bengaliFakeFill());
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: 'test-results/after-filled.png' });

  const r = await page.evaluate(() => ({
    url: location.href,
    inputs: document.querySelectorAll('.n-input input').length,
    filled: Array.from(document.querySelectorAll('.n-input input')).filter(i => i.value).length,
    selects: document.querySelectorAll('.n-select, .n-base-selection').length,
    filledSelects: document.querySelectorAll('.n-base-selection--selected').length
  }));
  console.log('结果:', r);
});