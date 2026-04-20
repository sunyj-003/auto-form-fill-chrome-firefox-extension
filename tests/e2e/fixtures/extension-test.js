const fs = require('fs');
const os = require('os');
const path = require('path');
const { test: base, expect, chromium } = require('@playwright/test');

const extensionPath = path.resolve(__dirname, '../../../extensions/chrome');

const test = base.extend({
  context: async ({}, use, testInfo) => {
    const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-extension-'));
    const context = await chromium.launchPersistentContext(userDataDir, {
      channel: 'chromium',
      headless: testInfo.project.use.headless ?? true,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    try {
      await use(context);
    } finally {
      await context.close();
      fs.rmSync(userDataDir, { recursive: true, force: true });
    }
  },

  page: async ({ context, baseURL }, use) => {
    let page = context.pages()[0];

    if (!page) {
      page = await context.newPage();
    }

    if (baseURL) {
      page.setDefaultNavigationTimeout(30000);
    }

    await use(page);
  },
});

module.exports = { test, expect };
