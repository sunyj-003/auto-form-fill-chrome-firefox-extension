const { chromium } = require('playwright');

async function testElementPlus() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:5173/element-test.html');
  await page.waitForSelector('.el-select', { timeout: 10000 });
  console.log('Page loaded.\n');

  // Test 1: Use dispatchEvent for more reliable clicks
  console.log('Test 1: Gender select with dispatchEvent...');
  const genderSelect = page.locator('.el-select').first();
  await genderSelect.dispatchEvent('click');
  await page.waitForTimeout(800);

  let dropdown = await page.locator('.el-select-dropdown:visible').count();
  console.log('Dropdown after dispatchEvent:', dropdown > 0);

  if (dropdown > 0) {
    // Use force click
    await page.locator('.el-select-dropdown__item').first().click({ force: true });
    await page.waitForTimeout(300);
    const result = await page.locator('.el-select').first().locator('.el-select__placeholder').textContent();
    console.log('Selected:', result);
  }

  // Test 2: Try with keyboard
  console.log('\nTest 2: Country select with keyboard...');
  await page.locator('.el-select').nth(1).click();
  await page.waitForTimeout(500);

  // Press Enter to select first option
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);

  const countryResult = await page.locator('.el-select').nth(1).locator('.el-select__placeholder').textContent();
  console.log('Selected:', countryResult);

  // Test 3: Date picker
  console.log('\nTest 3: Date picker...');
  await page.locator('.el-date-editor').click();
  await page.waitForTimeout(500);

  const datePanel = await page.locator('.el-date-picker__popper:visible, .el-picker-panel:visible').count();
  console.log('Date panel visible:', datePanel > 0);

  if (datePanel > 0) {
    // Try different ways to select date
    const firstDay = page.locator('.el-date-table__cell').first();
    await firstDay.dispatchEvent('click');
    await page.waitForTimeout(300);

    const dateValue = await page.locator('.el-date-editor input').inputValue();
    console.log('Selected date:', dateValue);
  }

  await browser.close();
  console.log('\nDone!');
}

testElementPlus().catch(console.error);
