async function triggerShortcutFill(page) {
  await page.locator('body').click({ position: { x: 5, y: 5 } });

  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.down(modifier);
  await page.keyboard.down('Shift');
  await page.keyboard.press('KeyV');
  await page.waitForTimeout(100);
  await page.keyboard.press('KeyV');
  await page.keyboard.up('Shift');
  await page.keyboard.up(modifier);
}

module.exports = {
  triggerShortcutFill,
};
