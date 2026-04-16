// playwright.config.js - 支持 Chrome 扩展加载和 CDP 连接
const { defineConfig } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'chromium-with-extension',
      use: { browserName: 'chromium' },
      launchOptions: {
        args: [
          '--disable-extensions-except=' + path.resolve(__dirname, './extensions/chrome'),
          '--load-extension=' + path.resolve(__dirname, './extensions/chrome'),
        ],
      },
    },
    {
      name: 'chromium-cdp',
      use: {
        browserName: 'chromium',
        launchOptions: {
          args: ['--remote-debugging-port=9222'],
        },
      },
      timeout: 60000,
    },
  ],
});