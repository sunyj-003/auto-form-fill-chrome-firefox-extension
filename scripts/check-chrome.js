const { execFileSync } = require('node:child_process');

const files = [
  'extensions/chrome/core/storage.js',
  'extensions/chrome/core/context.js',
  'extensions/chrome/core/events.js',
  'extensions/chrome/core/autofill.js',
  'extensions/chrome/core/collector.js',
  'extensions/chrome/core/adapter-registry.js',
  'extensions/chrome/core/adapter-helpers.js',
  'extensions/chrome/content.js',
  'extensions/chrome/generators/fakeData.js',
  'extensions/chrome/adapters/interface.js',
  'extensions/chrome/framework-adapters/naive-ui.js',
  'extensions/chrome/framework-adapters/element-plus.js',
  'extensions/chrome/framework-adapters/ant-design.js',
  'extensions/chrome/framework-adapters/react-select.js',
  'extensions/chrome/framework-adapters/mui.js',
  'extensions/chrome/options.js',
  'extensions/chrome/popup.js',
];

for (const file of files) {
  process.stdout.write(`Checking ${file}\n`);
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
}

process.stdout.write('Chrome extension scripts: OK\n');
