/**
 * Element Plus Framework Adapter
 * Handles el-select, el-input, el-date-picker, el-checkbox, el-radio components
 * Integrates with BengaliFakeFill adapter interface
 */
(function() {
  // Use shared fake data module completely
  const FD = window.__BengaliFakeFillData__;
  if (!FD) {
    console.error('[ElementPlus Adapter] Shared fake data module not loaded');
    return;
  }

  // Use shared functions directly
  const { rand, randInt, getValueByType, fakeName, fakeEmail, fakeAddress, fakeCity, fakePhone, fakePhoneLocal, fakeDateISO, fakePassword } = FD;

  // Export to window for content.js to use
  window.__elementPlusAdapter = {
    name: 'element-plus',
    version: '1.0.0',

    // Supported components
    supportedComponents: [
      'el-input', 'el-textarea',
      'el-select', 'el-select-v2',
      'el-checkbox', 'el-radio',
      'el-date-picker', 'el-date-editor',
      'el-time-picker'
    ],

    /**
     * Detect Element Plus components in the document
     * @param {Set} seenEl - Set of already processed elements
     * @returns {Array} Array of detected components
     */
    detect: function(seenEl) {
      const items = [];

      // el-input (text, password, textarea)
      document.querySelectorAll(".el-input, .el-textarea__inner").forEach(el => {
        if (seenEl.has(el)) return;
        seenEl.add(el);
        items.push({ type: 'input', el, from: 'element-plus' });
      });

      // el-select
      document.querySelectorAll(".el-select").forEach(el => {
        if (seenEl.has(el)) return;
        if (el.classList.contains("is-disabled")) return;
        seenEl.add(el);
        const selector = el.querySelector(".el-select__wrapper");
        if (selector) seenEl.add(selector);
        items.push({ type: 'el-select', el, from: 'element-plus' });
      });

      // el-checkbox
      document.querySelectorAll(".el-checkbox").forEach(el => {
        if (seenEl.has(el)) return;
        const input = el.querySelector("input[type=checkbox]");
        if (input && !seenEl.has(input)) {
          seenEl.add(el);
          seenEl.add(input);
          items.push({ type: 'el-checkbox', el: input, from: 'element-plus' });
        }
      });

      // el-radio
      document.querySelectorAll(".el-radio").forEach(el => {
        if (seenEl.has(el)) return;
        const input = el.querySelector("input[type=radio]");
        if (input && !seenEl.has(input)) {
          seenEl.add(el);
          seenEl.add(input);
          items.push({ type: 'el-radio', el: input, from: 'element-plus' });
        }
      });

      // el-date-picker
      document.querySelectorAll(".el-date-editor").forEach(el => {
        if (seenEl.has(el)) return;
        if (el.classList.contains("is-disabled")) return;
        seenEl.add(el);
        const wrapper = el.querySelector(".el-input__wrapper");
        if (wrapper) seenEl.add(wrapper);
        items.push({ type: 'el-date-picker', el, from: 'element-plus' });
      });

      return items;
    },

    /**
     * Fill an Element Plus component with fake data
     * @param {Object} item - Component item with type and element
     * @param {Function} generateFakeData - Function to generate fake data
     * @returns {boolean} True if filled successfully
     */
    fill: function(item, generateFakeData) {
      const { type, el } = item;

      try {
        switch (type) {
          case 'input':
          case 'el-input':
            return fillElInput(el, generateFakeData);
          case 'el-select':
            return fillElSelect(el, generateFakeData);
          case 'el-checkbox':
            return fillElCheckbox(el);
          case 'el-radio':
            return fillElRadio(el);
          case 'el-date-picker':
            return fillElDatePicker(el, generateFakeData);
          default:
            return false;
        }
      } catch (err) {
        console.error('[ElementPlus Adapter] Fill error:', err);
        return false;
      }
    },

    /**
     * Get field context for better data generation
     * @param {Element} el - The element to analyze
     * @returns {Object} Context information
     */
    getFieldContext: function(el) {
      const context = { framework: 'element-plus' };

      // Check for label
      const formItem = el.closest('.el-form-item');
      if (formItem) {
        const label = formItem.querySelector('.el-form-item__label');
        if (label) {
          context.label = label.textContent?.trim().toLowerCase() || '';
        }
      }

      // Check placeholder
      const placeholder = el.querySelector('input[placeholder]')?.getAttribute('placeholder');
      if (placeholder) {
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

  function fillElInput(el, generateFakeData) {
    console.log('[ElementPlus Adapter] fillElInput called, el:', el?.className?.slice(0, 30), 'tag:', el?.tagName);
    // 支持直接传入 el-input 元素或者其内部的 input 元素
    let inputEl = el;

    // 如果传入的是 el-input wrapper，尝试查找内部的 input
    if (el.classList && el.classList.contains('el-input')) {
      const innerInput = el.querySelector('input, textarea');
      if (innerInput) {
        console.log('[ElementPlus Adapter] Found inner input');
        inputEl = innerInput;
      } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        // 本身就是 input 元素
      } else {
        // 没有找到内部 input，返回 false
        console.log('[ElementPlus Adapter] No input found in el-input wrapper');
        return false;
      }
    }

    if (!inputEl || inputEl.disabled || inputEl.readOnly) return false;

    const context = window.__elementPlusAdapter.getFieldContext(el);
    const ctx = context.label + ' ' + context.fieldName;

    // Use getValueByType with context for smart data generation
    let value;
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

    // Set value - 使用 inputEl
    inputEl.value = value;
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));

    return true;
  }

  function fillElSelect(el, generateFakeData) {
    // Get the select wrapper
    const select = el.classList.contains('el-select') ? el : el.closest('.el-select');
    if (!select || select.classList.contains('is-disabled')) return false;

    console.log('[ElementPlus Adapter] Processing select:', select.className.slice(0, 50));

    // Click to open dropdown
    const trigger = select.querySelector('.el-select__wrapper') || select.querySelector('.el-input__wrapper');
    if (!trigger) {
      console.log('[ElementPlus Adapter] No trigger found');
      return false;
    }

    trigger.click();

    // Wait for dropdown to appear
    return new Promise(async (resolve) => {
      await new Promise(r => setTimeout(r, 300));

      // Find dropdown menu
      const dropdown = document.querySelector('.el-select__dropdown, .el-popper.is-visible');
      if (!dropdown) {
        console.log('[ElementPlus Adapter] Dropdown not found');
        resolve(false);
        return;
      }

      // Find options
      const options = dropdown.querySelectorAll('.el-select-dropdown__item:not(.is-disabled)');
      if (options.length === 0) {
        // Try alternative selector
        const altOptions = dropdown.querySelectorAll('.el-option:not(.is-disabled)');
        if (altOptions.length === 0) {
          console.log('[ElementPlus Adapter] No options found');
          resolve(false);
          return;
        }
        const randomOption = rand(Array.from(altOptions));
        randomOption.click();
        await new Promise(r => setTimeout(r, 200));
        resolve(true);
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

      console.log('[ElementPlus Adapter] Selected option:', randomOption.textContent.trim());
      resolve(true);
    });
  }

  function fillElCheckbox(el) {
    // Click to check the checkbox
    const wrapper = el.closest('.el-checkbox') || el;
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

  function fillElRadio(el) {
    // Click to select the radio
    const wrapper = el.closest('.el-radio') || el;
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

  function fillElDatePicker(el, generateFakeData) {
    const dateEditor = el.classList.contains('el-date-editor') ? el : el.closest('.el-date-editor');
    if (!dateEditor || dateEditor.classList.contains('is-disabled')) return false;

    console.log('[ElementPlus Adapter] Processing date-picker');

    // Try to set value directly via hidden input
    const hiddenInput = dateEditor.querySelector('input[type=hidden]');
    if (hiddenInput) {
      const dateValue = getValueByType('date');
      hiddenInput.value = dateValue;
      hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
      hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    // Fallback: click and select from panel
    const trigger = dateEditor.querySelector('.el-input__wrapper') || dateEditor.querySelector('.el-date-editor__wrapper');
    if (trigger) {
      trigger.click();
      return new Promise(async (resolve) => {
        await new Promise(r => setTimeout(r, 300));

        // Find date panel
        const panel = document.querySelector('.el-date-picker__panel:not(.has-time)');
        if (panel) {
          const cells = panel.querySelectorAll('td:not(.disabled):not(.available)');
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
    window.__BengaliFakeFillAdapterAPI__.registerAdapter(window.__elementPlusAdapter);
  }

  console.log('[ElementPlus Adapter] Loaded v1.0.0');
})();
