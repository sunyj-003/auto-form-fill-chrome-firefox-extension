const { defineConfig } = require('@playwright/test');

const realExtensionSpecs = [
  '**/extension-load.spec.js',
  '**/real-extension.spec.js',
  '**/naive-ui-select-ext.spec.js',
];

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 0,
  reporter: 'line',
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: realExtensionSpecs,
      use: { browserName: 'chromium' },
    },
    {
      name: 'chromium-with-extension',
      testMatch: realExtensionSpecs,
      use: {
        browserName: 'chromium',
        channel: 'chromium',
      },
    },
    {
      name: 'chromium-cdp',
      testIgnore: realExtensionSpecs,
      workers: 1,
      use: {
        browserName: 'chromium',
        channel: 'chromium',
        launchOptions: {
          args: ['--remote-debugging-port=9222'],
        },
      },
      timeout: 60000,
    },
  ],
});
