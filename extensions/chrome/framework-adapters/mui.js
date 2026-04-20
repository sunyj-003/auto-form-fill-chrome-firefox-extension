/**
 * Material UI (MUI) Framework Adapter
 * Handles MuiSelect, MuiTextField, MuiCheckbox, MuiRadio, MuiDatePicker components
 * Integrates with BengaliFakeFill adapter interface
 */
(function() {
  // Use shared fake data module completely
  const FD = window.__BengaliFakeFillData__;
  if (!FD) {
    console.error('[MUI Adapter] Shared fake data module not loaded');
    return;
  }

  // Use shared functions directly
  const { rand, randInt, getValueByType } = FD;

  // Export to window for content.js to use
  window.__muiAdapter = {
    name: 'mui',
    version: '1.0.0',

    // Supported components
    supportedComponents: [
      'MuiTextField', 'MuiInput', 'MuiOutlinedInput',
      'MuiSelect', 'MuiNativeSelect',
      'MuiCheckbox', 'MuiFormControlLabel',
      'MuiRadio', 'MuiRadioGroup',
      'MuiDatePicker', 'MuiPickers'
    ],

    /**
     * Detect MUI components in the document
     * @param {Set} seenEl - Set of already processed elements
     * @returns {Array} Array of detected components
     */
    detect: function(seenEl) {
      const items = [];

      // Mui TextField / Input
      document.querySelectorAll(".MuiTextField-root, .MuiOutlinedInput-root, .MuiInput-root").forEach(el => {
        if (seenEl.has(el)) return;
        if (el.classList.contains("Mui-disabled")) return;
        seenEl.add(el);
        const input = el.querySelector("input, textarea");
        if (input) seenEl.add(input);
        items.push({ type: 'input', el, from: 'mui' });
      });

      // Mui Select
      document.querySelectorAll(".MuiSelect-root, .MuiNativeSelect-root, .MuiOutlinedInput-root.MuiSelect-root").forEach(el => {
        if (seenEl.has(el)) return;
        if (el.classList.contains("Mui-disabled")) return;
        seenEl.add(el);
        const arrow = el.querySelector(".MuiSelect-icon");
        if (arrow) seenEl.add(arrow);
        items.push({ type: 'mui-select', el, from: 'mui' });
      });

      // Mui Checkbox
      document.querySelectorAll(".MuiCheckbox-root input[type=checkbox]").forEach(el => {
        if (seenEl.has(el)) return;
        seenEl.add(el);
        items.push({ type: 'checkbox', el, from: 'mui' });
      });

      // Mui Radio
      document.querySelectorAll(".MuiRadio-root input[type=radio]").forEach(el => {
        if (seenEl.has(el)) return;
        seenEl.add(el);
        items.push({ type: 'radio', el, from: 'mui' });
      });

      // Mui DatePicker
      document.querySelectorAll(".MuiPickersDay-root").forEach(el => {
        // Skip individual day cells
      });

      // Also check for date picker inputs
      document.querySelectorAll(".MuiPickersTextField-root, .MuiPickersDateRangePicker-root").forEach(el => {
        if (seenEl.has(el)) return;
        if (el.classList.contains("Mui-disabled")) return;
        seenEl.add(el);
        const input = el.querySelector("input");
        if (input) seenEl.add(input);
        items.push({ type: 'date-picker', el, from: 'mui' });
      });

      return items;
    },

    /**
     * Fill an MUI component with fake data
     * @param {Object} item - Component item with type and element
     * @param {Function} generateFakeData - Function to generate fake data
     * @returns {boolean} True if filled successfully
     */
    fill: function(item, generateFakeData) {
      const { type, el } = item;

      try {
        switch (type) {
          case 'input':
            return fillMuiInput(el, generateFakeData);
          case 'mui-select':
            return fillMuiSelect(el, generateFakeData);
          case 'checkbox':
            return fillMuiCheckbox(el);
          case 'radio':
            return fillMuiRadio(el);
          case 'date-picker':
            return fillMuiDatePicker(el, generateFakeData);
          default:
            return false;
        }
      } catch (err) {
        console.error('[MUI Adapter] Fill error:', err);
        return false;
      }
    },

    /**
     * Get field context for better data generation
     * @param {Element} el - The element to analyze
     * @returns {Object} Context information
     */
    getFieldContext: function(el) {
      const context = { framework: 'mui' };

      // Check for label
      const formControl = el.closest('.MuiFormControl-root');
      if (formControl) {
        const label = formControl.querySelector('.MuiFormLabel, .MuiInputLabel');
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

  function fillMuiInput(el, generateFakeData) {
    // Find the actual input element
    const input = el.querySelector('input, textarea') || el;
    if (!input || input.disabled || input.readOnly) return false;

    const context = window.__muiAdapter.getFieldContext(el);
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

    // Set value
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    return true;
  }

  function fillMuiSelect(el, generateFakeData) {
    // Get the select wrapper
    const select = el.classList.contains('MuiSelect-root') ? el : el.closest('.MuiSelect-root');
    if (!select || select.classList.contains('Mui-disabled')) return false;

    console.log('[MUI Adapter] Processing select');

    // Click to open dropdown
    select.click();

    // Wait for dropdown to appear
    return new Promise(async (resolve) => {
      await new Promise(r => setTimeout(r, 300));

      // Find dropdown menu - MUI uses Popover or Modal
      const dropdown = document.querySelector(".MuiSelect-menu, .MuiPopover-paper, [class*='MuiSelect-menu']");
      if (!dropdown) {
        console.log('[MUI Adapter] Dropdown not found');
        resolve(false);
        return;
      }

      // Find options
      const options = dropdown.querySelectorAll(".MuiListItem-root:not(.Mui-disabled)");
      const validOptions = Array.from(options).filter(o => {
        const style = window.getComputedStyle(o);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });

      if (validOptions.length === 0) {
        console.log('[MUI Adapter] No options found');
        resolve(false);
        return;
      }

      // Randomly select an option
      const randomOption = rand(validOptions);
      randomOption.click();

      await new Promise(r => setTimeout(r, 200));

      console.log('[MUI Adapter] Selected:', randomOption.textContent?.trim());
      resolve(true);
    });
  }

  function fillMuiCheckbox(el) {
    // Click to check the checkbox
    const wrapper = el.closest('.MuiCheckbox-root') || el;
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

  function fillMuiRadio(el) {
    // Click to select the radio
    const wrapper = el.closest('.MuiRadio-root') || el;
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

  function fillMuiDatePicker(el, generateFakeData) {
    const picker = el.classList.contains('MuiPickersTextField-root') ? el : el.closest('.MuiPickersTextField-root');
    if (!picker || picker.classList.contains('Mui-disabled')) return false;

    console.log('[MUI Adapter] Processing date-picker');

    // Try to find the hidden input
    const hiddenInput = picker.querySelector('input[type="hidden"]');
    if (hiddenInput) {
      const dateValue = getValueByType('date');
      hiddenInput.value = dateValue;
      hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
      hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    // Fallback: click to open date picker
    const trigger = picker.querySelector('.MuiInput-input, .MuiOutlinedInput-input');
    if (trigger) {
      trigger.click();
      return new Promise(async (resolve) => {
        await new Promise(r => setTimeout(r, 300));

        // Find calendar panel
        const panel = document.querySelector('.MuiPickersDay-root');
        if (panel) {
          resolve(true);
          return;
        }
        resolve(false);
      });
    }

    return false;
  }

  if (window.__BengaliFakeFillAdapterAPI__) {
    window.__BengaliFakeFillAdapterAPI__.registerAdapter(window.__muiAdapter);
  }

  console.log('[MUI Adapter] Loaded v1.0.0');
})();
