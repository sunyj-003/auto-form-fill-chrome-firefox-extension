/**
 * Naive UI Framework Adapter
 * Handles n-input, n-select, n-checkbox, n-radio, n-date-picker components
 */
(function() {
  const helpers = window.__BengaliAdapterHelpers__;
  const fakeData = helpers.getFakeDataApi();

  function generateFakeData(type, contextText = '') {
    if (type === 'birthDate' && typeof fakeData.fakeBirthDateISO === 'function') {
      return fakeData.fakeBirthDateISO();
    }
    if (typeof fakeData.getValueByType === 'function') {
      return fakeData.getValueByType(type === 'text' ? 'name' : type, contextText, {});
    }
    return helpers.getValueForContext(contextText, type);
  }
  // Export to window for content.js to use
  window.__naiveUIAdapter = {
    name: 'naive-ui',
    version: '1.0.0',

    // Supported components
    supportedComponents: [
      'n-input', 'n-input__textarea-el',
      'n-select', 'n-base-selection',
      'n-checkbox-box', 'n-checkbox',
      'n-radio',
      'n-date-picker', 'n-time-picker'
    ],

    /**
     * Detect Naive UI components in the document
     * @param {Set} seenEl - Set of already processed elements
     * @returns {Array} Array of detected components
     */
    detect: function(seenEl) {
      const items = [];

      // n-input (text, password, textarea)
      document.querySelectorAll(".n-input, .n-input__textarea-el").forEach(el => {
        if (seenEl.has(el)) return;
        seenEl.add(el);
        items.push({ type: 'input', el, from: 'naive-ui' });
      });

      // n-select / n-base-selection
      document.querySelectorAll(".n-select, .n-base-selection").forEach(el => {
        if (seenEl.has(el)) return;
        seenEl.add(el);
        // Check if disabled
        if (el.classList.contains("n-base-selection--disabled")) return;
        items.push({ type: 'naive-select', el, from: 'naive-ui' });
      });

      // n-checkbox
      document.querySelectorAll(".n-checkbox-box, .n-checkbox input[type=checkbox]").forEach(el => {
        if (seenEl.has(el)) return;
        seenEl.add(el);
        items.push({ type: 'naive-checkbox', el, from: 'naive-ui' });
      });

      // n-radio
      document.querySelectorAll(".n-radio input[type=radio]").forEach(el => {
        if (seenEl.has(el)) return;
        seenEl.add(el);
        items.push({ type: 'naive-radio', el, from: 'naive-ui' });
      });

      // n-date-picker / n-time-picker
      document.querySelectorAll(".n-date-picker, .n-time-picker, .n-picker").forEach(el => {
        if (seenEl.has(el)) return;
        seenEl.add(el);
        if (el.classList.contains("n-base-selection--disabled")) return;
        items.push({ type: 'naive-date-picker', el, from: 'naive-ui' });
      });

      return items;
    },

    /**
     * Fill a Naive UI component with fake data
     * @param {Object} item - Component item with type and element
     * @param {Function} generateFakeData - Function to generate fake data
     * @returns {boolean} True if filled successfully
     */
    fill: function(item, generateFakeData) {
      const { type, el } = item;

      try {
        switch (type) {
          case 'input':
            return fillNaiveInput(el, generateFakeData);
          case 'naive-select':
            return fillNaiveSelect(el, generateFakeData);
          case 'naive-checkbox':
            return fillNaiveCheckbox(el);
          case 'naive-radio':
            return fillNaiveRadio(el);
          case 'naive-date-picker':
            return fillNaiveDatePicker(el, generateFakeData);
          default:
            return false;
        }
      } catch (err) {
        console.error('[NaiveUI Adapter] Fill error:', err);
        return false;
      }
    },

    /**
     * Get field context for better data generation
     * @param {Element} el - The element to analyze
     * @returns {Object} Context information
     */
    getFieldContext: function(el) {
      const context = { framework: 'naive-ui' };

      // Check for label
      const label = el.closest('.n-form-item')?.querySelector('.n-form-item-label-text');
      if (label) {
        context.label = label.textContent?.trim().toLowerCase() || '';
      }

      // Check placeholder
      const placeholder = el.querySelector('input[placeholder]')?.getAttribute('placeholder') ||
                         el.querySelector('.n-base-selection-input')?.getAttribute('placeholder');
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

  function fillNaiveInput(el, generateFakeData) {
    // Find the actual input element within n-input wrapper
    const input = el.querySelector('input, textarea');
    if (!input) return false;

    const context = window.__naiveUIAdapter.getFieldContext(el);
    const value = helpers.getValueForContext(context.label + ' ' + context.fieldName, 'text');

    // Set value and dispatch events
    helpers.setInputLikeValue(input, value);

    // Visual feedback
    helpers.highlightElement(input);

    return true;
  }

  function fillNaiveSelect(el, generateFakeData) {
    // Find the trigger element (clickable part)
    const trigger = el.querySelector('.n-base-selection, .n-select') || el;
    if (trigger.classList.contains("n-base-selection--disabled")) return false;

    const context = window.__naiveUIAdapter.getFieldContext(el);

    // Determine what kind of selection to make
    let selectionType = 'random';
    if (/country|nation/i.test(context.label + context.fieldName)) {
      selectionType = 'country';
    } else if (/city|division|state|province|region/i.test(context.label + context.fieldName)) {
      selectionType = 'city';
    } else if (/gender|sex/i.test(context.label + context.fieldName)) {
      selectionType = 'gender';
    }

    // Click to open dropdown
    trigger.click();

    // Wait for dropdown to appear
    setTimeout(() => {
      // Find dropdown
      const dropdown = document.querySelector('.n-base-select-menu, .n-select-menu, [class*="select-menu"]');
      if (!dropdown) return;

      // Find options
      const options = dropdown.querySelectorAll('.n-base-select-option, .n-select-option, .n-option');
      const validOptions = Array.from(options).filter(o => {
        const style = window.getComputedStyle(o);
        return style.display !== 'none' && style.visibility !== 'hidden' && !o.classList.contains('disabled');
      });

      if (validOptions.length === 0) return;

      // Select appropriate option
      let selectedIndex;
      if (selectionType === 'country') {
        // Find Bangladesh option
        const bdOption = validOptions.find(o => /bangladesh/i.test(o.textContent));
        selectedIndex = bdOption ? validOptions.indexOf(bdOption) : Math.floor(Math.random() * validOptions.length);
      } else if (selectionType === 'city') {
        // Bangladesh cities
        const cities = ['Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi', 'Barishal', 'Rangpur', 'Mymensingh'];
        const cityOption = validOptions.find(o => cities.some(c => o.textContent.includes(c)));
        selectedIndex = cityOption ? validOptions.indexOf(cityOption) : Math.floor(Math.random() * validOptions.length);
      } else if (selectionType === 'gender') {
        // Find male/female option
        const genderOption = validOptions.find(o => /male|female|other/i.test(o.textContent));
        selectedIndex = genderOption ? validOptions.indexOf(genderOption) : Math.floor(Math.random() * validOptions.length);
      } else {
        selectedIndex = Math.floor(Math.random() * validOptions.length);
      }

      // Click the selected option
      const selectedOption = validOptions[selectedIndex];
      if (selectedOption) {
        selectedOption.click();

        // Visual feedback
        helpers.highlightElement(trigger);
      }
    }, 100);

    return true;
  }

  function fillNaiveCheckbox(el) {
    // Find the checkbox input or the box element
    const checkbox = el.tagName === 'INPUT' ? el : el.querySelector('input[type="checkbox"]');
    if (!checkbox) return false;

    // Randomly check or uncheck (80% chance to check)
    const shouldCheck = Math.random() < 0.8;

    if (shouldCheck !== checkbox.checked) {
      checkbox.click();
    }

    // Visual feedback
    helpers.highlightElement(el);

    return true;
  }

  function fillNaiveRadio(el) {
    // Find all radio buttons in the same group
    const name = el.getAttribute('name');
    if (!name) {
      // No group, just check this one
      if (!el.checked) {
        el.click();
      }
      helpers.highlightElement(el);
      return true;
    }

    const radioGroup = document.querySelectorAll(`input[type="radio"][name="${name}"]`);
    const validRadios = Array.from(radioGroup).filter(r => !r.disabled);

    if (validRadios.length > 0) {
      const randomRadio = validRadios[Math.floor(Math.random() * validRadios.length)];
      if (!randomRadio.checked) {
        randomRadio.click();
      }
      helpers.highlightElement(randomRadio);
    }

    return true;
  }

  function fillNaiveDatePicker(el, generateFakeData) {
    // Find the trigger/input element
    const trigger = el.querySelector('.n-base-selection') || el;
    if (trigger.classList.contains("n-base-selection--disabled")) return false;

    const context = window.__naiveUIAdapter.getFieldContext(el);
    let dateValue;

    // Determine date type
    if (/birth|dob|birthday/i.test(context.label + context.fieldName)) {
      dateValue = generateFakeData('birthDate');
    } else {
      dateValue = generateFakeData('date');
    }

    // Click to open date picker
    trigger.click();

    setTimeout(() => {
      // Try to find date input and set value
      const dateInput = document.querySelector('.n-date-panel-date-input, input[type="text"]');
      if (dateInput) {
        helpers.setInputLikeValue(dateInput, dateValue);
      }

      // Click outside to close
      document.body.click();
    }, 100);

    // Visual feedback
    helpers.highlightElement(trigger);

    return true;
  }

  if (window.__BengaliFakeFillAdapterAPI__) {
    window.__BengaliFakeFillAdapterAPI__.registerAdapter(window.__naiveUIAdapter);
  }

  console.log('[NaiveUI Adapter] Loaded v1.0.0');
})();
