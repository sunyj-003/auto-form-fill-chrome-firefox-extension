const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    devtools: true
  });
  const page = await browser.newPage();

  // Capture console logs
  page.on('console', msg => {
    console.log('[PAGE]', msg.type(), msg.text());
  });

  await page.addInitScript(() => {
    window.chrome = {
      storage: {
        sync: {
          get: function(keys, callback) {
            setTimeout(function() {
              callback({
                formSettings: { name: true, email: true, phone: true, address: true, company: true, date: true, select: true, textarea: true },
                customRules: [],
                phoneFormat: 'local'
              });
            }, 10);
          }
        },
        local: {
          get: function(keys, callback) { setTimeout(function() { callback({}); }, 10); }
        }
      }
    };
  });

  console.log('Opening page...');
  await page.goto('http://localhost:5173/element-test.html');
  await page.waitForSelector('.el-select', { timeout: 10000 });

  // Inject content.js
  const fs = require('fs');
  await page.evaluate(fs.readFileSync('./Chrome-Extension/content.js', 'utf8'));

  console.log('Running __bengaliFakeFill...');
  await page.evaluate(function() { window.__bengaliFakeFill && window.__bengaliFakeFill(); });

  await page.waitForTimeout(6000);

  // Check results
  const genderText = await page.locator('.el-select').first().locator('.el-select__placeholder').textContent().catch(() => 'N/A');
  const countryText = await page.locator('.el-select').nth(1).locator('.el-select__placeholder').textContent().catch(() => 'N/A');
  const birthdayValue = await page.locator('.el-date-editor input').inputValue().catch(() => 'N/A');

  console.log('\n=== RESULTS ===');
  console.log('Gender select:', genderText);
  console.log('Country select:', countryText);
  console.log('Birthday:', birthdayValue);

  await browser.close();
})();
