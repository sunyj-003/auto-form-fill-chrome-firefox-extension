const { chromium } = require('playwright');
const fs = require('fs');

async function testExtensionFill() {
  console.log('Starting test...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect all console messages
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    if (text.includes('[Collect]') || text.includes('[Fill]') || text.includes('[Element Plus]')) {
      console.log(text);
    }
  });

  // Open test page
  console.log('Loading page...');
  await page.goto('http://localhost:5173/element-test.html');
  await page.waitForSelector('.el-select', { timeout: 10000 });
  console.log('Page loaded.\n');

  // Add init script to mock chrome
  await page.addInitScript(() => {
    window.chrome = {
      storage: {
        sync: {
          get: (keys, callback) => {
            setTimeout(() => callback({
              formSettings: { name: true, email: true, phone: true, address: true, company: true, date: true, select: true, textarea: true },
              customRules: [],
              phoneFormat: 'local'
            }), 10);
          }
        },
        local: {
          get: (keys, callback) => setTimeout(() => callback({}), 10)
        }
      }
    };
  });

  // Reload to apply mock
  await page.reload();
  await page.waitForSelector('.el-select', { timeout: 10000 });

  // Inject content.js
  const contentJs = fs.readFileSync('./Chrome-Extension/content.js', 'utf8');
  await page.evaluate(contentJs);

  await page.waitForTimeout(500);

  // Trigger fill
  console.log('=== Triggering __bengaliFakeFill ===\n');
  await page.evaluate(() => window.__bengaliFakeFill());

  // Wait for execution
  await page.waitForTimeout(4000);

  // Check results
  console.log('\n=== Checking Results ===\n');

  // Get gender select value
  const genderSelect = page.locator('.el-select').first();
  const genderText = await genderSelect.locator('.el-select__placeholder').textContent().catch(() => 'N/A');
  console.log('Gender select placeholder:', genderText);

  // Get country select value
  const countrySelect = page.locator('.el-select').nth(1);
  const countryText = await countrySelect.locator('.el-select__placeholder').textContent().catch(() => 'N/A');
  console.log('Country select placeholder:', countryText);

  // Get birthday value
  const birthdayInput = page.locator('.el-date-editor input');
  const birthdayValue = await birthdayInput.inputValue().catch(() => 'N/A');
  console.log('Birthday input value:', birthdayValue);

  // Summary
  console.log('\n=== Summary ===');
  console.log('Gender filled:', genderText !== '请选择性别' ? 'YES' : 'NO');
  console.log('Country filled:', countryText !== '请选择国家' ? 'YES' : 'NO');
  console.log('Birthday filled:', birthdayValue !== '' ? 'YES' : 'NO');

  await browser.close();
}

testExtensionFill().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
