/**
 * Ant Design Framework Adapter
 * Handles ant-select, ant-input, ant-checkbox, ant-radio, ant-date-picker components
 * Integrates with BengaliFakeFill adapter interface
 */
(function() {
  // Use shared fake data module completely
  const FD = window.__BengaliFakeFillData__;
  if (!FD) {
    console.error('[AntDesign Adapter] Shared fake data module not loaded');
    return;
  }

  // Use shared functions directly
  const { rand, randInt, getValueByType, fakeName, fakeEmail, fakeAddress, fakeCity, fakePhone, fakePhoneLocal, fakeDateISO, fakePassword } = FD;

  // Export to window for content.js to use
  window.__antDesignAdapter = {
    name: 'ant-design',
    version: '1.0.0',

    // Supported components
    supportedComponents: [
      'ant-input', 'ant-input-number', 'ant-input-textarea',
      'ant-select',
      'ant-checkbox', 'ant-checkbox-group',
      'ant-radio-group', 'ant-radio',
      'ant-picker', 'ant-picker-date', 'ant-calendar-picker'
    ],

    /**
     * Detect Ant Design components in the document
     @param {Set} seenEl - Set of already processed elements
     * @returns {Array} Array of detected components
     */
    detect: function(seenEl) {
      const items = [];

      // ant-input (text, password, textarea)
      document.querySelectorAll(".ant-input, .ant-input-number-input, .ant-input-textarea").forEach(el => {
        if (seenEl.has(el)) return;
        seenEl.add(el);
        items.push({ type: 'input', el, from: 'ant-design' });
      });

      // ant-select
      document.querySelectorAll(".ant-select").forEach(el => {
        if (seenEl.has(el)) return;
        if (el.classList.contains("ant-select-disabled")) return;
        seenEl.add(el);
        const selector = el.querySelector(".ant-select-selector");
        if (selector) seenEl.add(selector);
        items.push({ type: 'ant-select', el, from: 'ant-design' });
      });

      // ant-checkbox
      document.querySelectorAll(".ant-checkbox-input").forEach(el => {
        if (seenEl.has(el)) return;
        seenEl.add(el);
        items.push({ type: 'ant-checkbox', el, from: 'ant-design' });
      });

      // ant-radio
      document.querySelectorAll(".ant-radio-input").forEach(el => {
        if (seenEl.has(el)) return;
        seenEl.add(el);
        items.push({ type: 'ant-radio', el, from: 'ant-design' });
      });

      // ant-picker (date, time)
      document.querySelectorAll(".ant-picker, .ant-picker-date, .ant-calendar-picker").forEach(el => {
        if (seenEl.has(el)) return;
        if (el.classList.contains("ant-picker-disabled")) return;
        seenEl.add(el);
        const input = el.querySelector(".ant-picker-input input");
        if (input) seenEl.add(input);
        items.push({ type: 'ant-picker', el, from: 'ant-design' });
      });

      return items;
    },

    /**
     * Fill an Ant Design component with fake data
     * @param {Object} item - Component item with type and element
     * @param {Function} generateFakeData - Function to generate fake data
     * @returns {boolean} True if filled successfully
     */
    fill: function(item, generateFakeData) {
      const { type, el } = item;

      try {
        switch (type) {
          case 'input':
            return fillAntInput(el, generateFakeData);
          case 'ant-select':
            return fillAntSelect(el, generateFakeData);
          case 'ant-checkbox':
            return fillAntCheckbox(el);
          case 'ant-radio':
            return fillAntRadio(el);
          case 'ant-picker':
            return fillAntPicker(el, generateFakeData);
          default:
            return false;
        }
      } catch (err) {
        console.error('[AntDesign Adapter] Fill error:', err);
        return false;
      }
    },

    /**
     * Get field context for better data generation
     * @param {Element} el - The element to analyze
     * @returns {Object} Context information
     */
    getFieldContext: function(el) {
      const context = { framework: 'ant-design' };

      // Check for label
      const formItem = el.closest('.ant-form-item');
      if (formItem) {
        const label = formItem.querySelector('.ant-form-item-label > label');
        if (label) {
          context.label = label.textContent?.trim().toLowerCase() || '';
        }
      }

      // Check placeholder
      const placeholder = el.querySelector('input[placeholder]')?.getAttribute('placeholder') ||
                         el.querySelector('.ant-select-selection-item')?.textContent;
      if (placeholder && typeof placeholder === 'string') {
        context.placeholder = placeholder.toLowerCase();
      }

      // Check name/id attributes
      const name = el.getAttribute('name') || '';
      const id = el.getAttribute('id') || '';
      context.fieldName = (name + id).toLowerCase();

      return context;
    }
  };

  // --- Helper Functions ---

  function fillAntInput(el, generateFakeData) {
    // Find the actual input element
    const input = el.querySelector('input, textarea') || el;
    if (!input || input.disabled || input.readOnly) return false;

    const context = window.__antDesignAdapter.getFieldContext(el);
    const ctx = context.label + ' ' + context.fieldName;

    // Use getValueByType with context for smart data generation
    if (/name|first.*name|full.*name/i.test(ctx)) {
      value = getValueByType('name', ctx);
    } else if (/email/i.test(ctx)) {
      value = getValueByType('email', ctx);
    } else if (/phone|mobile|tel/i.test(ctx)) {
      value = getValueByType('phone', ctx, { phoneFormat: 'international' });
    } else if (/address/i.test(ctx)) {
      value = getValueByType('address', ctx);
    } else if (/city/i.test(ctx)) {
      value = getValueByType('city', ctx);
    } else if (/company|organization/i.test(ctx)) {
      value = getValueByType('company', ctx);
    } else if (/password/i.test(ctx)) {
      value = getValueByType('password', ctx);
    } else if (/url|website/i.test(ctx)) {
      value = getValueByType('url', ctx);
    } else if (/date|time/i.test(ctx)) {
      value = getValueByType('date', ctx);
    } else if (/number|age|qty/i.test(ctx)) {
      value = getValueByType('number', ctx);
    } else {
      value = getValueByType('name', ctx);
    }

    // Set value
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    return true;
  }

  function fillAntSelect(el, generateFakeData) {
    // Get the select wrapper
    const select = el.classList.contains('ant-select') ? el : el.closest('.ant-select');
    if (!select || select.classList.contains('ant-select-disabled')) return false;

    console.log('[AntDesign Adapter] Processing select:', select.className.slice(0, 50));

    // Click to open dropdown
    const trigger = select.querySelector('.ant-select-selector');
    if (!trigger) {
      console.log('[AntDesign Adapter] No trigger found');
      return false;
    }

    trigger.click();

    // Wait for dropdown to appear
    return new Promise(async (resolve) => {
      await new Promise(r => setTimeout(r, 300));

      // Find dropdown menu - Ant Design uses ant-select-dropdown
      const dropdown = document.querySelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
      if (!dropdown) {
        console.log('[AntDesign Adapter] Dropdown not found');
        resolve(false);
        return;
      }

      // Find options
      const options = dropdown.querySelectorAll('.ant-select-item:not(.ant-select-item-disabled)');
      if (options.length === 0) {
        console.log('[AntDesign Adapter] No options found');
        resolve(false);
        return;
      }

      // Randomly select an option (skip first if it's a placeholder)
      let idx = 0;
      if (options.length > 1) {
        idx = Math.floor(Math.random() * options.length);
        if (idx === 0) idx = 1; // Skip placeholder
      }

      const randomOption = options[idx];
      randomOption.click();

      await new Promise(r => setTimeout(r, 200));

      console.log('[AntDesign Adapter] Selected option:', randomOption.textContent.trim());
      resolve(true);
    });
  }

  function fillAntCheckbox(el) {
    // Click to check the checkbox
    const wrapper = el.closest('.ant-checkbox') || el;
    el.click();
    setTimeout(() => {
      if (!el.checked && wrapper) {
        wrapper.click();
      }
      // Force check if still not checked
      if (!el.checked) {
        el.checked = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, 50);
    return true;
  }

  function fillAntRadio(el) {
    // Click to select the radio
    const wrapper = el.closest('.ant-radio') || el;
    el.click();
    setTimeout(() => {
      if (!el.checked && wrapper) {
        wrapper.click();
      }
      if (!el.checked) {
        el.checked = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, 50);
    return true;
  }

  function fillAntPicker(el, generateFakeData) {
    // Get the picker container
    const picker = el.classList.contains('ant-picker') ? el : el.closest('.ant-picker');
    if (!picker || picker.classList.contains('ant-picker-disabled')) return false;

    console.log('[AntDesign Adapter] Processing picker');

    // Try to set value directly via hidden input
    const hiddenInput = picker.querySelector('input[type="hidden"]');
    if (hiddenInput) {
      const dateValue = getValueByType('date');
      hiddenInput.value = dateValue;
      hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
      hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    // Fallback: click and select from panel
    const trigger = picker.querySelector('.ant-picker-input');
    if (trigger) {
      trigger.click();
      return new Promise(async (resolve) => {
        await new Promise(r => setTimeout(r, 300));

        // Find date panel
        const panel = document.querySelector('.ant-picker-panel-container');
        if (panel) {
          const cells = panel.querySelectorAll('.ant-picker-cell:not(.ant-picker-cell-disabled)');
          const validCells = Array.from(cells).filter(o => {
            const r = o.getBoundingClientRect();
            return r.width > 5 && r.height > 5;
          });

          if (validCells.length > 0) {
            rand(validCells).click();
            await new Promise(r => setTimeout(r, 100));
            resolve(true);
            return;
          }
        }

        resolve(false);
      });
    }

    return false;
  }

  if (window.__BengaliFakeFillAdapterAPI__) {
    window.__BengaliFakeFillAdapterAPI__.registerAdapter(window.__antDesignAdapter);
  }

  console.log('[AntDesign Adapter] Loaded v1.0.0');
})();
