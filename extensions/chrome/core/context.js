(function () {
  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function getFormContainer(el) {
    return el.closest?.(
      '.n-form-item, .el-form-item, .ant-form-item, .form-item, .field, .cell, .item, td, th, form, fieldset, .n-grid-item, .n-gi'
    ) || el.parentElement || null;
  }

  function getContainerText(el) {
    const container = getFormContainer(el);
    if (!container) return '';

    const clone = container.cloneNode(true);
    clone.querySelectorAll?.('input, textarea, select, button, svg').forEach((node) => node.remove());
    return normalizeText(clone.textContent).slice(0, 200);
  }

  function getLabelText(el) {
    let label = '';
    const root = el.getRootNode?.()?.host ? el.getRootNode() : document;
    if (el.id) {
      const lbl = root.querySelector?.(`label[for="${el.id}"]`);
      if (lbl) label = normalizeText(lbl.textContent);
    }
    if (!label && el.previousElementSibling?.tagName === 'LABEL') {
      label = normalizeText(el.previousElementSibling.textContent);
    }
    if (!label) {
      const container = getFormContainer(el);
      const lbl = container?.querySelector?.('label');
      if (lbl) label = normalizeText(lbl.textContent);
    }
    return label;
  }

  function getMachineHints(el) {
    return {
      type: normalizeText(el.type),
      inputMode: normalizeText(el.getAttribute?.('inputmode')),
      pattern: normalizeText(el.getAttribute?.('pattern')),
      autocomplete: normalizeText(el.getAttribute?.('autocomplete')),
      maxLength: Number(el.getAttribute?.('maxlength') || 0) || 0,
      role: normalizeText(el.getAttribute?.('role')),
    };
  }

  function getFieldDescriptor(el) {
    const attrs = [
      el.name, el.id, el.placeholder, (el.className && typeof el.className === 'string' ? el.className : ''),
      el.getAttribute?.('data-field') || '', el.getAttribute?.('data-testid') || '', el.getAttribute?.('data-name') || '',
      el.getAttribute?.('data-label') || '', el.getAttribute?.('formcontrolname') || '', el.getAttribute?.('name') || '',
      el.getAttribute?.('ng-reflect-name') || ''
    ].filter(Boolean).map(normalizeText);
    const label = getLabelText(el);
    const aria = normalizeText(el.getAttribute?.('aria-label') || el.getAttribute?.('aria-labelledby') || el.getAttribute?.('aria-placeholder') || '');
    const containerText = getContainerText(el);
    const machineHints = getMachineHints(el);

    return {
      attrs,
      label,
      aria,
      containerText,
      machineHints,
      context: [...attrs, label, aria, containerText].filter(Boolean).join(' ').trim(),
    };
  }

  function getFieldContext(el) {
    return getFieldDescriptor(el).context;
  }

  const api = { getFieldContext, getFieldDescriptor };

  if (typeof window !== 'undefined') {
    window.__BengaliContext__ = api;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
