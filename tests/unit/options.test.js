function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('options.js', () => {
  let storage;

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = `
      <div id="toast"><span id="toastMessage"></span></div>
      <div id="shortcutToggle" class="switch" aria-checked="false"></div>
      <div id="autoFillToggle" class="switch" aria-checked="false"></div>
      <select id="phoneFormat"><option value="local">local</option><option value="international">international</option></select>
      <span id="fieldCount"></span>
      <div id="rulesList"></div>
      <div id="customFilesStatus"></div>
      <div id="excludedSitesList"></div>
      <input id="excludedSiteInput" />
      <button id="addExcludedSite"></button>
      <button id="addRule"></button>
      <input id="rulePattern" />
      <select id="ruleType"><option value="name">name</option></select>
      <input id="ruleRegex" type="checkbox" />
      <div class="tab active" data-panel="general" aria-selected="true"></div>
      <div id="panel-general" class="panel active"></div>
      <button id="enableAll"></button>
      <button id="disableAll"></button>
      <button id="resetBtn"></button>
      <div id="modalOverlay"></div>
      <button id="modalCancel"></button>
      <button id="modalConfirm"></button>
      <input id="customImage" type="file" />
      <input id="customPdf" type="file" />
      <input id="customDoc" type="file" />
      <button id="clearCustomFiles"></button>
      <div class="field-chip"><span class="label">Name</span><div id="t_name" class="switch" aria-checked="false"></div></div>
      <div class="field-chip"><span class="label">Email</span><div id="t_email" class="switch" aria-checked="false"></div></div>
    `;

    storage = {
      FORM_KEYS: ['name', 'email'],
      getSettings: jest.fn().mockResolvedValue({
        shortcutEnabled: true,
        autoFillEnabled: false,
        phoneFormat: 'local',
        formSettings: { name: true, email: false },
        customRules: [],
        excludedSites: ['example.com'],
      }),
      getCustomFiles: jest.fn().mockResolvedValue({}),
      updateFormSettings: jest.fn().mockResolvedValue(),
      setPhoneFormat: jest.fn().mockResolvedValue(),
      setShortcutEnabled: jest.fn().mockResolvedValue(),
      setAutoFillEnabled: jest.fn().mockResolvedValue(),
      addCustomRule: jest.fn().mockResolvedValue(),
      removeCustomRule: jest.fn().mockResolvedValue(),
      resetSettings: jest.fn().mockResolvedValue(),
      saveCustomFile: jest.fn().mockResolvedValue({}),
      clearCustomFiles: jest.fn().mockResolvedValue(),
      normalizeCustomFiles: jest.fn((files) => files || {}),
      validateRule: jest.fn(() => ({ valid: true, errors: [] })),
      normalizeExcludedSite: jest.fn((site) => String(site).trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0]),
      addExcludedSite: jest.fn().mockResolvedValue(['example.com', 'app.example.com']),
      removeExcludedSite: jest.fn().mockResolvedValue([]),
    };

    global.window.__BengaliStorage__ = storage;
  });

  afterEach(() => {
    delete global.window.__BengaliStorage__;
  });

  test('renders excluded sites from settings', async () => {
    require('../../extensions/chrome/options.js');
    await flushPromises();

    expect(document.getElementById('excludedSitesList').textContent).toContain('example.com');
  });

  test('adds a normalized excluded site from the options page', async () => {
    require('../../extensions/chrome/options.js');
    await flushPromises();

    const input = document.getElementById('excludedSiteInput');
    input.value = 'https://app.example.com/form';
    document.getElementById('addExcludedSite').click();
    await flushPromises();

    expect(storage.addExcludedSite).toHaveBeenCalledWith('https://app.example.com/form');
    expect(storage.normalizeExcludedSite).toHaveBeenCalledWith('https://app.example.com/form');
  });

  test('writes field toggle state without inverting it', async () => {
    require('../../extensions/chrome/options.js');
    await flushPromises();

    const toggle = document.getElementById('t_email');
    toggle.click();
    await flushPromises();

    expect(storage.updateFormSettings).toHaveBeenCalledWith({ email: true });
    expect(toggle.getAttribute('aria-checked')).toBe('true');
  });
});
