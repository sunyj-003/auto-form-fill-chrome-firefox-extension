(function () {
  // Field filling logic - handles text inputs, checkboxes, file uploads, date fields
  // M4.21: Sensitive field skip rules applied here
  function guessAndFillInput(el, set, customRules, phoneFormat, customFiles) {
    if (phoneFormat === undefined) phoneFormat = 'local';
    if (el.disabled || el.type === "hidden") return;
    if (el.readOnly && !el.classList.contains("flatpickr-input")) return;
    customFiles = customFiles || {};

    const ctx = window.__BengaliContext__.getFieldContext(el);
    if (!set) set = () => true;

    // M4.21: Check sensitive fields - skip password confirmation, credit cards, CVV, SSN, etc.
    const fieldDetection = window.__BengaliFieldDetection__;
    if (fieldDetection?.isSensitiveField) {
      const sensitive = fieldDetection.isSensitiveField(ctx, { id: el.id, name: el.name });
      if (sensitive.skip) {
        console.log('[BengaliFakeFill] Skipping sensitive field:', sensitive.reason);
        return;
      }
    }

    // Checkbox handling
    if (el.type === "checkbox") {
      if (!set("checkbox")) return;
      const ctxLower = ctx.toLowerCase();
      const elIdLower = (el.id || '').toLowerCase();
      const elNameLower = (el.name || '').toLowerCase();
      const hasAgreeKeyword = /agree|accept|terms|consent|policy|newsletter|subscribe/i.test(ctxLower) ||
                           /agree|accept|terms|consent|policy|newsletter|subscribe/i.test(elIdLower) ||
                           /agree|accept|terms|consent|policy|newsletter|subscribe/i.test(elNameLower);
      if (hasAgreeKeyword) {
        el.click();
      } else if (!el.checked && Math.random() > 0.3) {
        el.click();
      }
      return;
    }

    // Radio is handled separately
    if (el.type === "radio") return;

    // File upload handling
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
          while (n--) u8arr[n] = bstr.charCodeAt(n);
          return new File([u8arr], filename, { type: mime });
        } catch (e) { return null; }
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
        } catch (e) { }
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
      } catch (e) { console.error('File upload error:', e); }
      return;
    }

    // Get fake data module
    const FD = window.__BengaliFakeFillData__;
    const { rand, firstNames, lastNames, fakeName, fakeAddress, fakeCity, fakePostcode, fakePhone, fakePhoneLocal,
            fakeEmail, fakeEmailForContext, fakeDateISO, fakeDateUser, fakeBirthDateISO, fakeBirthDateUser,
            fakeDateFormatted, fakeBirthDateFormatted, getDateFormatFromContext,
            fakeNumberForContext, fakeNidForContext, fakePasswordForContext, fakeUrlForContext,
            fakeCompany, fakeSentence, getValueByType } = FD;

    let value = "";
    const rules = customRules || [];

    // Apply custom rules first
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
        try { match = new RegExp(rule.pattern, 'i').test(ctx); } catch (e) { }
      } else {
        match = ctx.toLowerCase().includes((rule.pattern || '').toLowerCase());
      }
      if (match) {
        if (rule.fillType === 'skip') return;
        value = getValueByType(rule.fillType, ctx, { fromCustomRule: true, rulePattern: rule.pattern, isRegexRule: rule.regex, phoneFormat: phoneFormat });
        break;
      }
    }

    // Generate value based on field context
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
        } else value = fakeDateFormatted(getDateFormatFromContext(ctx));
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

    // Set the value
    if (value) {
      try {
        const { setValueAndNotify } = window.__BengaliEvents__;
        const oldValue = el.value;
        setValueAndNotify(el, value);
        if (el.validity && !el.validity.valid) { setValueAndNotify(el, oldValue); return; }
        if (el.classList.contains("flatpickr-input") && el._flatpickr) {
          try { el._flatpickr.setDate(value, true); } catch (e) { }
        }
      } catch (e) { }
    }
  }

  // Native select handling
  function fillNativeSelect(el, set) {
    if (!set("select") || el.disabled) return;
    const ctx = window.__BengaliContext__.getFieldContext(el).toLowerCase();
    const allOpts = Array.from(el.options).filter(o => !o.disabled && o.value && !/select|choose/i.test(o.textContent));
    const opts = allOpts.length ? allOpts : Array.from(el.options).slice(1);

    if (!opts.length) return;

    let choice;
    if (/bangladesh/i.test(ctx)) {
      const sub = opts.filter(o => /bangladesh/i.test(o.textContent));
      choice = sub.length > 0 ? sub[Math.floor(Math.random() * sub.length)] : opts[Math.floor(Math.random() * opts.length)];
    } else if (/dhaka/i.test(ctx)) {
      const sub = opts.filter(o => /dhaka/i.test(o.textContent));
      choice = sub.length > 0 ? sub[Math.floor(Math.random() * sub.length)] : opts[Math.floor(Math.random() * opts.length)];
    } else {
      choice = opts[Math.floor(Math.random() * opts.length)];
    }

    if (el.multiple) {
      Array.from(el.options).forEach(o => o.selected = false);
      choice.selected = true;
    } else {
      el.value = choice.value;
      el.selectedIndex = Array.from(el.options).indexOf(choice);
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    if (window.jQuery) { try { window.jQuery(el).trigger('change'); } catch (e) { } }
  }

  const api = {
    guessAndFillInput,
    fillNativeSelect,
  };

  if (typeof window !== 'undefined') {
    window.__BengaliFill__ = api;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();