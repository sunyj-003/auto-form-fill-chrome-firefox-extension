(() => {
  if (window.__bengaliFakeFill) return;

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

  /* --- Helpers --- */
  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  // YYYY-MM-DD for standard input[type=date]
  function fakeDateISO() {
    const start = new Date(2000, 0, 1);
    const end = new Date(2018, 11, 31);
    const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  // YYYY-MM-DD (Year-Month-Date) as requested
  function fakeDateUser() {
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

  function fakeBirthDateUser() {
    const start = new Date(1995, 0, 1);
    const end = new Date(2015, 11, 31);
    const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

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
    const clean = name.toLowerCase().replace(/[^a-z]/g, ".");
    const domains = ["mail.com", "example.com", "bdmail.com", "demo.net"];
    return (clean || "user") + randInt(10, 999) + "@" + rand(domains);
  }
  function fakeEmailForContext(ctx) {
    const name = fakeName();
    const clean = name.toLowerCase().replace(/[^a-z]/g, ".");
    const base = (clean || "user") + randInt(10, 999);
    if (/gmail/i.test(ctx)) return base + "@gmail.com";
    if (/yahoo/i.test(ctx)) return base + "@yahoo.com";
    if (/outlook|hotmail|live|msn/i.test(ctx)) return base + "@outlook.com";
    if (/icloud|apple/i.test(ctx)) return base + "@icloud.com";
    if (/proton/i.test(ctx)) return base + "@protonmail.com";
    if (/company|work|office|corp/i.test(ctx)) return base + "@company.com";
    const domains = ["mail.com", "example.com", "bdmail.com", "demo.net"];
    return base + "@" + rand(domains);
  }
  function fakeDateFormatted(format) {
    const start = new Date(2000, 0, 1);
    const end = new Date(2018, 11, 31);
    const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
    if (format === "dd/mm/yyyy") return day + "/" + m + "/" + y;
    if (format === "mm/dd/yyyy") return m + "/" + day + "/" + y;
    if (format === "dd-mm-yyyy") return day + "-" + m + "-" + y;
    if (format === "mm-dd-yyyy") return m + "-" + day + "-" + y;
    return y + "-" + m + "-" + day;
  }
  function fakeBirthDateFormatted(format) {
    const start = new Date(1995, 0, 1);
    const end = new Date(2015, 11, 31);
    const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
    if (format === "dd/mm/yyyy") return day + "/" + m + "/" + y;
    if (format === "mm/dd/yyyy") return m + "/" + day + "/" + y;
    if (format === "dd-mm-yyyy") return day + "-" + m + "-" + y;
    if (format === "mm-dd-yyyy") return m + "-" + day + "-" + y;
    return y + "-" + m + "-" + day;
  }
  function getDateFormatFromContext(ctx) {
    if (/dd\/mm|d\/m|day\/month|\.dd\.mm|dmY/i.test(ctx)) return "dd/mm/yyyy";
    if (/mm\/dd|m\/d|month\/day|\.mm\.dd|mdY/i.test(ctx)) return "mm/dd/yyyy";
    if (/dd-mm|d-m-y|dd\.mm/i.test(ctx)) return "dd-mm-yyyy";
    if (/mm-dd|m-d-y/i.test(ctx)) return "mm-dd-yyyy";
    return "yyyy-mm-dd";
  }
  function fakeNumberForContext(ctx) {
    if (/age|year.*old|years?\s*old/i.test(ctx)) return String(randInt(18, 65));
    if (/qty|quantity|amount|count|num.*item/i.test(ctx)) return String(randInt(1, 99));
    if (/year|birth\s*year|graduation/i.test(ctx)) return String(randInt(1980, 2005));
    if (/percent|%|percentage/i.test(ctx)) return String(randInt(0, 100));
    if (/price|salary|amount|tk|taka|bdt/i.test(ctx)) return String(randInt(5000, 150000));
    if (/roll|student.*id|registration/i.test(ctx)) return String(randInt(100, 99999));
    return String(randInt(1, 999));
  }
  function fakeNidForContext(ctx) {
    const n = String(randInt(1000000000, 9999999999));
    if (/dash|hyphen|xxxx-xxxx-xxxx|nid\s*format/i.test(ctx)) return n.slice(0, 4) + "-" + n.slice(4, 8) + "-" + n.slice(8);
    return n;
  }
  function fakePasswordForContext(ctx) {
    if (/pin|simple|numeric|digit/i.test(ctx)) return String(randInt(1000, 9999));
    if (/strong|complex|secure/i.test(ctx)) return "Test@" + randInt(100, 999) + "Ab!";
    return "Test@12345";
  }
  function fakeUrlForContext(ctx) {
    if (/http\s*only|no\s*https/i.test(ctx)) return "http://example.com";
    if (/www\.|with\s*www/i.test(ctx)) return "https://www.example.com";
    return "https://example.com";
  }
  function fakeCompany() { return rand(companies); }
  function fakeSentence() {
    const parts = [
      "This is sample bangla style data for testing form.",
      "Customer from Dhaka city with typical address.",
      "Order created for demo purpose only.",
      "Please ignore this fake registration information.",
      "Sample description for Bengali user profile."
    ];
    return rand(parts);
  }

  function getValueByType(fillType, ctx, opts) {
    const rulePattern = (opts && opts.rulePattern) ? String(opts.rulePattern) : '';
    const fromCustomRule = !!(opts && opts.fromCustomRule);
    const isRegexRule = !!(opts && opts.isRegexRule);
    const pf = (opts && opts.phoneFormat) || 'local';
    switch (fillType) {
      case 'name': return /first|fname|given/i.test(ctx) ? rand(firstNames) : /last|lname|sur/i.test(ctx) ? rand(lastNames) : fakeName();
      case 'email':
        if (fromCustomRule && rulePattern && !isRegexRule && /@/.test(rulePattern)) {
          const match = rulePattern.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
          if (match) return rulePattern;
          const domain = rulePattern.split('@')[1];
          if (domain) {
            const name = fakeName().toLowerCase().replace(/[^a-z]/g, ".");
            return (name || "user") + randInt(10, 999) + "@" + domain;
          }
        }
        return fakeEmailForContext(ctx);
      case 'phone':
        if (fromCustomRule && rulePattern && !isRegexRule) {
          const clean = rulePattern.replace(/[-\s]/g, '');
          if (/^(\+88)?01\d{8,9}$/.test(clean)) return rulePattern;
          const hasPlus88 = /\+88/.test(rulePattern);
          const has01 = /\b01\d{8,9}\b/.test(rulePattern);
          if (hasPlus88) return fakePhone();
          if (has01) return fakePhoneLocal();
          return fakePhone();
        }
        return pf === 'international' ? fakePhone() : fakePhoneLocal();
      case 'address': return /city|town/i.test(ctx) ? fakeCity() : /zip|post|pin/i.test(ctx) ? fakePostcode() : fakeAddress();
      case 'company': return fakeCompany();
      case 'date':
        if (fromCustomRule && rulePattern && !isRegexRule) {
          const dateMatch = /^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/.test(rulePattern);
          if (dateMatch) return rulePattern;
        }
        let df = getDateFormatFromContext(ctx);
        if (fromCustomRule && rulePattern && /[-\/]/.test(rulePattern)) {
          if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(rulePattern)) {
            const parts = rulePattern.split('/');
            if (parseInt(parts[0]) > 12) df = 'dd/mm/yyyy';
            else if (parseInt(parts[1]) > 12) df = 'mm/dd/yyyy';
          } else if (/\d{1,2}-\d{1,2}-\d{4}/.test(rulePattern)) {
            const parts = rulePattern.split('-');
            if (parseInt(parts[0]) > 12) df = 'dd-mm-yyyy';
            else if (parseInt(parts[1]) > 12) df = 'mm-dd-yyyy';
          }
        }
        return /birth|dob/i.test(ctx) ? fakeBirthDateFormatted(df) : fakeDateFormatted(df);
      case 'number':
        if (fromCustomRule && rulePattern && !isRegexRule && /^\d{1,10}$/.test(rulePattern)) {
          return rulePattern;
        }
        return fakeNumberForContext(ctx);
      case 'password':
        if (fromCustomRule && rulePattern && !isRegexRule && rulePattern.length >= 4) return rulePattern;
        return fakePasswordForContext(ctx);
      case 'url':
        if (fromCustomRule && rulePattern && !isRegexRule && /^https?:\/\//.test(rulePattern)) {
          return rulePattern;
        }
        return fakeUrlForContext(ctx);
      case 'textarea':
        if (fromCustomRule && rulePattern && !isRegexRule && rulePattern.length > 10) return rulePattern;
        return fakeSentence();
      case 'nid':
        if (fromCustomRule && rulePattern && !isRegexRule) {
          const clean = rulePattern.replace(/[-\s]/g, '');
          if (/^\d{10,13}$/.test(clean)) return rulePattern;
        }
        return fakeNidForContext(ctx);
      default: return '';
    }
  }

  function getFieldContext(el) {
    const attrs = [
      el.name, el.id, el.placeholder, (el.className && typeof el.className === 'string' ? el.className : ''),
      el.getAttribute?.('data-field') || '', el.getAttribute?.('data-testid') || '', el.getAttribute?.('data-name') || '',
      el.getAttribute?.('data-label') || '', el.getAttribute?.('formcontrolname') || '', el.getAttribute?.('name') || '',
      el.getAttribute?.('ng-reflect-name') || ''
    ].filter(Boolean).join(' ').toLowerCase();
    let label = "";
    const root = el.getRootNode?.()?.host ? el.getRootNode() : document;
    if (el.id) {
      const lbl = root.querySelector?.(`label[for="${el.id}"]`);
      if (lbl) label = lbl.textContent.toLowerCase();
    }
    if (!label && el.previousElementSibling?.tagName === "LABEL") label = el.previousElementSibling.textContent.toLowerCase();
    if (!label) {
      const parent = el.closest("div, td, th, form, fieldset");
      const lbl = parent?.querySelector("label");
      if (lbl) label = lbl.textContent.toLowerCase();
    }
    const aria = (el.getAttribute?.("aria-label") || el.getAttribute?.("aria-labelledby") || el.getAttribute?.("aria-placeholder") || "").toLowerCase();
    return (attrs + " " + label + " " + aria).trim();
  }

  /* Framework-safe: React, Vue, Angular, Next.js all pick up native input/change. */
  function setValueAndNotify(el, value) {
    try {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement?.prototype || HTMLInputElement.prototype, 'value')?.set;
      const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement?.prototype || HTMLTextAreaElement.prototype, 'value')?.set;
      const tag = (el.tagName || '').toLowerCase();
      if (tag === 'input' && nativeInputValueSetter) {
        nativeInputValueSetter.call(el, value);
      } else if (tag === 'textarea' && nativeTextareaValueSetter) {
        nativeTextareaValueSetter.call(el, value);
      } else {
        el.value = value;
      }
      el.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertText', data: value }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));
    } catch (e) { el.value = value; el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); }
  }

  // --- Input Fills (set, customRules, phoneFormat, customFiles) ---
  function guessAndFillInput(el, set, customRules, phoneFormat, customFiles) {
    if (phoneFormat === undefined) phoneFormat = 'local';
    if (el.disabled || el.type === "hidden") return;
    if (el.readOnly && !el.classList.contains("flatpickr-input")) return;
    customFiles = customFiles || {};

    const ctx = getFieldContext(el);
    if (!set) set = () => true;

    if (el.type === "checkbox") {
      if (!set("checkbox")) return;
      // Check if id, name or label contains agree/accept/terms/consent/policy/newsletter/subscribe - ALWAYS check these
      const ctxLower = ctx.toLowerCase();
      const elIdLower = (el.id || '').toLowerCase();
      const elNameLower = (el.name || '').toLowerCase();
      const hasAgreeKeyword = /agree|accept|terms|consent|policy|newsletter|subscribe/i.test(ctxLower) ||
                               /agree|accept|terms|consent|policy|newsletter|subscribe/i.test(elIdLower) ||
                               /agree|accept|terms|consent|policy|newsletter|subscribe/i.test(elNameLower);
      // Always check for agreement checkboxes, random for others
      if (hasAgreeKeyword) {
        el.click();
      } else if (!el.checked && Math.random() > 0.3) {
        el.click();
      }
      return;
    }
    if (el.type === "radio") return;
    if (el.type === "file") {
      if (!set("file")) return;
      const isImage = /image|photo|picture|avatar|logo|pic/i.test(ctx);
      const isPdf = /pdf|document|resume|cv/i.test(ctx);
      const multiple = el.hasAttribute('multiple');
      const accept = (el.getAttribute('accept') || '').toLowerCase();
      const hasImageExt = /\.(jpg|jpeg|png|gif|bmp|webp|svg)/i.test(accept);
      const hasPdfExt = /\.(pdf|doc|docx)/i.test(accept);
      const hasImage = accept.includes('image') || hasImageExt || isImage;
      const hasPdf = accept.includes('pdf') || hasPdfExt || isPdf;
      
      const dataURLtoFile = (dataurl, filename) => {
        if (!dataurl) return null;
        try {
          const arr = dataurl.split(',');
          const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while(n--) u8arr[n] = bstr.charCodeAt(n);
          return new File([u8arr], filename, {type:mime});
        } catch(e) { return null; }
      };
      
      const setFilesAndNotify = (el, files) => {
        try {
          if (!files || files.length === 0) return;
          el.files = files;
          ['input', 'change', 'blur'].forEach(ev => el.dispatchEvent(new Event(ev, { bubbles: true })));
          el.dispatchEvent(new InputEvent('input', { bubbles: true, data: '' }));
          let p = el.parentElement;
          for (let i = 0; i < 5 && p; i++) {
            p.dispatchEvent(new Event('change', { bubbles: true }));
            p = p.parentElement;
          }
        } catch(e) {}
      };
      
      try {
        const dt = new DataTransfer();
        if (hasImage) {
          if (customFiles && customFiles.image) {
            const f = dataURLtoFile(customFiles.image, customFiles.imageName || 'custom-image.png');
            if (f) dt.items.add(f);
            if (hasPdf && customFiles.pdf) {
              const pf = dataURLtoFile(customFiles.pdf, customFiles.pdfName || 'custom-doc.pdf');
              if (pf) dt.items.add(pf);
            }
            if (multiple && dt.items.length < 2 && customFiles.image) {
              const f2 = dataURLtoFile(customFiles.image, 'custom-image-2.png');
              if (f2) dt.items.add(f2);
            }
            setFilesAndNotify(el, dt.files);
          } else {
            const TINY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
            const f = dataURLtoFile(TINY_PNG, 'demo-image.png');
            if (f) dt.items.add(f);
            if (hasPdf) {
              const pdfBlob = new Blob(['%PDF-1.4\n%Demo'], { type: 'application/pdf' });
              dt.items.add(new File([pdfBlob], 'demo-doc.pdf', { type: 'application/pdf' }));
            }
            if (multiple) { const f2 = dataURLtoFile(TINY_PNG, 'demo-image-2.png'); if (f2) dt.items.add(f2); }
            setFilesAndNotify(el, dt.files);
          }
        } else if (hasPdf) {
          if (customFiles && customFiles.pdf) {
            const f = dataURLtoFile(customFiles.pdf, customFiles.pdfName || 'custom-doc.pdf');
            if (f) dt.items.add(f);
            if (multiple && customFiles.doc) {
              const df = dataURLtoFile(customFiles.doc, customFiles.docName || 'custom-doc.docx');
              if (df) dt.items.add(df);
            } else if (multiple && customFiles.pdf) {
              const f2 = dataURLtoFile(customFiles.pdf, 'custom-doc-2.pdf');
              if (f2) dt.items.add(f2);
            }
          } else {
            const blob = new Blob(['%PDF-1.4\n%Demo PDF'], { type: 'application/pdf' });
            dt.items.add(new File([blob], 'demo-doc.pdf', { type: 'application/pdf' }));
            if (multiple) dt.items.add(new File([new Blob(['%PDF-1.4\n%Demo 2'], { type: 'application/pdf' })], 'demo-doc-2.pdf', { type: 'application/pdf' }));
          }
          setFilesAndNotify(el, dt.files);
        } else {
          const blob = new Blob(['Demo file content'], { type: 'text/plain' });
          dt.items.add(new File([blob], 'demo.txt', { type: 'text/plain' }));
          if (multiple) dt.items.add(new File([new Blob(['Demo file 2'], { type: 'text/plain' })], 'demo-2.txt', { type: 'text/plain' }));
          setFilesAndNotify(el, dt.files);
        }
      } catch(e) { console.error('File upload error:', e); }
      return;
    }

    let value = "";
    const rules = customRules || [];
    for (const rule of rules) {
      let match = false;
      const pat = (rule.pattern || '').replace(/[-\s]/g, '');
      const isPhoneNumber = /^(\+88)?01\d{8,9}$/.test(pat);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rule.pattern || '');
      const isDate = /^\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}$/.test(rule.pattern || '');
      const isNID = /^\d{10,13}$/.test(pat);
      const isURL = /^https?:\/\//.test(rule.pattern || '');
      const isNumber = /^\d{1,10}$/.test(pat) && !isPhoneNumber && !isNID;
      
      if (isPhoneNumber && rule.fillType === 'phone') {
        match = el.type === 'tel' || /phone|mobile|contact|cell|tel/i.test(ctx);
      } else if (isEmail && rule.fillType === 'email') {
        match = el.type === 'email' || /e?-?mail/i.test(ctx);
      } else if (isDate && rule.fillType === 'date') {
        match = el.type === 'date' || /date|birth|dob/i.test(ctx);
      } else if (isNID && rule.fillType === 'nid') {
        match = /national.*id|nid|passport/i.test(ctx);
      } else if (isURL && rule.fillType === 'url') {
        match = /url|website|link/i.test(ctx);
      } else if (isNumber && rule.fillType === 'number') {
        match = el.type === 'number' || /age|qty|quantity|amount|count|num/i.test(ctx);
      } else if (rule.regex === true) {
        try { match = new RegExp(rule.pattern, 'i').test(ctx); } catch (e) {}
      } else {
        match = ctx.toLowerCase().includes((rule.pattern || '').toLowerCase());
      }
      if (match) {
        if (rule.fillType === 'skip') return;
        if (set(rule.fillType)) value = getValueByType(rule.fillType, ctx, { fromCustomRule: true, rulePattern: rule.pattern, isRegexRule: rule.regex, phoneFormat: phoneFormat });
        break;
      }
    }

    if (!value) {
    if (el.type === "date") {
      if (!set("date")) return;
      if (/birth|dob|b\.?d/i.test(ctx)) value = fakeBirthDateISO();
      else if (/admission|join|enroll/i.test(ctx)) {
        const d = new Date();
        value = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      } else value = fakeDateISO();
    } else if (el.type === "datetime-local") {
      if (!set("date")) return;
      value = new Date().toISOString().slice(0, 16);
    } else if (el.type === "time") {
      if (!set("date")) return;
      value = "09:00";
    } else if (el.type === "month") {
      if (!set("date")) return;
      value = new Date().toISOString().slice(0, 7);
    } else if (el.type === "week") {
      if (!set("date")) return;
      value = new Date().getFullYear() + "-W01";
    } else if (/birth|dob|b\.?d/i.test(ctx) && /date/i.test(ctx)) {
      if (!set("date")) return;
      value = fakeBirthDateFormatted(getDateFormatFromContext(ctx));
    } else if (/date/i.test(ctx)) {
      if (!set("date")) return;
      if (/admission|join|enroll/i.test(ctx)) {
        const d = new Date();
        value = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      } else {
        value = fakeDateFormatted(getDateFormatFromContext(ctx));
      }
    } else if (/roll|student.*num|registration.*num/i.test(ctx)) {
      if (set("number")) value = fakeNumberForContext(ctx);
    } else if (el.type === "email" || /e?-?mail/i.test(ctx)) {
      if (!set("email")) return;
      value = fakeEmailForContext(ctx);
    } else if (el.type === "tel" || /phone|mobile|contact|cell|tel/i.test(ctx)) {
      if (!set("phone")) return;
      value = phoneFormat === 'international' ? fakePhone() : fakePhoneLocal();
    } else if (/first.*name|given.*name|fname/i.test(ctx)) {
      if (!set("name")) return;
      value = rand(firstNames);
    } else if (/middle.*name|mname/i.test(ctx)) {
      if (set("name")) value = rand(firstNames);
    } else if (/last.*name|sur.*name|family.*name|lname/i.test(ctx)) {
      if (set("name")) value = rand(lastNames);
    } else if (/full.*name|complete.*name|student.*name|person.*name/i.test(ctx) || /^\s*name\s*$/i.test(ctx)) {
      if (set("name")) value = fakeName();
    } else if (/user.*name|username|login/i.test(ctx)) {
      if (set("name")) value = fakeName().toLowerCase().replace(/\s+/g, "");
    } else if (/father|parent|guardian/i.test(ctx) && /name/i.test(ctx)) {
      if (set("name")) value = fakeName();
    } else if (/mother/i.test(ctx) && /name/i.test(ctx)) {
      if (set("name")) value = rand(firstNames) + " " + rand(lastNames);
    } else if (/company|organization|employer|institute|school/i.test(ctx)) {
      if (!set("company")) return;
      value = fakeCompany();
    } else if (/address|street|location|residence/i.test(ctx)) {
      if (!set("address")) return;
      value = fakeAddress();
    } else if (/city|town|municipality/i.test(ctx)) {
      if (set("address")) value = fakeCity();
    } else if (/zip|post.*code|pin/i.test(ctx)) {
      if (set("address")) value = fakePostcode();
    } else if (/country|nation(?!al)/i.test(ctx)) {
      if (set("address")) value = "Bangladesh";
    } else if (/district|state|division|region/i.test(ctx)) {
      if (set("address")) value = "Dhaka";
    } else if (/national.*id|nid|passport/i.test(ctx)) {
      if (!set("nid")) return;
      value = fakeNidForContext(ctx);
    } else if (el.type === "number" || /age|year.*old|qty|quantity|amount|count/i.test(ctx)) {
      if (set("number")) value = fakeNumberForContext(ctx);
    } else if (/password|passwd|pwd/i.test(ctx) || el.type === "password") {
      if (!set("password")) return;
      value = fakePasswordForContext(ctx);
    } else if (/desc|about|note|comment|remark|detail/i.test(ctx)) {
      if (!set("textarea")) return;
      value = fakeSentence();
    } else if (/url|website|link/i.test(ctx)) {
      if (!set("url")) return;
      value = fakeUrlForContext(ctx);
    } else if (el.type === "text" || el.type === "search" || !el.type) {
      if (!el.value && set("name")) value = fakeName();
    }
    }

    if (value) {
      try {
        const oldValue = el.value;
        setValueAndNotify(el, value);
        if (el.validity && !el.validity.valid) { setValueAndNotify(el, oldValue); return; }
        if (el.classList.contains("flatpickr-input") && el._flatpickr) {
          try { el._flatpickr.setDate(value, true); } catch (e) { }
        }
      } catch (e) { }
    }
  }

  function fillRadiosByGroup() {
    const groups = {};
    document.querySelectorAll("input[type=radio]").forEach(r => {
      if (r.disabled) return;
      const name = r.name || ("__no_group__" + Math.random());
      (groups[name] ||= []).push(r);
    });
    Object.values(groups).forEach(list => {
      if (!list.length) return;
      const choice = rand(list);
      choice.checked = true;
      choice.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      choice.dispatchEvent(new Event("input", { bubbles: true }));
      choice.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  function fillSelect2() {
    if (!window.jQuery || !window.jQuery.fn.select2) return;
    try {
      window.jQuery("select.select2, .select2-hidden-accessible").each(function () {
        const $sel = window.jQuery(this);
        if ($sel.prop("disabled") || $sel.prop("readonly")) return;
        if ($sel.val() && $sel.val() !== "" && $sel.val() !== "0") return;
        const allOpts = $sel.find("option:not([disabled])");
        const opts = allOpts.filter(function () {
          const txt = window.jQuery(this).text().trim();
          const val = window.jQuery(this).val();
          return val && !/^(select|choose|pick|--|none|null)$/i.test(txt);
        });
        const choice = opts.length > 0 ? opts.eq(Math.floor(Math.random() * opts.length)) : null;
        if (choice) $sel.val(choice.val()).trigger("change").trigger("change.select2");
      });
    } catch (e) { }
  }

  /* --- Aggressive Timeout Helper --- */
  const withTimeout = (promise, ms = 1500) => new Promise(resolve => {
    const t = setTimeout(() => resolve("timeout"), ms);
    promise.then(res => { clearTimeout(t); resolve(res); })
      .catch(() => { clearTimeout(t); resolve("error"); });
  });

  function smoothScrollTo(element) {
    if (!element) return;
    try {
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    } catch (e) {
      try { element.scrollIntoView(); } catch (e2) { }
    }
  }

  /* --- Async Dropdown Processing --- */
  async function processSequentialVueSelect(input) {
    if (input.disabled || input.readOnly) return;

    const antSel = input.closest(".ant-select");
    if (antSel && !antSel.classList.contains("ant-select-disabled")) {
      const selector = antSel.querySelector(".ant-select-selector");
      if (selector) {
        return new Promise(resolve => {
          selector.click();
          const tryPick = (attempt = 0) => {
            if (attempt > 12) { resolve(); return; }
            const items = document.querySelectorAll(".ant-select-dropdown .ant-select-item:not(.ant-select-item-disabled)");
            const vis = Array.from(items).filter(o => o.getBoundingClientRect().height > 0);
            if (vis.length > 0) { rand(vis).click(); setTimeout(resolve, 80); return; }
            setTimeout(() => tryPick(attempt + 1), 120);
          };
          setTimeout(() => tryPick(0), 150);
        });
      }
    }

    const reactSel = input.closest(".react-select");
    if (reactSel) {
      const control = reactSel.querySelector(".react-select__control");
      if (control) {
        return new Promise(resolve => {
          control.click();
          const tryPick = (attempt = 0) => {
            if (attempt > 12) { resolve(); return; }
            const opts = document.querySelectorAll(".react-select__menu .react-select__option:not([class*='disabled'])");
            const vis = Array.from(opts).filter(o => o.getBoundingClientRect().height > 0);
            if (vis.length > 0) { rand(vis).click(); setTimeout(resolve, 80); return; }
            setTimeout(() => tryPick(attempt + 1), 120);
          };
          setTimeout(() => tryPick(0), 150);
        });
      }
    }

    // Element Plus el-select support
    const elSelect = input.closest(".el-select");
    if (elSelect && !elSelect.classList.contains("is-disabled")) {
      const wrapper = elSelect.querySelector(".el-input__wrapper");
      if (wrapper) {
        return new Promise(resolve => {
          wrapper.click();
          const tryPick = (attempt = 0) => {
            if (attempt > 12) { resolve(); return; }
            // Element Plus uses .el-select-dropdown with .el-popper
            const dropdown = document.querySelector(".el-select-dropdown.el-popper:not(.is-hidden)");
            if (!dropdown) { setTimeout(() => tryPick(attempt + 1), 120); return; }
            const items = dropdown.querySelectorAll(".el-select-dropdown__item:not(.is-disabled)");
            const vis = Array.from(items).filter(o => {
              const r = o.getBoundingClientRect();
              return r.width > 2 && r.height > 2 && window.getComputedStyle(o).display !== 'none';
            });
            if (vis.length > 0) {
              rand(vis).click();
              setTimeout(resolve, 80);
              return;
            }
            setTimeout(() => tryPick(attempt + 1), 120);
          };
          setTimeout(() => tryPick(0), 150);
        });
      }
    }

    // Naive UI n-select support
    // n-select 容器包含 n-base-selection 子元素
    // input 本身可能就是 n-base-selection 元素
    let nSelect = input.closest(".n-select, .n-base-selection");
    // 如果 input 本身就是 n-select/n-base-selection，直接使用
    if (!nSelect && (input.classList.contains("n-select") || input.classList.contains("n-base-selection"))) {
      nSelect = input;
    }
    if (nSelect && !nSelect.classList.contains("n-base-selection--disabled")) {
      // 找到触发点击的元素 - 扩展选择器以覆盖更多情况
      const trigger = nSelect.querySelector(".n-base-selection__border, .n-base-selection__suffix, .n-base-selection__arrow, .n-base-selection-label, .n-base-selection__value, .n-base-selection-trigger");
      const clickTarget = trigger || nSelect;
      if (clickTarget && clickTarget !== input && clickTarget.click) {
        return new Promise(resolve => {
          // 点击打开下拉菜单
          clickTarget.click();
          // 等待下拉菜单动画
          const tryPick = (attempt = 0) => {
            if (attempt > 15) { console.log('Naive UI: 超时未找到下拉菜单'); resolve(); return; }
            // Naive UI 下拉菜单使用 v-binder-follower-content 容器
            const dropdown = document.querySelector(".v-binder-follower-content");
            if (!dropdown) {
              setTimeout(() => tryPick(attempt + 1), 150);
              return;
            }
            // 检查下拉菜单是否可见
            const style = window.getComputedStyle(dropdown);
            if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) {
              setTimeout(() => tryPick(attempt + 1), 150);
              return;
            }
            // 查找选项 - Naive UI 使用 n-base-select-option
            const items = dropdown.querySelectorAll(".n-base-select-option, .n-select-option, .n-option");
            const vis = Array.from(items).filter(o => {
              const r = o.getBoundingClientRect();
              const oStyle = window.getComputedStyle(o);
              return r.width > 2 && r.height > 2 && oStyle.display !== 'none' && oStyle.visibility !== 'hidden' && parseFloat(oStyle.opacity) > 0;
            });
            if (vis.length > 0) {
              // 随机选择一个选项
              const idx = Math.floor(Math.random() * vis.length);
              vis[idx].scrollIntoView({ block: "nearest" });
              vis[idx].click();
              setTimeout(resolve, 80);
              return;
            }
            setTimeout(() => tryPick(attempt + 1), 150);
          };
          setTimeout(() => tryPick(0), 300);
        });
      }
    }

    let vselect = input.closest(".v-select, .vue-select, div[class*='select']");
    let toggle = input.closest(".vs__dropdown-toggle");

    if (!vselect && toggle) vselect = toggle.parentElement;
    if (vselect && !toggle) toggle = vselect.querySelector(".vs__dropdown-toggle");

    // Fallback logic
    if (!vselect) vselect = input.parentElement;

    const triggers = [];
    if (vselect) {
      const arrow = vselect.querySelector(".vs__open-indicator, .vs__actions");
      if (arrow) triggers.push(arrow);
    }
    if (toggle) triggers.push(toggle);
    triggers.push(input);

    if (vselect && vselect.classList.contains("vs--disabled")) return;

    const listboxId = input.getAttribute("aria-controls") || (toggle && toggle.getAttribute("aria-owns"));
    const parent = vselect ? vselect.parentElement : input.parentElement;
    let ctx = (input.placeholder || "").toLowerCase();
    const label = parent ? (parent.querySelector("label")?.textContent || "") : "";
    if (label) ctx += " " + label.toLowerCase();

    if (vselect && vselect.previousElementSibling && vselect.previousElementSibling.textContent.length < 50) {
      ctx += " " + vselect.previousElementSibling.textContent.toLowerCase();
    }

    return new Promise(resolve => {
      let attempts = 0;

      const performOpen = () => {
        let isOpen = (toggle && toggle.getAttribute("aria-expanded") === "true");
        if (isOpen) return true;
        for (const t of triggers) {
          t.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
          t.click();
          t.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
        }
        return false;
      };

      const tryPick = () => {
        if (attempts > 12) { resolve(); return; }

        performOpen();
        attempts++;

        setTimeout(() => {
          let listbox = null;
          if (listboxId) listbox = document.getElementById(listboxId);
          if (!listbox && vselect) listbox = vselect.querySelector("ul[role=listbox]");

          if (!listbox) {
            const candidates = document.querySelectorAll("ul[role=listbox], .vs__dropdown-menu, .select2-results__options, .ant-select-dropdown, .react-select__menu, .MuiPopover-root [role=listbox], .mat-select-panel");
            listbox = Array.from(candidates).find(el => {
              const r = el.getBoundingClientRect();
              return r.width > 5 && r.height > 5 && window.getComputedStyle(el).display !== 'none';
            });
          }

          if (listbox) {
            const options = Array.from(listbox.querySelectorAll("li, .vs__dropdown-option, .select2-results__option, .ant-select-item, .react-select__option, .MuiListItem-root, .mat-option, [role=option]"))
              .filter(o => {
                const t = o.textContent.trim().toLowerCase();
                return t && !o.classList.contains("disabled") && o.getAttribute("aria-disabled") !== "true" && !t.includes("loading");
              });

            if (options.length > 0) {
              let pick = null;
              const valid = options.filter(o => !/select|choose/i.test(o.textContent?.trim() || ''));
              const pool = valid.length > 0 ? valid : options;
              if (/gender|sex/i.test(ctx)) {
                const sub = options.filter(o => /male|female/i.test(o.textContent));
                pick = sub.length > 0 ? rand(sub) : rand(pool);
              } else if (/blood/i.test(ctx)) {
                const sub = options.filter(o => /[ABO][+-]/i.test(o.textContent));
                pick = sub.length > 0 ? rand(sub) : rand(pool);
              } else if (/shift/i.test(ctx)) {
                const sub = options.filter(o => /morning|day|evening|night/i.test(o.textContent));
                pick = sub.length > 0 ? rand(sub) : rand(pool);
              } else {
                pick = rand(pool);
              }

              if (pick) {
                pick.scrollIntoView({ block: "nearest" });
                pick.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
                pick.click();
                pick.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
                setTimeout(resolve, 50);
                return;
              }
            }
          }
          setTimeout(tryPick, 150);
        }, 100);
      };
      tryPick();
    });
  }

  async function processCustomDropdown(wrapper) {
    // 查看是否有现有实现
    console.log('processCustomDropdown called for:', wrapper.className?.slice(0, 30));
  }

  // Naive UI 选择器专用处理函数 - 简单直接
  async function processNaiveUISelect(el) {
    console.log('Naive UI select 处理:', el.className?.slice(0, 30));
    try {
      // 1. 点击打开下拉菜单
      el.click();
      await new Promise(r => setTimeout(r, 300));

      // 2. 查找下拉菜单
      let dropdown = document.querySelector(".v-binder-follower-content");
      if (!dropdown) {
        dropdown = document.querySelector(".n-base-select-menu, .n-select-menu, [class*='select-menu']");
      }

      if (!dropdown) {
        console.log('Naive UI: 未找到下拉菜单');
        return;
      }

      // 检查可见性
      const style = window.getComputedStyle(dropdown);
      if (style.display === 'none' || style.visibility === 'hidden') {
        console.log('Naive UI: 下拉菜单不可见');
        return;
      }

      // 3. 查找选项
      const options = dropdown.querySelectorAll(".n-base-select-option, .n-select-option, .n-option");
      const validOptions = Array.from(options).filter(o => {
        const oStyle = window.getComputedStyle(o);
        return oStyle.display !== 'none' && oStyle.visibility !== 'hidden' && !o.classList.contains('disabled');
      });

      if (validOptions.length > 0) {
        // 4. 随机选择一项
        const randomOption = validOptions[Math.floor(Math.random() * validOptions.length)];
        randomOption.scrollIntoView({ block: "nearest" });
        randomOption.click();
        await new Promise(r => setTimeout(r, 200));
        console.log('Naive UI: 已选择选项');
      } else {
        console.log('Naive UI: 没有有效选项');
      }
    } catch (e) {
      console.error('Naive UI 选择器错误:', e);
    }
  }

  // Element Plus el-date-picker support - use direct input value setting
  async function processElementPlusDatePicker(input) {
    if (input.disabled || input.readOnly) return;

    const picker = input.closest(".el-date-editor");
    if (picker && !picker.classList.contains("is-disabled")) {
      // Try to find hidden input that stores the date value
      const hiddenInput = picker.querySelector("input[type=hidden]");
      if (hiddenInput) {
        const dateValue = fakeDateUser();
        hiddenInput.value = dateValue;
        hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }

      // Fallback: try to click and select from panel
      let wrapper = picker.querySelector(".el-input__wrapper");
      if (!wrapper) wrapper = picker.querySelector(".el-date-editor__wrapper");
      if (wrapper) {
        wrapper.click();
        await new Promise(r => setTimeout(r, 300));

        // Look for any popper that's not a select dropdown
        const allPoppers = document.querySelectorAll('.el-popper:not(.is-hidden)');
        let panel = null;
        for (const p of allPoppers) {
          if (!p.classList.contains('el-select__popper')) {
            panel = p;
            break;
          }
        }
        if (panel) {
          let cells = panel.querySelectorAll("td:not(.disabled)");
          const validCells = Array.from(cells).filter(o => {
            const r = o.getBoundingClientRect();
            return r.width > 5 && r.height > 5;
          });
          if (validCells.length > 0) {
            rand(validCells).click();
          }
        }
      }
    }
  }

  /* --- Collect from document + Shadow DOM (Vue, Angular, Web Components) --- */
  async function collectFromRoot(root, list) {
    if (!root || list.seen.has(root)) return;
    list.seen.add(root);

    // 获取当前激活的 Naive UI 弹窗/抽屉（只在 document 级别执行）
    const getActiveNaivePopup = () => {
      // n-modal: 检查 visible 的 modal
      const modals = document.querySelectorAll('.n-modal, .n-dialog');
      for (const modal of modals) {
        const showAttr = modal.getAttribute('show') || modal.getAttribute('v-show:show') || modal.getAttribute('v-if');
        const style = window.getComputedStyle(modal);
        if (showAttr !== 'false' && showAttr !== 'null' && style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0) {
          return modal;
        }
      }
      // n-drawer: 检查 visible 的 drawer
      const drawers = document.querySelectorAll('.n-drawer');
      for (const drawer of drawers) {
        const showAttr = drawer.getAttribute('show') || drawer.getAttribute('v-show:show') || drawer.getAttribute('v-if');
        const style = window.getComputedStyle(drawer);
        if (showAttr !== 'false' && showAttr !== 'null' && style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0) {
          return drawer;
        }
      }
      // n-popover
      const popovers = document.querySelectorAll('.n-popover');
      for (const popover of popovers) {
        const style = window.getComputedStyle(popover);
        if (style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0) {
          return popover;
        }
      }
      // n-card (有时用作弹窗)
      const cards = document.querySelectorAll('.n-card[data-model]');
      for (const card of cards) {
        const style = window.getComputedStyle(card);
        if (style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0) {
          return card;
        }
      }
      return null;
    };

    // 存储当前激活的弹窗，用于过滤元素
    const activePopup = root === document ? getActiveNaivePopup() : null;
    const isElementInActivePopup = (el) => {
      if (!activePopup) return true; // 无激活弹窗时不过滤
      return activePopup.contains(el);
    };

    const q = (sel) => Array.from((root.querySelectorAll || root.querySelector)?.call(root, sel) || []);
    q("input").forEach(el => {
      if (list.seenEl.has(el) || !isElementInActivePopup(el)) return;
      list.seenEl.add(el);
      if (el.type === 'file') { list.items.push({ type: 'input', el }); return; }
      const ph = (el.placeholder || "").toLowerCase();
      if (el.classList.contains("flatpickr-input")) list.items.push({ type: 'input', el });
      else if (ph.includes("select") || el.classList.contains("vs__search") || /vs__search|react-select|ant-select/i.test(el.className)) list.items.push({ type: 'vue-select', el });
      else list.items.push({ type: 'input', el });
    });
    q("textarea").forEach(el => { if (!list.seenEl.has(el) && isElementInActivePopup(el)) { list.seenEl.add(el); list.items.push({ type: 'textarea', el }); } });
    q("select").forEach(el => { if (!list.seenEl.has(el) && isElementInActivePopup(el)) { list.seenEl.add(el); list.items.push({ type: 'select', el }); } });
    q("[contenteditable=true]").forEach(el => { if (!list.seenEl.has(el) && isElementInActivePopup(el)) { list.seenEl.add(el); list.items.push({ type: 'contenteditable', el }); } });
    q("input.vs__search, input[type=search][class*='vs__search'], input[class*='react-select'], .ant-select-selection-search-input").forEach(el => {
      if (!list.seenEl.has(el) && isElementInActivePopup(el)) { list.seenEl.add(el); list.items.push({ type: 'vue-select', el }); }
    });
    q('[role="combobox"]').forEach(el => {
      if (list.seenEl.has(el) || !isElementInActivePopup(el)) return;
      list.seenEl.add(el);
      const hasInput = el.querySelector("input");
      if (hasInput && !list.seenEl.has(hasInput)) { list.seenEl.add(hasInput); list.items.push({ type: 'vue-select', el: hasInput }); }
      else { const btn = el.querySelector("button, [role=button]"); if (btn) list.items.push({ type: 'custom-dropdown', el: el }); }
    });
    // Element Plus specific selectors - wait for Vue to render
    await new Promise(r => setTimeout(r, 300));
    const elSelects = Array.from(document.querySelectorAll(".el-select"));
    elSelects.forEach(el => {
      if (list.seenEl.has(el)) return;
      list.seenEl.add(el);
      let wrapper = el.querySelector(".el-input__wrapper");
      if (!wrapper) wrapper = el.querySelector(".el-select__wrapper");
      if (wrapper && !list.seenEl.has(wrapper)) {
        list.seenEl.add(wrapper);
        list.items.push({ type: 'vue-select', el: wrapper, from: 'el-select' });
      } else {
        const input = el.querySelector("input");
        if (input) {
          list.items.push({ type: 'vue-select', el: input, from: 'el-select-input' });
        }
      }
    });

    // Naive UI selectors - 直接使用 document.querySelectorAll 因为 n-select 可能不在 root 内
    const nSelects = Array.from(document.querySelectorAll(".n-select, .n-base-selection"));
    nSelects.forEach(el => {
      if (list.seenEl.has(el)) return;
      list.seenEl.add(el);
      // n-select 内部有 n-base-selection 子元素
      const baseSel = el.querySelector(".n-base-selection");
      if (baseSel && !list.seenEl.has(baseSel)) {
        list.seenEl.add(baseSel);
        list.items.push({ type: 'vue-select', el: baseSel, from: 'naive-ui' });
      } else if (!baseSel) {
        // n-select 本身可能就是选择器
        list.items.push({ type: 'vue-select', el: el, from: 'naive-ui' });
      }
    });

    const elDateEditors = Array.from(document.querySelectorAll(".el-date-editor"));
    elDateEditors.forEach(el => {
      if (list.seenEl.has(el)) return;
      list.seenEl.add(el);
      let wrapper = el.querySelector(".el-input__wrapper");
      if (!wrapper) wrapper = el.querySelector(".el-date-editor__wrapper");
      if (wrapper && !list.seenEl.has(wrapper)) {
        list.seenEl.add(wrapper);
        list.items.push({ type: 'el-date-picker', el: wrapper });
      }
    });
    // Element Plus checkbox
    q(".el-checkbox").forEach(el => {
      if (list.seenEl.has(el)) return;
      const input = el.querySelector("input[type=checkbox]");
      if (input && !list.seenEl.has(input)) {
        list.seenEl.add(el);
        list.seenEl.add(input);
        list.items.push({ type: 'el-checkbox', el: input });
      }
    });

    // Ant Design Vue input wrappers (a-input renders as .ant-input-wrapper)
    await new Promise(r => setTimeout(r, 300));
    q(".ant-input, .ant-input-password, .ant-input-number, .ant-input-textarea").forEach(el => {
      if (list.seenEl.has(el)) return;
      list.seenEl.add(el);
      list.items.push({ type: 'input', el });
    });
    // Ant Design Vue select - pass wrapper to processSequentialVueSelect
    q(".ant-select").forEach(el => {
      if (list.seenEl.has(el)) return;
      const selector = el.querySelector(".ant-select-selector");
      if (selector && !list.seenEl.has(selector)) {
        list.seenEl.add(el);
        list.seenEl.add(selector);
        list.items.push({ type: 'vue-select', el: selector, from: 'antd-select' });
      }
    });
    // Ant Design Vue checkbox
    q(".ant-checkbox-input").forEach(el => {
      if (list.seenEl.has(el)) return;
      list.seenEl.add(el);
      list.items.push({ type: 'el-checkbox', el });
    });

    // Naive UI components support
    // n-input (text, password, textarea)
    q(".n-input, .n-input__textarea-el").forEach(el => {
      if (list.seenEl.has(el)) return;
      list.seenEl.add(el);
      list.items.push({ type: 'input', el });
    });
    // n-select dropdown - 简化版本直接找到能点击的元素
    const nSelectAll = document.querySelectorAll(".n-base-selection, .n-select, [class*='n-base-selection'], [class*='n-select']");
    nSelectAll.forEach(el => {
      if (list.seenEl.has(el)) return;
      // 检查是否禁用
      if (el.classList.contains("n-base-selection--disabled") || el.classList.contains("disabled")) return;
      // 找到触发区域
      const trigger = el.querySelector(".n-base-selection-trigger, .n-base-selection__border, .n-base-selection__value, .n-base-selection-label, [class*='n-base-selection-trigger']") || el;
      if (trigger && typeof trigger.click === 'function') {
        list.seenEl.add(el);
        list.items.push({ type: 'naive-select', el: trigger, from: 'naive-ui' });
      }
    });
    // n-checkbox
    q(".n-checkbox-box, .n-checkbox input[type=checkbox]").forEach(el => {
      if (list.seenEl.has(el)) return;
      list.seenEl.add(el);
      list.items.push({ type: 'el-checkbox', el });
    });
    // n-radio
    q(".n-radio input[type=radio]").forEach(el => {
      if (list.seenEl.has(el) || !isElementInActivePopup(el)) return;
      list.seenEl.add(el);
      list.items.push({ type: 'el-checkbox', el }); // 同 checkbox 处理方式
    });

    // Vite 开发服务器 HMR 识别
    q("[data-v-], [v-]").forEach(el => {
      // Vite Vue 组件中的 input/select/textarea
      if (!isElementInActivePopup(el)) return;
    });

    q(".dropdown, .custom-select, .ant-select, .el-select, .el-date-editor, .react-select__control, .react-select, .MuiSelect-select, mat-select").forEach(el => {
      if (list.seenEl.has(el) || !isElementInActivePopup(el)) return;
      const input = el.querySelector("input:not([type=hidden])");
      if (input && !list.seenEl.has(input)) { list.seenEl.add(input); list.seenEl.add(el); list.items.push({ type: el.classList.contains("el-date-editor") ? 'el-date-picker' : 'vue-select', el: input }); }
      else { const btn = el.querySelector("button, [role=button], .ant-select-selector, .react-select__control, .react-select__value-container"); if (btn) { list.seenEl.add(el); list.items.push({ type: 'custom-dropdown', el: el }); } }
    });
    // Naive UI 自定义 dropdown (n-base-selection 内部没有 input 的情况)
    q(".n-base-selection:not(:has(.n-base-selection-input))").forEach(el => {
      if (list.seenEl.has(el) || !isElementInActivePopup(el)) return;
      list.seenEl.add(el);
      list.items.push({ type: 'custom-dropdown', el: el, from: 'naive-ui' });
    });
    try { q("*").forEach(el => { if (el.shadowRoot) collectFromRoot(el.shadowRoot, list); }); } catch (err) {}
  }

  /* --- Main Execution --- */
  let autoFillObserver = null;
  let autoFillState = { _io: null, _fillTimeout: null, _ioCleanup: null, _isFilling: false }; // 独立状态对象
  let lastUrl = location.href;
  let filledElements = new WeakSet();

  // 清理自动填充监听器
  function cleanupAutoFill() {
    // 清理监听器，但不清空 filledElements（保留已填充记录避免重复填充）
    if (autoFillState._io) {
      autoFillState._io.disconnect();
      autoFillState._io = null;
    }
    if (autoFillState._fillTimeout) {
      clearTimeout(autoFillState._fillTimeout);
      autoFillState._fillTimeout = null;
    }
    if (autoFillState._ioCleanup) {
      document.removeEventListener('click', autoFillState._ioCleanup, true);
      autoFillState._ioCleanup = null;
    }
    if (autoFillObserver) {
      autoFillObserver.disconnect();
      autoFillObserver = null;
    }
    window.removeEventListener('popstate', handleNavigation);
    // 恢复原始的 history 方法
    if (window.__originalPushState) {
      history.pushState = window.__originalPushState;
      window.__originalPushState = null;
    }
    if (window.__originalReplaceState) {
      history.replaceState = window.__originalReplaceState;
      window.__originalReplaceState = null;
    }
  }

  // 处理页面导航
  function handleNavigation() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(() => {
        window.__bengaliFakeFill && window.__bengaliFakeFill();
      }, 500);
    }
  }

  // 启动持续自动填充
  function startAutoFill(data) {
    const autoFillEnabled = data.autoFillEnabled;
    if (!autoFillEnabled) {
      cleanupAutoFill();
      return;
    }

    // 如果已有监听器，先清理再重新设置
    cleanupAutoFill();

    // 监听 popstate（浏览器导航）
    window.addEventListener('popstate', handleNavigation);

    // 拦截 history.pushState 和 replaceState（SPA 导航）
    window.__originalPushState = history.pushState;
    window.__originalReplaceState = history.replaceState;
    history.pushState = function(...args) {
      window.__originalPushState.apply(this, args);
      setTimeout(() => handleNavigation(), 500);
    };
    history.replaceState = function(...args) {
      window.__originalReplaceState.apply(this, args);
      setTimeout(() => handleNavigation(), 500);
    };

    // 使用 IntersectionObserver 检测表单容器是否进入视口
    // 这比 MutationObserver 更高效，且不会受 Vue 内部更新影响
    // 注意：当容器持续可见时会持续触发，需要结合 filledElements 检查
    const formContainers = document.querySelectorAll('form, .form-section, .form-container, [role="form"], .step-content');
    if (formContainers.length > 0) {
      const io = new IntersectionObserver((entries) => {
        // 如果正在填充，跳过
        if (autoFillState._isFilling) return;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
            // 检查页面是否有未填充的表单元素
            const allForms = document.querySelectorAll('input:not([type=hidden]):not([type=file]), select, textarea');
            let hasUnfilled = false;
            for (const form of allForms) {
              const style = form.ownerDocument.defaultView.getComputedStyle(form);
              if (style && style.display !== 'none' && style.visibility !== 'hidden' && !filledElements.has(form)) {
                hasUnfilled = true;
                break;
              }
            }
            // 只有存在未填充元素时才触发
            if (!hasUnfilled) return;
            // 容器变得可见，延迟填充
            clearTimeout(autoFillState._fillTimeout);
            autoFillState._fillTimeout = setTimeout(() => {
              autoFillState._isFilling = true;
              window.__bengaliFakeFill && window.__bengaliFakeFill();
              setTimeout(() => { autoFillState._isFilling = false; }, 2000);
            }, 800);
            break;
          }
        }
      }, { threshold: [0.1] });

      formContainers.forEach(container => io.observe(container));
      autoFillState._io = io;
    }

    // 也监听常见的"下一步"按钮点击事件
    const nextBtnClickHandler = function(e) {
      // 如果正在填充，跳过
      if (autoFillState._isFilling) return;
      const text = e.target.textContent?.toLowerCase() || '';
      const id = e.target.id?.toLowerCase() || '';
      const nextBtn = text.includes('下一步') || text.includes('next') ||
                      text.includes('继续') || text.includes('continue') ||
                      id.includes('next');
      if (nextBtn) {
        clearTimeout(autoFillState._fillTimeout);
        autoFillState._fillTimeout = setTimeout(() => {
          autoFillState._isFilling = true;
          window.__bengaliFakeFill && window.__bengaliFakeFill();
          setTimeout(() => { autoFillState._isFilling = false; }, 2000);
        }, 1000);
      }
    };
    document.addEventListener('click', nextBtnClickHandler, true);
    autoFillState._ioCleanup = nextBtnClickHandler;
  }

  window.__bengaliFakeFill = async function () {
    // 窗口区分: 只处理焦点所在的窗口
    if (document.hidden || !document.hasFocus()) {
      console.log('[BengaliFakeFill] 窗口未聚焦，跳过填充');
      return;
    }

    const r = await new Promise(res => {
      chrome.storage.sync.get(["formSettings", "customRules", "phoneFormat", "autoFillEnabled"], (data) => {
        res(data);
      });
    });
    const s = r.formSettings && typeof r.formSettings === 'object' ? r.formSettings : {};
    const phoneFormat = r.phoneFormat || s.phoneFormat || 'local';
    const set = (k) => s[k] !== false;
    let raw = r.customRules;
    const customRules = Array.isArray(raw) ? raw.filter(rule => rule && String(rule.pattern || '').trim() && rule.fillType).map(rule => ({
      pattern: String(rule.pattern).trim(),
      fillType: rule.fillType,
      regex: rule.regex === true
    })) : [];


    const list = { items: [], seen: new Set(), seenEl: new Set() };
    await collectFromRoot(document, list);
    const allElements = list.items;

    // Filter out already filled elements
    const newElements = allElements.filter(item => !filledElements.has(item.el));

    // Sort visible order
    newElements.sort((a, b) => {
      const rectA = a.el.getBoundingClientRect();
      const rectB = b.el.getBoundingClientRect();
      const topDiff = (rectA.top + window.scrollY) - (rectB.top + window.scrollY);
      if (Math.abs(topDiff) > 10) return topDiff;
      return rectA.left - rectB.left;
    });

    // Unique
    const uniqueElements = [];
    const seen = new Set();
    for (const item of newElements) {
      if (!seen.has(item.el)) { seen.add(item.el); uniqueElements.push(item); }
    }

    // Load custom files right before use so settings changes take effect
    const customFilesData = await new Promise(res => {
      chrome.storage.local.get(["customFiles"], (data) => {
        const cf = data.customFiles;
        if (!cf || typeof cf !== 'object') { res({}); return; }
        const out = {};
        if (typeof cf.image === 'string' && cf.image.startsWith('data:')) { out.image = cf.image; out.imageName = cf.imageName; }
        if (typeof cf.pdf === 'string' && cf.pdf.startsWith('data:')) { out.pdf = cf.pdf; out.pdfName = cf.pdfName; }
        if (typeof cf.doc === 'string' && cf.doc.startsWith('data:')) { out.doc = cf.doc; out.docName = cf.docName; }
        res(out);
      });
    });

    // Process Loop
    for (const item of uniqueElements) {
      const { type, el } = item;

      // Allow Element Plus inputs (they may have offsetParent === null)
      const inElementPlus = el.classList.contains('el-input__wrapper') ||
                            el.classList.contains('el-textarea__inner') ||
                            el.classList.contains('el-checkbox__input') ||
                            el.classList.contains('el-select__wrapper') ||
                            el.classList.contains('el-date-editor');
      // Check if element is visible - also allow display:none for dynamic forms
      const style = el.style;
      const computedStyle = el.ownerDocument?.defaultView?.getComputedStyle(el);
      const isHidden = (el.offsetParent === null && !inElementPlus) ||
                       (computedStyle && computedStyle.display === 'none');
      if (isHidden && type !== 'vue-select' && el.type !== 'file' && !inElementPlus) continue;
      if ((el.disabled || el.readOnly) && !el.classList.contains("flatpickr-input") && type !== 'vue-select') continue;

      smoothScrollTo(el);

      const originalShadow = el.style.boxShadow;
      const originalTrans = el.style.transition;
      el.style.transition = "box-shadow 0.2s ease";
      el.style.boxShadow = "0 0 8px 2px rgba(33, 150, 243, 0.5)";

      try {
        if (type === 'naive-select') {
          // Naive UI 选择器直接处理
          if (set("select")) await withTimeout(processNaiveUISelect(el), 2000);
        } else if (type === 'vue-select') {
          if (set("select")) await withTimeout(processSequentialVueSelect(el), 2000);
        } else if (type === 'custom-dropdown') {
          if (set("select")) await withTimeout(processCustomDropdown(el), 1200);
        } else if (type === 'el-date-picker') {
          if (set("date")) await withTimeout(processElementPlusDatePicker(el), 1500);
        } else if (type === 'el-checkbox') {
          if (set("checkbox")) {
            // Element Plus checkbox - use comprehensive approach
            const wrapper = el.closest('.el-checkbox');

            // Step 1: Try clicking the input directly
            el.click();
            await new Promise(r => setTimeout(r, 20));

            // Step 2: If not checked, try clicking the wrapper
            if (!el.checked && wrapper) {
              wrapper.click();
              await new Promise(r => setTimeout(r, 20));
            }

            // Step 3: Force check via property and events
            if (!el.checked) {
              el.checked = true;
              el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
              el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
            }

            // Step 4: Vue 3 internal API as last resort
            try {
              const vueApp = document.querySelector('#elementPlusApp');
              if (vueApp && vueApp.__vue_app__) {
                const formData = vueApp.__vue_app__._instance.proxy.form;
                if ('agree' in formData) formData.agree = true;
              }
            } catch (e) {}

            // Step 5: Final verification with multiple attempts
            for (let i = 0; i < 5; i++) {
              if (el.checked) {
                try {
                  const vueApp = document.querySelector('#elementPlusApp');
                  if (vueApp && vueApp.__vue_app__) {
                    const formData = vueApp.__vue_app__._instance.proxy.form;
                    if ('agree' in formData) formData.agree = true;
                  }
                } catch (e) {}
                break;
              }
              el.checked = true;
              el.dispatchEvent(new Event('change', { bubbles: true }));
              await new Promise(r => setTimeout(r, 30));
            }

            await new Promise(r => setTimeout(r, 100));
          }
        } else if (type === 'input') {
          guessAndFillInput(el, set, customRules, phoneFormat, customFilesData);
          if (el.type === 'file') await new Promise(r => setTimeout(r, 150));
          else await new Promise(r => setTimeout(r, 60));
        } else if (type === 'textarea') {
          if (set("textarea")) setValueAndNotify(el, fakeSentence());
          await new Promise(r => setTimeout(r, 60));
        } else if (type === 'select') {
          const sel = el;
          if (set("select") && !sel.disabled) {
            const ctx = getFieldContext(sel).toLowerCase();
            const allOpts = Array.from(sel.options).filter(o => !o.disabled && o.value && !/select|choose/i.test(o.textContent));
            const opts = allOpts.length ? allOpts : Array.from(sel.options).slice(1);

            if (opts.length) {
              let choice;
              if (/bangladesh/i.test(ctx)) { const sub = opts.filter(o => /bangladesh/i.test(o.textContent)); choice = sub.length > 0 ? rand(sub) : rand(opts); }
              else if (/dhaka/i.test(ctx)) { const sub = opts.filter(o => /dhaka/i.test(o.textContent)); choice = sub.length > 0 ? rand(sub) : rand(opts); }
              else choice = rand(opts);

              if (sel.multiple) {
                Array.from(sel.options).forEach(o => o.selected = false);
                choice.selected = true;
              } else {
                sel.value = choice.value;
                sel.selectedIndex = Array.from(sel.options).indexOf(choice);
              }
              sel.dispatchEvent(new Event("input", { bubbles: true }));
              sel.dispatchEvent(new Event("change", { bubbles: true }));
              if (window.jQuery) { try { window.jQuery(sel).trigger('change'); } catch (e) { } }
            }
          }
          await new Promise(r => setTimeout(r, 60));
        } else if (type === 'contenteditable') {
          if (set("textarea")) {
            el.textContent = fakeSentence();
            el.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
      } catch (e) { console.error(e); }

      // Restore
      setTimeout(() => {
        el.style.boxShadow = originalShadow;
        el.style.transition = originalTrans;
      }, 300);

      // Mark element as filled
      filledElements.add(el);
    }

    // 启动持续自动填充（如果设置中启用）
    const autoFillEnabled = r.autoFillEnabled;
    if (autoFillEnabled) {
      startAutoFill(r);
    } else {
      cleanupAutoFill();
    }

    if (set("radio")) fillRadiosByGroup();
    if (set("select")) fillSelect2();
  };

  /* --- Keyboard Shortcut: Ctrl + Shift + V + V (controlled by storage) --- */
  let shortcutEnabled = true;
  let lastVPress = 0;

  function updateShortcut(enabled) {
    shortcutEnabled = enabled !== false;
  }
  chrome.storage.sync.get('shortcutEnabled', (r) => updateShortcut(r.shortcutEnabled));

  // 监听设置变化
  chrome.storage.sync.get('autoFillEnabled', (r) => {
    if (r.autoFillEnabled) {
      startAutoFill(r);
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      if (changes.shortcutEnabled) updateShortcut(changes.shortcutEnabled.newValue);
      if (changes.autoFillEnabled) {
        if (changes.autoFillEnabled.newValue) {
          startAutoFill({ autoFillEnabled: true });
        } else {
          cleanupAutoFill();
        }
      }
    }
  });

  window.addEventListener("keydown", (e) => {
    if (!shortcutEnabled) return;
    if ((e.key === "v" || e.key === "V") && (e.ctrlKey || e.metaKey) && e.shiftKey) {
      const now = Date.now();
      if (now - lastVPress < 500) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.__bengaliFakeFill === "function") window.__bengaliFakeFill();
        lastVPress = 0;
      } else lastVPress = now;
    }
  });

})();
