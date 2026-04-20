const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const outputDir = path.resolve(__dirname, '../artifacts/test-report');
const targetUrl = process.argv[2] || 'http://develop.findsoft.com.cn/secman/login';

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => !p.url().startsWith('chrome://')) || await context.newPage();

  const response = await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const result = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    bodyText: (document.body?.innerText || '').slice(0, 300),
  }));

  const screenshotPath = path.join(outputDir, 'external-login-debug.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log(JSON.stringify({
    requestedUrl: targetUrl,
    httpStatus: response ? response.status() : null,
    finalUrl: result.url,
    title: result.title,
    bodyPreview: result.bodyText,
    screenshotPath,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
