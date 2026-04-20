(function () {
  function getEventsApi() {
    return window.__BengaliEvents__ || {};
  }

  function detectInputConstraint(el) {
    const contextApi = window.__BengaliContext__;
    const descriptor = contextApi?.getFieldDescriptor ? contextApi.getFieldDescriptor(el) : {
      context: contextApi?.getFieldContext?.(el) || '',
      machineHints: {},
      label: '',
      containerText: '',
    };
    const hints = descriptor.machineHints || {};
    const inputMode = hints.inputMode || '';
    const pattern = hints.pattern || '';
    const type = (el.type || '').toLowerCase();

    if (type === 'number' || inputMode === 'numeric' || inputMode === 'decimal' || /\\d|\[0-9\]/.test(pattern)) {
      return { kind: 'numeric', source: 'machine-hint', descriptor };
    }
    if (type === 'date' || type === 'datetime-local' || type === 'time' || type === 'month' || type === 'week') {
      return { kind: 'date', source: 'machine-hint', format: type, descriptor };
    }
    if (['email', 'tel', 'url', 'password'].includes(type)) {
      return { kind: 'text', source: 'machine-hint', descriptor };
    }

    if (type && !['text', 'search'].includes(type)) {
      return { kind: 'unknown', source: 'unsupported-type', descriptor };
    }

    const { setValueAndNotify } = getEventsApi();
    if (!setValueAndNotify || typeof el.value !== 'string') {
      return { kind: 'text', source: 'no-probe-api', descriptor };
    }

    const originalValue = el.value;
    const probeSamples = {
      numeric: '123456',
      decimal: '36.5',
      composite: '120/80',
      text: 'ProbeText',
      yearMonth: '2024-01',
      fullDate: '2024-01-02',
    };

    const applyProbe = (sample) => {
      try {
        setValueAndNotify(el, sample);
        return String(el.value || '').trim();
      } catch (error) {
        return '';
      }
    };

    const numericResult = applyProbe(probeSamples.numeric);
    const decimalResult = applyProbe(probeSamples.decimal);
    const compositeResult = applyProbe(probeSamples.composite);
    const textResult = applyProbe(probeSamples.text);
    const yearMonthResult = applyProbe(probeSamples.yearMonth);
    const fullDateResult = applyProbe(probeSamples.fullDate);

    setValueAndNotify(el, originalValue);

    const digitsKept = numericResult.replace(/\D/g, '').length >= 3;
    const decimalAccepted = /^\d+\.\d+$/.test(decimalResult);
    const compositeAccepted = /^\d+\s*\/\s*\d+$/.test(compositeResult);
    const textKept = /[a-z]/i.test(textResult);
    const fullDateAccepted = /^\d{4}([-/]?)\d{2}\1\d{2}$/.test(fullDateResult) || /^\d{8}$/.test(fullDateResult);
    const yearMonthAccepted = /^\d{4}([-/]?)\d{2}$/.test(yearMonthResult) || /^\d{6}$/.test(yearMonthResult);
    const dateKeepsStructure = /[-/]/.test(fullDateResult) || /[-/]/.test(yearMonthResult);

    if ((fullDateAccepted || yearMonthAccepted) && dateKeepsStructure && !textKept) {
      return {
        kind: 'date',
        source: 'runtime-probe',
        format: fullDateAccepted ? fullDateResult : yearMonthResult,
        descriptor,
      };
    }

    if (digitsKept && !textKept) {
      return {
        kind: 'numeric',
        source: 'runtime-probe',
        mode: compositeAccepted ? 'composite' : (decimalAccepted ? 'decimal' : 'integer'),
        descriptor,
      };
    }

    return { kind: 'text', source: textKept ? 'runtime-probe' : 'fallback', descriptor };
  }

  function formatDateForConstraint(format) {
    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const accepted = String(format || '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(accepted)) return `${yyyy}-${mm}-${dd}`;
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(accepted)) return `${yyyy}/${mm}/${dd}`;
    if (/^\d{8}$/.test(accepted)) return `${yyyy}${mm}${dd}`;
    if (/^\d{4}-\d{2}$/.test(accepted)) return `${yyyy}-${mm}`;
    if (/^\d{4}\/\d{2}$/.test(accepted)) return `${yyyy}/${mm}`;
    if (/^\d{6}$/.test(accepted)) return `${yyyy}${mm}`;
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatNumericForConstraint(ctx, constraint) {
    const mode = constraint?.mode || 'integer';
    if (mode === 'composite') {
      if (/blood|pressure|bp|血压/i.test(ctx)) return '120/80';
      return '12/8';
    }
    if (mode === 'decimal') {
      if (/temperature|体温|℃/i.test(ctx)) return '36.5';
      if (/bmi/i.test(ctx)) return '22.4';
      if (/time|duration|seconds?|分钟|秒|行走/i.test(ctx)) return '4.5';
      return '12.5';
    }
    const FD = window.__BengaliFakeFillData__;
    return FD?.fakeNumberForContext ? FD.fakeNumberForContext(ctx) : '42';
  }

  function hasStrongSemanticHint(ctx) {
    return /name|username|login|email|e-?mail|phone|mobile|contact|tel|company|organization|address|street|url|website|password|birth|date|nid|passport|roll|student|registration|姓名|名字|邮箱|邮件|电话|手机|联系方式|公司|单位|地址|住址|身份证|证件|出生|日期|年龄|数量|编号/.test(ctx);
  }

  // Field filling logic - handles text inputs, checkboxes, file uploads, date fields
  // M4.21: Sensitive field skip rules applied here
  function guessAndFillInput(el, set, customRules, phoneFormat, customFiles) {
    if (phoneFormat === undefined) phoneFormat = 'local';
    if (el.disabled || el.type === "hidden") return;
    if (el.readOnly && !el.classList.contains("flatpickr-input")) return;
    customFiles = customFiles || {};

    const contextApi = window.__BengaliContext__;
    const descriptor = contextApi?.getFieldDescriptor ? contextApi.getFieldDescriptor(el) : null;
    const ctx = descriptor?.context || contextApi.getFieldContext(el);
    const runtimeConstraint = detectInputConstraint(el);
    const directHints = [
      descriptor?.label || '',
      descriptor?.aria || '',
      ...(descriptor?.attrs || []),
      descriptor?.machineHints?.autocomplete || '',
      descriptor?.machineHints?.type || '',
    ].join(' ').trim();
    const hasUsernameHint = /(^|[\s._-])(username|login|user\s*name)([\s._-]|$)|用户名|账号/.test(directHints);
    const hasEmailHint = /(^|[\s._-])(e-?mail)([\s._-]|$)|邮箱|邮件/.test(directHints);
    const hasPhoneHint = /(^|[\s._-])(phone|mobile|contact|cell|tel)([\s._-]|$)|电话|手机|联系方式/.test(directHints);
    const hasUrlHint = /(^|[\s._-])(url|website|site|link)([\s._-]|$)|网址/.test(directHints);
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
      } else if (/birth|dob|b\.?d|出生|年月|日期/i.test(ctx) && /date|出生|年月|日期/i.test(ctx)) {
        if (!set("date")) return;
        value = fakeBirthDateFormatted(getDateFormatFromContext(ctx));
      } else if (/date|日期|时间|年月/i.test(ctx)) {
        if (!set("date")) return;
        if (/admission|join|enroll/i.test(ctx)) {
          const d = new Date();
          value = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
        } else value = fakeDateFormatted(getDateFormatFromContext(ctx));
      } else if (/roll|student.*num|registration.*num|编号|序号|单号/i.test(ctx)) {
        if (set("number")) value = fakeNumberForContext(ctx);
      } else if (hasUsernameHint) {
        if (set("name")) value = fakeName().toLowerCase().replace(/\s+/g, "");
      } else if (el.type === "tel" || hasPhoneHint) {
        if (!set("phone")) return;
        value = phoneFormat === 'international' ? fakePhone() : fakePhoneLocal();
      } else if (el.type === "email" || hasEmailHint) {
        if (!set("email")) return;
        value = fakeEmailForContext(ctx);
      } else if (el.type === "url" || hasUrlHint) {
        if (!set("url")) return;
        value = fakeUrlForContext(ctx);
      } else if (/first.*name|given.*name|fname|姓/i.test(ctx)) {
        if (!set("name")) return;
        value = rand(firstNames);
      } else if (/middle.*name|mname/i.test(ctx)) {
        if (set("name")) value = rand(firstNames);
      } else if (/last.*name|sur.*name|family.*name|lname/i.test(ctx)) {
        if (set("name")) value = rand(lastNames);
      } else if (/full.*name|complete.*name|student.*name|person.*name|姓名|名字|联系人姓名/i.test(ctx) || /^\s*name\s*$/i.test(ctx)) {
        if (set("name")) value = fakeName();
      } else if (/user.*name|username|login/i.test(ctx)) {
        if (set("name")) value = fakeName().toLowerCase().replace(/\s+/g, "");
      } else if (/father|parent|guardian/i.test(ctx) && /name/i.test(ctx)) {
        if (set("name")) value = fakeName();
      } else if (/mother/i.test(ctx) && /name/i.test(ctx)) {
        if (set("name")) value = rand(firstNames) + " " + rand(lastNames);
      } else if (/company|organization|employer|institute|school|公司|单位|机构/i.test(ctx)) {
        if (!set("company")) return;
        value = fakeCompany();
      } else if (/address|street|location|residence|地址|住址|户籍|籍贯/i.test(ctx)) {
        if (!set("address")) return;
        value = fakeAddress();
      } else if (/city|town|municipality|城市/i.test(ctx)) {
        if (set("address")) value = fakeCity();
      } else if (/zip|post.*code|pin|邮编/i.test(ctx)) {
        if (set("address")) value = fakePostcode();
      } else if (/country|nation(?!al)|国家/i.test(ctx)) {
        if (set("address")) value = "Bangladesh";
      } else if (/district|state|division|region|地区|省|市/i.test(ctx)) {
        if (set("address")) value = "Dhaka";
      } else if (/national.*id|nid|passport|身份证|证件号/i.test(ctx)) {
        if (!set("nid")) return;
        value = fakeNidForContext(ctx);
      } else if (runtimeConstraint.kind === 'date') {
        if (!set("date")) return;
        value = formatDateForConstraint(runtimeConstraint.format);
      } else if (el.type === "number" || runtimeConstraint.kind === 'numeric' || /age|year.*old|qty|quantity|amount|count|年龄|数量|体重|身高|温度|血压|心率|频率|次数|BMI|腰围|小腿围|握力/i.test(ctx)) {
        if (set("number")) value = runtimeConstraint.kind === 'numeric' ? formatNumericForConstraint(ctx, runtimeConstraint) : fakeNumberForContext(ctx);
      } else if (/password|passwd|pwd/i.test(ctx) || el.type === "password") {
        if (!set("password")) return;
        value = fakePasswordForContext(ctx);
      } else if (/desc|about|note|comment|remark|detail|性格|爱好|病史|来源|情况|特长|渠道|状况/i.test(ctx)) {
        if (!set("textarea")) return;
        value = fakeSentence();
      } else if (el.type === "text" || el.type === "search" || !el.type) {
        if (runtimeConstraint.kind === 'numeric') {
          if (!set("number")) return;
          value = formatNumericForConstraint(ctx, runtimeConstraint);
        } else if (runtimeConstraint.kind === 'date') {
          if (!set("date")) return;
          value = formatDateForConstraint(runtimeConstraint.format);
        } else if (!hasStrongSemanticHint(ctx)) {
          return;
        } else if (!el.value && set("name")) {
          value = fakeName();
        }
      }
    }

    // Set the value
    if (value) {
      try {
        const { setValueAndNotify } = window.__BengaliEvents__;
        const oldValue = el.value;
        setValueAndNotify(el, value);
        if (el.validity && !el.validity.valid) {
          setValueAndNotify(el, oldValue);
          return;
        }
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
    detectInputConstraint,
    formatDateForConstraint,
    formatNumericForConstraint,
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
