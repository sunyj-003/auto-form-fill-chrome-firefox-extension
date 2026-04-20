(function () {
  function getFakeDataApi() {
    return window.__BengaliFakeData__ || window.__BengaliFakeFillData__ || {};
  }

  function inferFillType(contextText) {
    const text = String(contextText || '').toLowerCase();
    if (/email/i.test(text)) return 'email';
    if (/phone|mobile|tel/i.test(text)) return 'phone';
    if (/address/i.test(text)) return 'address';
    if (/city|division|state|province|region/i.test(text)) return 'city';
    if (/company|organization/i.test(text)) return 'company';
    if (/password/i.test(text)) return 'password';
    if (/url|website/i.test(text)) return 'url';
    if (/birth|dob|birthday/i.test(text)) return 'birthDate';
    if (/date|time/i.test(text)) return 'date';
    if (/name|first.*name|full.*name/i.test(text)) return 'name';
    return 'text';
  }

  function getValueForContext(contextText, fallbackType = 'text') {
    const fakeData = getFakeDataApi();
    const type = inferFillType(contextText) || fallbackType;
    if (type === 'birthDate' && typeof fakeData.fakeBirthDateISO === 'function') {
      return fakeData.fakeBirthDateISO();
    }
    if (typeof fakeData.getValueByType === 'function') {
      const mappedType = type === 'text' ? 'name' : type;
      return fakeData.getValueByType(mappedType, contextText || '', {});
    }
    if (typeof fakeData.fakeName === 'function') return fakeData.fakeName();
    return 'Demo Value';
  }

  function highlightElement(el) {
    if (!el?.classList) return;
    el.classList.add('bengali-fake-filled');
    setTimeout(() => el.classList.remove('bengali-fake-filled'), 1000);
  }

  function setInputLikeValue(el, value) {
    const eventsApi = window.__BengaliEvents__;
    if (eventsApi?.setValueAndNotify) {
      eventsApi.setValueAndNotify(el, value);
      return;
    }
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const api = {
    getFakeDataApi,
    inferFillType,
    getValueForContext,
    highlightElement,
    setInputLikeValue,
    wait,
  };

  if (typeof window !== 'undefined') {
    window.__BengaliAdapterHelpers__ = api;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
