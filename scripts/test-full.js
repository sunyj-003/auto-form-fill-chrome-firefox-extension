const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/element-test.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const results = await page.evaluate(() => {
    const firstInput = document.querySelector('input.el-input__inner');
    if (!firstInput) return 'No input found';

    let parent = firstInput;
    const path = [];
    for (let i = 0; i < 10 && parent && parent !== document.body; i++) {
      const labelAttr = parent.getAttribute?.('label');
      path.push(`${parent.tagName}${parent.className ? '.' + parent.className.split(' ')[0] : ''}[label="${labelAttr}"]`);
      parent = parent.parentElement;
    }
    return path.join('\n');
  });

  console.log('DOM path from input to form:\n', results);
  await browser.close();
})();