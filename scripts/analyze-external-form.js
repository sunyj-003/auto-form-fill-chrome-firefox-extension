const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { installInjectedExtension } = require('../tests/e2e/helpers/module-injection');

const outputDir = path.resolve(__dirname, '../artifacts/test-report');
const targetUrl = process.argv[2] || 'http://develop.findsoft.com.cn/secman/person/new';

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().startsWith('http://develop.findsoft.com.cn/secman/person/new')) || await context.newPage();

  if (page.url() !== targetUrl) {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
  }

  const before = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select')).slice(0, 40);
    return inputs.map((el, index) => ({
      index,
      tag: el.tagName,
      type: el.type || '',
      id: el.id || '',
      name: el.name || '',
      placeholder: el.getAttribute('placeholder') || '',
      value: el.value || '',
      className: typeof el.className === 'string' ? el.className.slice(0, 120) : '',
      label: el.closest('.n-form-item, .el-form-item, .ant-form-item, .form-item, .ivu-form-item, .item, .cell')?.textContent?.trim()?.slice(0, 80) || ''
    }));
  });

  await installInjectedExtension(page, {
    autoFillEnabled: false,
    formSettings: {
      name: true,
      email: true,
      phone: true,
      address: true,
      company: true,
      select: true,
      checkbox: true,
      radio: true,
      textarea: true,
      date: true,
      number: true,
      password: true,
      url: true,
      text: true,
      file: false,
    },
  });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
  await page.waitForTimeout(4000);

  const after = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select')).slice(0, 60);
    const filled = inputs
      .map((el, index) => ({
        index,
        tag: el.tagName,
        type: el.type || '',
        id: el.id || '',
        name: el.name || '',
        placeholder: el.getAttribute('placeholder') || '',
        value: el.value || '',
        checked: typeof el.checked === 'boolean' ? el.checked : undefined,
        className: typeof el.className === 'string' ? el.className.slice(0, 120) : '',
      }))
      .filter((el) => Boolean(el.value) || el.checked === true);

    return {
      filledCount: filled.length,
      filled,
    };
  });

  const screenshotPath = path.join(outputDir, 'external-person-new-filled.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const result = JSON.stringify({
    url: page.url(),
    sampledBefore: before,
    after,
    screenshotPath,
  }, null, 2);

  console.log(result);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
