const { chromium } = require('playwright');

async function testElementPlus() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Open test page
  await page.goto('http://localhost:5173/element-test.html');
  await page.waitForSelector('.el-select', { timeout: 10000 });

  console.log('Page loaded, testing Element Plus...');

  // Get initial state - check the inner input or placeholder
  const firstSelect = page.locator('.el-select').first();
  const placeholder = await firstSelect.locator('.el-select__placeholder').textContent();
  console.log('Initial placeholder:', placeholder);

  // Test 1: Click el-select to open dropdown
  await firstSelect.click();
  await page.waitForTimeout(500);

  // Check if dropdown opened
  const dropdown = await page.locator('.el-select-dropdown:visible').count();
  console.log('Dropdown visible:', dropdown > 0);

  // Get all visible options
  const options = await page.locator('.el-select-dropdown__item:not(.is-disabled)').count();
  console.log('Options found:', options);

  if (options > 0) {
    // Click first option
    await page.locator('.el-select-dropdown__item:not(.is-disabled)').first().click();
    await page.waitForTimeout(300);

    // Get new value
    const newPlaceholder = await firstSelect.locator('.el-select__placeholder').textContent();
    console.log('After click, placeholder:', newPlaceholder);
  }

  // Test 2: Test second select (country)
  const secondSelect = page.locator('.el-select').nth(1);
  await secondSelect.click();
  await page.waitForTimeout(500);

  const countryOptions = await page.locator('.el-select-dropdown__item:not(.is-disabled)').count();
  console.log('Country options:', countryOptions);

  if (countryOptions > 0) {
    await page.locator('.el-select-dropdown__item:not(.is-disabled)').first().click();
    await page.waitForTimeout(300);
    const countryValue = await secondSelect.locator('.el-select__placeholder').textContent();
    console.log('Country selected:', countryValue);
  }

  await browser.close();
  console.log('Test complete!');
}

testElementPlus().catch(console.error);
