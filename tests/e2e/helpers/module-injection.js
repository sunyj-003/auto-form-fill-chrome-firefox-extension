const fs = require('fs');
const path = require('path');
const manifest = require('../../../extensions/chrome/manifest.json');

const extensionRoot = path.resolve(__dirname, '../../../extensions/chrome');
const contentScriptFiles = manifest.content_scripts[0].js.map((file) => ({
  file,
  content: fs.readFileSync(path.join(extensionRoot, file), 'utf8'),
}));

function createMockSettings(overrides = {}) {
  return {
    formSettings: {
      name: true,
      email: true,
      phone: true,
      address: true,
      company: true,
      select: true,
      checkbox: true,
      radio: true,
      textarea: true,
      file: true,
      date: true,
      number: true,
      password: true,
      url: true,
      text: true,
      ...((overrides && overrides.formSettings) || {}),
    },
    customRules: [],
    phoneFormat: 'local',
    shortcutEnabled: false,
    autoFillEnabled: false,
    excludedSites: [],
    ...overrides,
  };
}

async function installMockChrome(page, settingsOverrides = {}) {
  const settings = createMockSettings(settingsOverrides);
  await page.addScriptTag({
    content: `
      window.chrome = {
        runtime: { id: 'test-extension' },
        storage: {
          sync: {
            get: (_keys, callback) => setTimeout(() => callback(${JSON.stringify(settings)}), 0),
            set: (_data, callback) => setTimeout(() => callback && callback(), 0)
          },
          local: {
            get: (_keys, callback) => setTimeout(() => callback({}), 0),
            set: (_data, callback) => setTimeout(() => callback && callback(), 0),
            remove: (_keys, callback) => setTimeout(() => callback && callback(), 0)
          },
          onChanged: { addListener: () => {} }
        }
      };
    `,
  });
}

async function injectContentScriptModules(page) {
  for (const script of contentScriptFiles) {
    await page.addScriptTag({ content: script.content });
  }
}

async function installInjectedExtension(page, settingsOverrides = {}) {
  await installMockChrome(page, settingsOverrides);
  await injectContentScriptModules(page);
}

module.exports = {
  createMockSettings,
  installMockChrome,
  injectContentScriptModules,
  installInjectedExtension,
};
