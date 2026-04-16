/**
 * Naive UI Framework Adapter
 * Handles n-input, n-select, n-checkbox, n-radio, n-date-picker components
 */
(function() {
  // Fake data generators (same as content.js)
  const firstNames = [
    "Rahim", "Karim", "Jamal", "Kamal", "Shamim", "Rafiq", "Nazmul", "Faruk", "Imran", "Sajid",
    "Ayesha", "Sharmin", "Shamima", "Farhana", "Nusrat", "Jannat", "Mahi", "Runa", "Salma", "Rashida"
  ];
  const lastNames = [
    "Uddin", "Ahmed", "Islam", "Hossain", "Rahman", "Chowdhury", "Miah", "Sarkar", "Talukder", "Biswas"
  ];
  const streets = [
    "Mirpur Road", "Dhanmondi 27", "Banani 11", "Gulshan 2", "Uttara Sector 4",
    "Chawk Bazar", "Agrabad", "Kumarpara", "Zindabazar", "New Market Road"
  ];
  const cities = ["Dhaka", "Chattogram", "Sylhet", "Khulna", "Rajshahi", "Barishal", "Rangpur", "Mymensingh"];
  const companies = [
    "Dhaka Soft Ltd", "Bangla Tech Solutions", "Padma Group", "Jamdani IT", "Sundarban Logistics"
  ];

  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function fakeName() { return rand(firstNames) + " " + rand(lastNames); }
  function fakeAddress() { return randInt(10, 999) + " " + rand(streets) + ", " + rand(cities); }
  function fakeCity() { return rand(cities); }
  function fakePostcode() { return String(randInt(1200, 9999)); }
  function fakePhone() {
    const ops = ["13", "14", "15", "16", "17", "18", "19"];
    const op = rand(ops);
    let rest = "";
    for (let i = 0; i < 8; i++) rest += randInt(0, 9);
    return "+8801" + op + rest.substring(0, 8);
  }
  function fakePhoneLocal() {
    const ops = ["13", "14", "15", "16", "17", "18", "19"];
    const op = rand(ops);
    let rest = "";
    for (let i = 0; i < 8; i++) rest += randInt(0, 9);
    return "01" + op + rest.substring(0, 8);
  }
  function fakeEmail(name) {
    const clean = (name || "user").toLowerCase().replace(/[^a-z]/g, ".");
    const domains = ["mail.com", "example.com", "bdmail.com", "demo.net"];
    return clean + randInt(10, 999) + "@" + rand(domains);
  }

  function fakeDateISO() {
    const start = new Date(2000, 0, 1);
    const end = new Date(2018, 11, 31);
    const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function fakeBirthDateISO() {
    const start = new Date(1995, 0, 1);
    const end = new Date(2015, 11, 31);
    const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function fakePassword() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars[randInt(0, chars.length - 1)];
    }
    return password;
  }

  function fakeURL() {
    const domains = ["example.com", "demo.com", "test.org", "site.net"];
    const paths = ["", "/page", "/home", "/about", "/contact"];
    return "https://" + rand(domains) + rand(paths);
  }

  // Generate fake data based on type
  function generateFakeData(type) {
    switch (type) {
      case 'name': return fakeName();
      case 'email': return fakeEmail();
      case 'phone': return fakePhone();
      case 'phone-local': return fakePhoneLocal();
      case 'address': return fakeAddress();
      case 'city': return fakeCity();
      case 'company': return rand(companies);
      case 'date': return fakeDateISO();
      case 'birthDate': return fakeBirthDateISO();
      case 'password': return fakePassword();
      case 'url': return fakeURL();
      case 'text': return fakeName(); // default
      default: return fakeName();
    }
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
    let value;

    // Generate appropriate fake data based on context
    if (/name|first.*name|full.*name/i.test(context.label + context.fieldName)) {
      value = generateFakeData('name');
    } else if (/email/i.test(context.label + context.fieldName)) {
      value = generateFakeData('email');
    } else if (/phone|mobile|tel/i.test(context.label + context.fieldName)) {
      value = generateFakeData('phone');
    } else if (/address/i.test(context.label + context.fieldName)) {
      value = generateFakeData('address');
    } else if (/city/i.test(context.label + context.fieldName)) {
      value = generateFakeData('city');
    } else if (/company|organization/i.test(context.label + context.fieldName)) {
      value = generateFakeData('company');
    } else if (/password/i.test(context.label + context.fieldName)) {
      value = generateFakeData('password');
    } else if (/url|website/i.test(context.label + context.fieldName)) {
      value = generateFakeData('url');
    } else {
      value = generateFakeData('text');
    }

    // Set value and dispatch events
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    // Visual feedback
    input.classList.add('bengali-fake-filled');
    setTimeout(() => input.classList.remove('bengali-fake-filled'), 1000);

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
        trigger.classList.add('bengali-fake-filled');
        setTimeout(() => trigger.classList.remove('bengali-fake-filled'), 1000);
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
    el.classList.add('bengali-fake-filled');
    setTimeout(() => el.classList.remove('bengali-fake-filled'), 1000);

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
      el.classList.add('bengali-fake-filled');
      setTimeout(() => el.classList.remove('bengali-fake-filled'), 1000);
      return true;
    }

    const radioGroup = document.querySelectorAll(`input[type="radio"][name="${name}"]`);
    const validRadios = Array.from(radioGroup).filter(r => !r.disabled);

    if (validRadios.length > 0) {
      const randomRadio = validRadios[Math.floor(Math.random() * validRadios.length)];
      if (!randomRadio.checked) {
        randomRadio.click();
      }
      randomRadio.classList.add('bengali-fake-filled');
      setTimeout(() => randomRadio.classList.remove('bengali-fake-filled'), 1000);
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
        dateInput.value = dateValue;
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Click outside to close
      document.body.click();
    }, 100);

    // Visual feedback
    trigger.classList.add('bengali-fake-filled');
    setTimeout(() => trigger.classList.remove('bengali-fake-filled'), 1000);

    return true;
  }

  console.log('[NaiveUI Adapter] Loaded v1.0.0');
})();