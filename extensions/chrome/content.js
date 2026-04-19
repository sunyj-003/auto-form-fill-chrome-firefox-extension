/**
 * Bengali Fake Fill - Chrome Extension Content Script
 * Orchestration entry point - delegates to core modules
 */
(() => {
  if (window.__bengaliFakeFill) return;

  // Load core modules from window (injected before this script)
  const storage = window.__BengaliStorage__;
  const context = window.__BengaliContext__;
  const events = window.__BengaliEvents__;
  const autofill = window.__BengaliAutofill__;
  const collector = window.__BengaliCollector__;
  const adapterRegistry = window.__BengaliAdapterRegistry__;
  const fill = window.__BengaliFill__;
  const dropdown = window.__BengaliDropdown__;

  // Register framework adapters
  if (adapterRegistry?.registerKnownAdapters) {
    adapterRegistry.registerKnownAdapters();
  }

  // Track filled elements
  let filledElements = new WeakSet();

  // Create auto fill controller
  const autoFillController = autofill?.createAutoFillController({
    isElementFilled: (el) => filledElements.has(el),
    fill: () => window.__bengaliFakeFill && window.__bengaliFakeFill()
  }) || {};

  /**
   * Main entry point - fill all form fields on the page
   */
  window.__bengaliFakeFill = async function (fromShortcut = false) {
    // Skip if page is hidden (unless triggered by shortcut)
    if (!fromShortcut && document.hidden) {
      console.log('[BengaliFakeFill] Page hidden, skipping');
      return;
    }

    // M5.32: Check if current site is excluded
    const currentUrl = window.location.href;
    const r = await storage.getSettings();
    if (r.excludedSites && r.excludedSites.length > 0) {
      if (storage.isSiteExcluded(currentUrl, r.excludedSites)) {
        console.log('[BengaliFakeFill] Site excluded, skipping');
        return;
      }
    }

    // Get settings
    const r = await storage.getSettings();
    const formSettings = r.formSettings;
    const set = (k) => formSettings[k] !== false;
    const { phoneFormat, customRules } = r;

    // Collect form elements
    const list = collector?.createCollectionState() || { items: [] };
    await collector?.collectFromRoot(document, list);
    let elements = list.items || [];

    // Filter already filled elements
    elements = elements.filter(item => !filledElements.has(item.el));

    // Sort by visual position
    elements.sort((a, b) => {
      const rectA = a.el.getBoundingClientRect();
      const rectB = b.el.getBoundingClientRect();
      const topDiff = (rectA.top + window.scrollY) - (rectB.top + window.scrollY);
      if (Math.abs(topDiff) > 10) return topDiff;
      return rectA.left - rectB.left;
    });

    // Deduplicate
    const uniqueElements = [];
    const seen = new Set();
    for (const item of elements) {
      if (!seen.has(item.el)) { seen.add(item.el); uniqueElements.push(item); }
    }

    // Load custom files
    const customFilesData = await storage.getCustomFiles();

    // Process each element
    for (const item of uniqueElements) {
      const { type, el } = item;

      // Check visibility
      const inElementPlus = el.classList?.contains('el-input__wrapper') ||
                           el.classList?.contains('el-textarea__inner') ||
                           el.classList?.contains('el-checkbox__input') ||
                           el.classList?.contains('el-select__wrapper') ||
                           el.classList?.contains('el-date-editor');
      const style = el.style;
      const computedStyle = el.ownerDocument?.defaultView?.getComputedStyle(el);
      const isHidden = (el.offsetParent === null && !inElementPlus) ||
                     (computedStyle && computedStyle.display === 'none');
      if (isHidden && type !== 'vue-select' && el.type !== 'file' && !inElementPlus) continue;
      if ((el.disabled || el.readOnly) && !el.classList.contains("flatpickr-input") && type !== 'vue-select') continue;

      // Scroll to element and add visual feedback
      events?.smoothScrollTo(el);
      const originalShadow = el.style.boxShadow;
      const originalTrans = el.style.transition;
      el.style.transition = "box-shadow 0.2s ease";
      el.style.boxShadow = "0 0 8px 2px rgba(33, 150, 243, 0.5)";

      try {
        // Process based on element type
        if (type === 'naive-select') {
          // Naive UI select
          if (set("select")) await dropdown?.withTimeout(processNaiveUISelect(el), 2000);
        } else if (type === 'vue-select' || type === 'custom-dropdown') {
          // Framework dropdowns
          if (set("select")) await dropdown?.withTimeout(dropdown?.processFrameworkDropdown(el), 2000);
        } else if (type === 'el-date-picker') {
          // Date pickers
          if (set("date")) {
            if (el.closest('.n-date-picker')) {
              await dropdown?.withTimeout(dropdown?.processNaiveDatePicker(el), 1500);
            } else {
              await dropdown?.withTimeout(dropdown?.processElementPlusDatePicker(el), 1500);
            }
          }
        } else if (type === 'el-checkbox') {
          // Element Plus checkbox
          if (set("checkbox")) {
            const wrapper = el.closest('.el-checkbox');
            el.click();
            await new Promise(r => setTimeout(r, 20));
            if (!el.checked && wrapper) wrapper.click();
            if (!el.checked) { el.checked = true; el.dispatchEvent(new Event('input')); el.dispatchEvent(new Event('change')); }
          }
        } else if (type === 'input') {
          // Standard inputs
          fill?.guessAndFillInput(el, set, customRules, phoneFormat, customFilesData);
          if (el.type === 'file') await new Promise(r => setTimeout(r, 150));
          else await new Promise(r => setTimeout(r, 60));
        } else if (type === 'textarea') {
          // Textareas
          if (set("textarea")) {
            const FD = window.__BengaliFakeFillData__;
            events?.setValueAndNotify(el, FD?.fakeSentence?.() || 'Sample description text');
          }
          await new Promise(r => setTimeout(r, 60));
        } else if (type === 'select') {
          // Native selects
          fill?.fillNativeSelect(el, set);
          await new Promise(r => setTimeout(r, 60));
        } else if (type === 'contenteditable') {
          // Contenteditable
          if (set("textarea")) {
            const FD = window.__BengaliFakeFillData__;
            el.textContent = FD?.fakeSentence?.() || 'Sample text';
            el.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
      } catch (e) { console.error(e); }

      // Restore visual style
      setTimeout(() => {
        el.style.boxShadow = originalShadow;
        el.style.transition = originalTrans;
      }, 300);

      // Mark as filled
      filledElements.add(el);
    }

    // Handle auto-fill mode
    if (r.autoFillEnabled) {
      autoFillController?.start?.(r);
    } else {
      autoFillController?.cleanup?.();
    }

    // Handle radio buttons and Select2
    if (set("radio")) events?.fillRadiosByGroup();
    if (set("select")) dropdown?.fillSelect2();
  };

  // Naive UI select processor
  async function processNaiveUISelect(el) {
    const dropdownLib = window.__BengaliDropdown__;
    const rand = dropdownLib?.rand || ((arr) => arr[Math.floor(Math.random() * arr.length)]);

    // Get label for logging
    let selectLabel = '';
    try {
      const formItem = el.closest('.n-form-item');
      if (formItem) {
        const labelEl = formItem.querySelector('.n-form-item-label__text, .n-form-item-label');
        if (labelEl) selectLabel = ' - ' + labelEl.textContent.trim().slice(0, 20);
      }
    } catch(e) {}

    const prevText = el.textContent.trim();

    // Click to open dropdown
    el.click();

    // Wait for dropdown menu
    await new Promise(r => setTimeout(r, 300));

    // Find dropdown
    const follower = document.querySelector(".v-binder-follower-content");
    if (!follower) return;

    const menu = follower.querySelector(".n-base-select-menu, .n-select-menu");
    if (!menu) return;

    // Find options
    let options = menu.querySelectorAll(".n-base-select-option__content");
    if (options.length === 0) {
      const vl = menu.querySelector('.v-vl-visible-items');
      if (vl) options = vl.querySelectorAll(".n-base-select-option__content");
    }

    const validOptions = Array.from(options).filter(o => {
      const parent = o.closest('.n-base-select-option');
      if (!parent) return false;
      const oStyle = window.getComputedStyle(parent);
      const text = o.textContent?.trim() || '';
      if (/^\d+\s*\/\s*页$/.test(text)) return false;
      return oStyle.display !== 'none' && !parent.classList.contains('disabled');
    });

    if (validOptions.length > 0) {
      const idx = Math.floor(Math.random() * validOptions.length);
      const randomOption = validOptions[idx];
      const optionContainer = randomOption.closest('.n-base-select-option');
      if (optionContainer) {
        optionContainer.scrollIntoView({ block: "nearest" });
        optionContainer.click();
        await new Promise(r => setTimeout(r, 300));
      }
    }
  }

  // Keyboard shortcut: Ctrl+Shift+V+V (double press)
  let shortcutEnabled = true;
  let lastVPress = 0;

  function updateShortcut(enabled) {
    shortcutEnabled = enabled !== false;
  }

  // Initialize
  storage.getSettings().then((settings) => {
    updateShortcut(settings.shortcutEnabled);
    if (settings.autoFillEnabled) autoFillController?.start?.(settings);
  }).catch(() => {});

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      if (changes.shortcutEnabled) updateShortcut(changes.shortcutEnabled.newValue);
      if (changes.autoFillEnabled) {
        if (changes.autoFillEnabled.newValue) autoFillController?.start?.({ autoFillEnabled: true });
        else autoFillController?.cleanup?.();
      }
    }
  });

  // Keyboard event listener
  window.addEventListener("keydown", (e) => {
    if (!shortcutEnabled) return;
    if ((e.key === "v" || e.key === "V") && (e.ctrlKey || e.metaKey) && e.shiftKey) {
      const now = Date.now();
      if (now - lastVPress < 500) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.__bengaliFakeFill === "function") window.__bengaliFakeFill(true);
        lastVPress = 0;
      } else {
        lastVPress = now;
      }
    }
  });

})();