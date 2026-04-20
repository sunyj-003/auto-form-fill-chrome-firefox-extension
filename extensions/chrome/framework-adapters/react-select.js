/**
 * React Select Framework Adapter
 * Handles react-select components
 * Integrates with BengaliFakeFill adapter interface
 */
(function() {
  // Use shared fake data module completely
  const FD = window.__BengaliFakeFillData__;
  if (!FD) {
    console.error('[ReactSelect Adapter] Shared fake data module not loaded');
    return;
  }

  // Use shared functions directly
  const { rand, randInt, getValueByType } = FD;

  // Export to window for content.js to use
  window.__reactSelectAdapter = {
    name: 'react-select',
    version: '1.0.0',

    // Supported components
    supportedComponents: [
      'react-select', '__react-select'
    ],

    /**
     * Detect React Select components in the document
     * @param {Set} seenEl - Set of already processed elements
     * @returns {Array} Array of detected components
     */
    detect: function(seenEl) {
      const items = [];

      // React Select - look for the control wrapper
      document.querySelectorAll(".react-select, [class*='react-select']").forEach(el => {
        if (seenEl.has(el)) return;

        // Skip if it's a dropdown menu or option
        if (el.classList.contains('react-select__menu') ||
            el.classList.contains('react-select__option') ||
            el.classList.contains('react-select__menu-list')) {
          return;
        }

        // Check if this is the control
        if (el.classList.contains('react-select__control')) {
          if (el.classList.contains('react-select__control--is-disabled')) return;

          seenEl.add(el);
          items.push({ type: 'react-select', el, from: 'react-select' });
        } else if (!el.querySelector('.react-select__control')) {
          // Maybe it's the parent wrapper
          const control = el.querySelector('.react-select__control');
          if (control && !seenEl.has(control)) {
            seenEl.add(control);
            items.push({ type: 'react-select', el: control, from: 'react-select' });
          }
        }
      });

      // Also check for specific class patterns from different React Select versions
      document.querySelectorAll(".css-1hwfws3").forEach(el => {
        if (seenEl.has(el)) return;
        if (el.classList.contains('css-1hwfws3')) {  // Another common class
          seenEl.add(el);
          items.push({ type: 'react-select', el, from: 'react-select' });
        }
      });

      return items;
    },

    /**
     * Fill a React Select component with fake data
     * @param {Object} item - Component item with type and element
     * @param {Function} generateFakeData - Function to generate fake data
     * @returns {boolean} True if filled successfully
     */
    fill: function(item, generateFakeData) {
      const { type, el } = item;

      try {
        switch (type) {
          case 'react-select':
            return fillReactSelect(el, generateFakeData);
          default:
            return false;
        }
      } catch (err) {
        console.error('[ReactSelect Adapter] Fill error:', err);
        return false;
      }
    },

    /**
     * Get field context for better data generation
     @param {Element} el - The element to analyze
     * @returns {Object} Context information
     */
    getFieldContext: function(el) {
      const context = { framework: 'react-select' };

      // Check for label - React Select often has a label nearby
      const container = el.closest('.react-select') || el.parentElement;
      if (container) {
        const label = container.querySelector(".react-select__label, label, [class*='label']");
        if (label) {
          context.label = label.textContent?.trim().toLowerCase() || '';
        }
      }

      // Check placeholder
      const placeholder = el.querySelector('.react-select__placeholder')?.textContent;
      if (placeholder) {
        context.placeholder = placeholder.toLowerCase();
      }

      // Check aria-label
      const ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel) {
        context.fieldName = ariaLabel.toLowerCase();
      }

      return context;
    }
  };

  // --- Helper Functions ---

  function fillReactSelect(el, generateFakeData) {
    // Get the control element
    const control = el.classList.contains('react-select__control') ? el : el.querySelector('.react-select__control');
    if (!control || control.classList.contains('react-select__control--is-disabled')) {
      console.log('[ReactSelect Adapter] Control not found or disabled');
      return false;
    }

    console.log('[ReactSelect Adapter] Processing select');

    // Click to open dropdown
    control.click();

    // Wait for dropdown to appear
    return new Promise(async (resolve) => {
      await new Promise(r => setTimeout(r, 300));

      // Find dropdown menu
      const dropdown = document.querySelector('.react-select__menu, .css-1g8a46l');  // Common class patterns
      if (!dropdown) {
        console.log('[ReactSelect Adapter] Dropdown not found');
        resolve(false);
        return;
      }

      // Find options
      const options = dropdown.querySelectorAll('.react-select__option, .react-select__menu-option, [class*="react-select__option"]:not([class*="disabled"])');
      const validOptions = Array.from(options).filter(o => {
        const style = window.getComputedStyle(o);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });

      if (validOptions.length === 0) {
        console.log('[ReactSelect Adapter] No options found');
        resolve(false);
        return;
      }

      // Randomly select an option
      const randomOption = rand(validOptions);
      randomOption.click();

      await new Promise(r => setTimeout(r, 200));

      console.log('[ReactSelect Adapter] Selected:', randomOption.textContent?.trim());
      resolve(true);
    });
  }

  if (window.__BengaliFakeFillAdapterAPI__) {
    window.__BengaliFakeFillAdapterAPI__.registerAdapter(window.__reactSelectAdapter);
  }

  console.log('[ReactSelect Adapter] Loaded v1.0.0');
})();
