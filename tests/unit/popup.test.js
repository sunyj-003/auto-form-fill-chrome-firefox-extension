const manifest = require('../../extensions/chrome/manifest.json');

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('popup.js', () => {
  let storage;
  let chromeMock;

  beforeEach(() => {
    jest.resetModules();

    document.body.innerHTML = `
      <div id="shortcutToggle" class="toggle" role="switch" aria-checked="false"></div>
      <a id="settingsLink" href="#">Settings</a>
      <button id="fillBtn">Fill</button>
    `;

    storage = {
      getSettings: jest.fn().mockResolvedValue({ shortcutEnabled: true }),
      setShortcutEnabled: jest.fn().mockResolvedValue(),
    };

    chromeMock = {
      runtime: {
        openOptionsPage: jest.fn(),
      },
      tabs: {
        query: jest.fn().mockResolvedValue([{ id: 42 }]),
      },
      scripting: {
        executeScript: jest.fn().mockResolvedValue(),
      },
    };

    global.window.__BengaliStorage__ = storage;
    global.chrome = chromeMock;
  });

  afterEach(() => {
    delete global.chrome;
    delete global.window.__BengaliStorage__;
  });

  test('keeps shortcut toggle state aligned with storage', async () => {
    require('../../extensions/chrome/popup.js');
    await flushPromises();

    const toggle = document.getElementById('shortcutToggle');
    expect(toggle.classList.contains('on')).toBe(true);
    expect(toggle.getAttribute('aria-checked')).toBe('true');

    toggle.click();
    await flushPromises();

    expect(storage.setShortcutEnabled).toHaveBeenCalledWith(false);
    expect(toggle.classList.contains('on')).toBe(false);
    expect(toggle.getAttribute('aria-checked')).toBe('false');
  });

  test('injects the same content script dependency chain as the manifest before filling', async () => {
    require('../../extensions/chrome/popup.js');
    await flushPromises();

    document.getElementById('fillBtn').click();
    await flushPromises();

    expect(chromeMock.tabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true });
    expect(chromeMock.scripting.executeScript).toHaveBeenCalledTimes(2);
    expect(chromeMock.scripting.executeScript.mock.calls[0][0]).toEqual({
      target: { tabId: 42 },
      files: manifest.content_scripts[0].js,
    });
    expect(chromeMock.scripting.executeScript.mock.calls[1][0].target).toEqual({ tabId: 42 });
    expect(typeof chromeMock.scripting.executeScript.mock.calls[1][0].func).toBe('function');
  });
});
