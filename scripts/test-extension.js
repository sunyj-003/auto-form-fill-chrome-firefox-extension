const { chromium } = require('playwright');
const fs = require('fs');

async function testExtensionFill() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging from page
  page.on('console', msg => console.log('[PAGE]', msg.text()));

  // Open test page
  await page.goto('http://localhost:5173/element-test.html');
  await page.waitForSelector('.el-select', { timeout: 10000 });

  console.log('Page loaded, injecting content.js...');

  // Mock chrome API - inject before page loads
  await page.addInitScript(() => {
    window.chrome = {
      storage: {
        sync: {
          get: (keys, callback) => {
            const defaults = {
              formSettings: {
                name: true, email: true, phone: true, address: true,
                company: true, date: true, select: true, textarea: true
              },
              customRules: [],
              phoneFormat: 'local'
            };
            setTimeout(() => callback(defaults), 10);
          }
        }
      }
    };
  });

  // Reload to apply mock
  await page.reload();
  await page.waitForSelector('.el-select', { timeout: 10000 });

  // Read and inject content.js
  const contentJs = fs.readFileSync('./Chrome-Extension/content.js', 'utf8');
  await page.evaluate(contentJs);

  await page.waitForTimeout(500);

  // Trigger the fill function
  console.log('Triggering __bengaliFakeFill...');
  await page.evaluate(() => {
    window.__bengaliFakeFill();
  });

  // Wait for fill to complete
  await page.waitForTimeout(3000);

  // Check results
  const genderPlaceholder = await page.locator('.el-select').first().locator('.el-select__placeholder').textContent().catch(() => 'N/A');
  const countryPlaceholder = await page.locator('.el-select').nth(1).locator('.el-select__placeholder').textContent().catch(() => 'N/A');
  const birthdayValue = await page.locator('.el-date-editor input').inputValue().catch(() => 'N/A');

  console.log('=== Results ===');
  console.log('Gender:', genderPlaceholder);
  console.log('Country:', countryPlaceholder);
  console.log('Birthday:', birthdayValue);

  await browser.close();
}

testExtensionFill().catch(console.error);
