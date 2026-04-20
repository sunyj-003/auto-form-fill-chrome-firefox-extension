(function () {
  // Fill all radio buttons by group (random one per group)
  function fillRadiosByGroup() {
    const groups = {};
    document.querySelectorAll("input[type=radio]").forEach(r => {
      if (r.disabled) return;
      const name = r.name || ("__no_group__" + Math.random());
      (groups[name] ||= []).push(r);
    });
    const FD = window.__BengaliFakeFillData__;
    const rand = FD?.rand || ((arr) => arr[Math.floor(Math.random() * arr.length)]);
    Object.values(groups).forEach(list => {
      if (!list.length) return;
      const choice = rand(list);
      choice.checked = true;
      choice.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      choice.dispatchEvent(new Event("input", { bubbles: true }));
      choice.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

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
    } catch (e) {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function smoothScrollTo(element) {
    if (!element) return;
    try {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    } catch (e) {
      try { element.scrollIntoView(); } catch (e2) { }
    }
  }

  const api = { fillRadiosByGroup, setValueAndNotify, smoothScrollTo };

  if (typeof window !== 'undefined') {
    window.__BengaliEvents__ = api;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
