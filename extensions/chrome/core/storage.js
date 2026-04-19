(function () {
  // M4.22: Field types including skip
  const FIELD_TYPES = ['name', 'email', 'phone', 'address', 'company', 'date', 'checkbox', 'radio', 'select', 'textarea', 'number', 'password', 'url', 'nid', 'file', 'text', 'skip'];
  const FORM_KEYS = FIELD_TYPES;
  const SYNC_KEYS = {
    shortcutEnabled: 'shortcutEnabled',
    autoFillEnabled: 'autoFillEnabled',
    formSettings: 'formSettings',
    customRules: 'customRules',
    phoneFormat: 'phoneFormat',
    excludedSites: 'excludedSites',
  };
  const LOCAL_KEYS = {
    customFiles: 'customFiles',
  };

  function getSync(storeKeys) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(storeKeys, (result) => {
        if (chrome.runtime?.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(result || {});
      });
    });
  }

  function setSync(data) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(data, () => {
        if (chrome.runtime?.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }

  function getLocal(storeKeys) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(storeKeys, (result) => {
        if (chrome.runtime?.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(result || {});
      });
    });
  }

  function setLocal(data) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime?.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }

  function removeLocal(storeKeys) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(storeKeys, () => {
        if (chrome.runtime?.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }

  function getDefaultSettings() {
    const formSettings = {};
    for (const key of FORM_KEYS) formSettings[key] = true;
    return {
      shortcutEnabled: true,
      autoFillEnabled: false,
      phoneFormat: 'local',
      formSettings,
      customRules: [],
      excludedSites: [],
    };
  }

  function normalizePhoneFormat(value) {
    return value === 'international' ? 'international' : 'local';
  }

  function normalizeFormSettings(settings) {
    const defaults = getDefaultSettings().formSettings;
    const source = settings && typeof settings === 'object' ? settings : {};
    const merged = { ...defaults };
    for (const key of FORM_KEYS) {
      if (source[key] === false) merged[key] = false;
    }
    return merged;
  }

  function normalizeRules(rules) {
    if (!Array.isArray(rules)) return [];
    return rules
      .filter((rule) => rule && String(rule.pattern || '').trim() && rule.fillType)
      .map((rule) => ({
        pattern: String(rule.pattern).trim(),
        fillType: String(rule.fillType),
        regex: rule.regex === true,
      }));
  }

  // M4.23: Validate custom rule before saving
  function validateRule(rule) {
    const errors = [];

    // Pattern cannot be empty
    if (!rule || !String(rule.pattern || '').trim()) {
      errors.push('Pattern cannot be empty');
    }

    // fillType must be in allowed list
    const fillType = rule?.fillType;
    if (!fillType || !FIELD_TYPES.includes(String(fillType).toLowerCase())) {
      errors.push('fillType must be one of: ' + FIELD_TYPES.join(', '));
    }

    // If regex is enabled, validate the pattern
    if (rule?.regex === true && rule?.pattern) {
      try {
        new RegExp(rule.pattern);
      } catch (e) {
        errors.push('Invalid regex pattern: ' + e.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors,
    };
  }

  // M4.22: Classify rule as fixed value or type mapping
  function classifyRule(rule) {
    if (!rule || !rule.fillType) return 'type';

    const fillType = String(rule.fillType).toLowerCase();
    const pattern = String(rule.pattern || '');

    // If rule contains specific value patterns (not just type names), it's likely a fixed value rule
    // Fixed value indicators: email format, phone number format, full URL, specific numbers
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pattern);
    const isPhone = /^(\+88)?01\d{8,9}$/.test(pattern.replace(/[-\s]/g, ''));
    const isUrl = /^https?:\/\//.test(pattern);
    const isSpecificNumber = /^\d{5,13}$/.test(pattern.replace(/[-\s]/g, '')) && !isPhone;

    if (isEmail || isPhone || isUrl || isSpecificNumber) {
      return 'fixed';
    }

    return 'type';
  }

  // M4.22: Get fixed value rules only
  function getFixedValueRules(rules) {
    return rules.filter(r => classifyRule(r) === 'fixed');
  }

  // M4.22: Get type mapping rules only
  function getTypeMappingRules(rules) {
    return rules.filter(r => classifyRule(r) === 'type');
  }

  function normalizeCustomFiles(customFiles) {
    const source = customFiles && typeof customFiles === 'object' ? customFiles : {};
    const out = {};
    if (typeof source.image === 'string' && source.image.startsWith('data:')) {
      out.image = source.image;
      out.imageName = source.imageName || 'custom-image.png';
    }
    if (typeof source.pdf === 'string' && source.pdf.startsWith('data:')) {
      out.pdf = source.pdf;
      out.pdfName = source.pdfName || 'custom-doc.pdf';
    }
    if (typeof source.doc === 'string' && source.doc.startsWith('data:')) {
      out.doc = source.doc;
      out.docName = source.docName || 'custom-doc.docx';
    }
    return out;
  }

  async function getSettings() {
    const raw = await getSync(Object.values(SYNC_KEYS));
    const defaults = getDefaultSettings();
    return {
      shortcutEnabled: raw[SYNC_KEYS.shortcutEnabled] !== false,
      autoFillEnabled: raw[SYNC_KEYS.autoFillEnabled] === true,
      phoneFormat: normalizePhoneFormat(raw[SYNC_KEYS.phoneFormat] || raw[SYNC_KEYS.formSettings]?.phoneFormat || defaults.phoneFormat),
      formSettings: normalizeFormSettings(raw[SYNC_KEYS.formSettings]),
      customRules: normalizeRules(raw[SYNC_KEYS.customRules]),
      excludedSites: normalizeExcludedSites(raw[SYNC_KEYS.excludedSites]),
    };
  }

  // M5.32: Site exclusion/skip list functions
  function normalizeExcludedSites(sites) {
    if (!Array.isArray(sites)) return [];
    return sites
      .filter(s => s && typeof s === 'string' && s.trim())
      .map(s => s.trim().toLowerCase())
      .filter((s, i, arr) => arr.indexOf(s) === i); // Remove duplicates
  }

  function isSiteExcluded(url, excludedSites) {
    if (!url || !excludedSites || excludedSites.length === 0) return false;
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      return excludedSites.some(site => hostname.includes(site) || site.includes(hostname));
    } catch (e) {
      return false;
    }
  }

  async function addExcludedSite(site) {
    const settings = await getSettings();
    const sites = [...settings.excludedSites];
    const normalized = site.trim().toLowerCase();
    if (normalized && !sites.includes(normalized)) {
      sites.push(normalized);
      await setSync({ [SYNC_KEYS.excludedSites]: sites });
    }
    return sites;
  }

  async function removeExcludedSite(site) {
    const settings = await getSettings();
    const sites = settings.excludedSites.filter(s => s !== site.trim().toLowerCase());
    await setSync({ [SYNC_KEYS.excludedSites]: sites });
    return sites;
  }

  async function getCustomFiles() {
    const raw = await getLocal([LOCAL_KEYS.customFiles]);
    return normalizeCustomFiles(raw[LOCAL_KEYS.customFiles]);
  }

  async function setShortcutEnabled(enabled) {
    await setSync({ [SYNC_KEYS.shortcutEnabled]: enabled !== false });
  }

  async function setAutoFillEnabled(enabled) {
    await setSync({ [SYNC_KEYS.autoFillEnabled]: enabled === true });
  }

  async function setPhoneFormat(format) {
    await setSync({ [SYNC_KEYS.phoneFormat]: normalizePhoneFormat(format) });
  }

  async function updateFormSettings(partial) {
    const settings = await getSettings();
    const next = normalizeFormSettings({ ...settings.formSettings, ...(partial || {}) });
    await setSync({ [SYNC_KEYS.formSettings]: next });
    return next;
  }

  async function replaceCustomRules(rules) {
    const normalized = normalizeRules(rules);
    await setSync({ [SYNC_KEYS.customRules]: normalized });
    return normalized;
  }

  async function addCustomRule(rule) {
    const settings = await getSettings();
    const next = normalizeRules(settings.customRules.concat(rule));
    await setSync({ [SYNC_KEYS.customRules]: next });
    return next;
  }

  async function removeCustomRule(index) {
    const settings = await getSettings();
    const next = settings.customRules.filter((_, currentIndex) => currentIndex !== index);
    await setSync({ [SYNC_KEYS.customRules]: next });
    return next;
  }

  async function resetSettings() {
    const defaults = getDefaultSettings();
    await setSync({
      [SYNC_KEYS.shortcutEnabled]: defaults.shortcutEnabled,
      [SYNC_KEYS.autoFillEnabled]: defaults.autoFillEnabled,
      [SYNC_KEYS.formSettings]: defaults.formSettings,
      [SYNC_KEYS.customRules]: defaults.customRules,
      [SYNC_KEYS.phoneFormat]: defaults.phoneFormat,
      [SYNC_KEYS.excludedSites]: defaults.excludedSites,
    });
  }

  async function saveCustomFile(kind, dataUrl, fileName) {
    const current = await getCustomFiles();
    const next = normalizeCustomFiles({ ...current, [kind]: dataUrl, [kind + 'Name']: fileName });
    await setLocal({ [LOCAL_KEYS.customFiles]: next });
    return next;
  }

  async function clearCustomFiles() {
    await removeLocal([LOCAL_KEYS.customFiles]);
  }

  const api = {
    FORM_KEYS,
    SYNC_KEYS,
    LOCAL_KEYS,
    getDefaultSettings,
    normalizeFormSettings,
    normalizeRules,
    normalizeCustomFiles,
    getSettings,
    getCustomFiles,
    setShortcutEnabled,
    setAutoFillEnabled,
    setPhoneFormat,
    updateFormSettings,
    replaceCustomRules,
    addCustomRule,
    removeCustomRule,
    resetSettings,
    saveCustomFile,
    clearCustomFiles,
    // M4.22 & M4.23: Rule validation and classification
    FIELD_TYPES,
    validateRule,
    classifyRule,
    getFixedValueRules,
    getTypeMappingRules,
    // M5.32: Site exclusion
    normalizeExcludedSites,
    isSiteExcluded,
    addExcludedSite,
    removeExcludedSite,
  };

  if (typeof window !== 'undefined') {
    window.__BengaliStorage__ = api;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
