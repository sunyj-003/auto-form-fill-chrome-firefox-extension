const storage = window.__BengaliStorage__;

async function loadShortcutToggle() {
  const el = document.getElementById('shortcutToggle');
  if (!el) return;
  const settings = await storage.getSettings();
  const on = settings.shortcutEnabled;
  el.classList.toggle('on', on);
  el.setAttribute('aria-checked', on);
}

loadShortcutToggle().catch(() => {});

const shortcutToggle = document.getElementById('shortcutToggle');
if (shortcutToggle) shortcutToggle.addEventListener('click', async function () {
  const on = this.classList.toggle('on');
  this.setAttribute('aria-checked', on);
  try {
    await storage.setShortcutEnabled(on);
  } catch (err) {}
});

const settingsLink = document.getElementById('settingsLink');
if (settingsLink) settingsLink.addEventListener('click', (e) => {
  e.preventDefault();
  try { chrome.runtime.openOptionsPage(); } catch (err) {}
});

const fillBtn = document.getElementById('fillBtn');
if (fillBtn) fillBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: [
      'core/storage.js',
      'core/context.js',
      'core/field-types.js',
      'core/field-detection.js',
      'core/events.js',
      'core/autofill.js',
      'core/collector.js',
      'core/fill.js',
      'core/dropdown.js',
      'generators/fakeData.js',
      'adapters/interface.js',
      'core/adapter-helpers.js',
      'framework-adapters/naive-ui.js',
      'framework-adapters/element-plus.js',
      'framework-adapters/ant-design.js',
      'framework-adapters/react-select.js',
      'framework-adapters/mui.js',
      'core/adapter-registry.js',
      'content.js'
    ]
  });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => { typeof window.__bengaliFakeFill === 'function' && window.__bengaliFakeFill(); }
  });
  window.close();
});
