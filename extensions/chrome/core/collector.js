(function () {
  function createCollectionState() {
    return { items: [], seen: new Set(), seenEl: new Set() };
  }

  function addCollectedItem(list, item) {
    if (!item || !item.el || list.seenEl.has(item.el)) return;
    list.seenEl.add(item.el);
    list.items.push(item);
  }

  function isNaiveSelectionElement(el) {
    if (!el || !el.classList) return false;
    if (!el.classList.contains('n-base-selection')) return false;
    return !(
      el.classList.contains('n-base-selection-tags') ||
      el.classList.contains('n-base-selection__border') ||
      el.classList.contains('n-base-selection__state-border') ||
      el.classList.contains('n-base-selection-label') ||
      el.classList.contains('n-base-selection-trigger') ||
      el.classList.contains('n-base-selection-input-tag') ||
      el.classList.contains('n-base-loading')
    );
  }

  async function collectFromRoot(root, list) {
    if (!root || list.seen.has(root)) return;
    list.seen.add(root);

    const getActiveNaivePopup = () => {
      const modals = document.querySelectorAll('.n-modal, .n-dialog');
      for (const modal of modals) {
        const showAttr = modal.getAttribute('show') || modal.getAttribute('v-show:show') || modal.getAttribute('v-if');
        const style = window.getComputedStyle(modal);
        if (showAttr !== 'false' && showAttr !== 'null' && style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0) return modal;
      }
      const drawers = document.querySelectorAll('.n-drawer');
      for (const drawer of drawers) {
        const showAttr = drawer.getAttribute('show') || drawer.getAttribute('v-show:show') || drawer.getAttribute('v-if');
        const style = window.getComputedStyle(drawer);
        if (showAttr !== 'false' && showAttr !== 'null' && style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0) return drawer;
      }
      const popovers = document.querySelectorAll('.n-popover');
      for (const popover of popovers) {
        const style = window.getComputedStyle(popover);
        if (style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0) return popover;
      }
      const cards = document.querySelectorAll('.n-card[data-model]');
      for (const card of cards) {
        const style = window.getComputedStyle(card);
        if (style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0) return card;
      }
      return null;
    };

    const activePopup = root === document ? getActiveNaivePopup() : null;
    const isElementInActivePopup = (el) => {
      if (!activePopup) return true;
      return activePopup.contains(el) || el === activePopup;
    };

    const q = (sel) => Array.from((root.querySelectorAll || root.querySelector)?.call(root, sel) || []);
    const qDoc = (sel) => root === document ? Array.from(document.querySelectorAll(sel)) : [];

    q('.n-select .n-base-selection, .n-base-selection').forEach(el => {
      if (!isElementInActivePopup(el) || !isNaiveSelectionElement(el)) return;
      addCollectedItem(list, { type: 'naive-select', el, from: 'naive-ui' });
    });

    q('input').forEach(el => {
      if (list.seenEl.has(el) || !isElementInActivePopup(el)) return;
      if (el.closest('.n-select') || el.closest('.n-base-selection')) return;
      list.seenEl.add(el);
      if (el.type === 'file') { list.items.push({ type: 'input', el }); return; }
      const ph = (el.placeholder || '').toLowerCase();
      if (el.classList.contains('flatpickr-input')) list.items.push({ type: 'input', el });
      else if (ph.includes('select') || el.classList.contains('vs__search') || /vs__search|react-select|ant-select/i.test(el.className)) list.items.push({ type: 'vue-select', el });
      else list.items.push({ type: 'input', el });
    });
    q('textarea').forEach(el => { if (!list.seenEl.has(el) && isElementInActivePopup(el)) { list.seenEl.add(el); list.items.push({ type: 'textarea', el }); } });
    q('select').forEach(el => { if (!list.seenEl.has(el) && isElementInActivePopup(el)) { list.seenEl.add(el); list.items.push({ type: 'select', el }); } });
    q('[contenteditable=true]').forEach(el => { if (!list.seenEl.has(el) && isElementInActivePopup(el)) { list.seenEl.add(el); list.items.push({ type: 'contenteditable', el }); } });
    q("input.vs__search, input[type=search][class*='vs__search'], input[class*='react-select'], .ant-select-selection-search-input").forEach(el => {
      if (!list.seenEl.has(el) && isElementInActivePopup(el)) { list.seenEl.add(el); list.items.push({ type: 'vue-select', el }); }
    });
    q('[role="combobox"]').forEach(el => {
      if (list.seenEl.has(el) || !isElementInActivePopup(el)) return;
      list.seenEl.add(el);
      const hasInput = el.querySelector('input');
      if (hasInput && !list.seenEl.has(hasInput)) { addCollectedItem(list, { type: 'vue-select', el: hasInput }); }
      else { const btn = el.querySelector('button, [role=button]'); if (btn) list.items.push({ type: 'custom-dropdown', el }); }
    });

    const elSelects = qDoc('.el-select');
    elSelects.forEach(el => {
      if (list.seenEl.has(el)) return;
      list.seenEl.add(el);
      let wrapper = el.querySelector('.el-input__wrapper');
      if (!wrapper) wrapper = el.querySelector('.el-select__wrapper');
      if (wrapper && !list.seenEl.has(wrapper)) {
        addCollectedItem(list, { type: 'vue-select', el: wrapper, from: 'el-select' });
      } else {
        const input = el.querySelector('input');
        if (input) addCollectedItem(list, { type: 'vue-select', el: input, from: 'el-select-input' });
      }
    });

    q('.n-base-selection--selected, .n-base-selection--error-status').forEach(el => {
      if (list.seenEl.has(el)) return;
      const parent = el.parentElement;
      if (parent && (parent.classList.contains('n-select') || parent.classList.contains('n-base-selection'))) {
        addCollectedItem(list, { type: 'naive-select', el: parent, from: 'naive-ui' });
      } else if (!list.seenEl.has(el)) {
        addCollectedItem(list, { type: 'naive-select', el, from: 'naive-ui' });
      }
    });

    q('.n-base-selection-label').forEach(el => {
      if (list.seenEl.has(el)) return;
      const parent = el.parentElement;
      if (parent && !list.seenEl.has(parent)) {
        addCollectedItem(list, { type: 'naive-select', el: parent, from: 'naive-ui' });
      }
    });

    const elDateEditors = qDoc('.el-date-editor');
    elDateEditors.forEach(el => {
      if (list.seenEl.has(el)) return;
      list.seenEl.add(el);
      let wrapper = el.querySelector('.el-input__wrapper');
      if (!wrapper) wrapper = el.querySelector('.el-date-editor__wrapper');
      if (wrapper && !list.seenEl.has(wrapper)) {
        addCollectedItem(list, { type: 'el-date-picker', el: wrapper });
      }
    });
    q('.el-checkbox').forEach(el => {
      if (list.seenEl.has(el)) return;
      const input = el.querySelector('input[type=checkbox]');
      if (input && !list.seenEl.has(input)) {
        list.seenEl.add(el);
        list.seenEl.add(input);
        list.items.push({ type: 'el-checkbox', el: input });
      }
    });

    q('.ant-input, .ant-input-password, .ant-input-number, .ant-input-textarea').forEach(el => {
      addCollectedItem(list, { type: 'input', el });
    });
    q('.ant-select').forEach(el => {
      if (list.seenEl.has(el)) return;
      const selector = el.querySelector('.ant-select-selector');
      if (selector && !list.seenEl.has(selector)) {
        list.seenEl.add(el);
        addCollectedItem(list, { type: 'vue-select', el: selector, from: 'antd-select' });
      }
    });
    q('.ant-checkbox-input').forEach(el => {
      addCollectedItem(list, { type: 'el-checkbox', el });
    });

    q('.n-input, .n-input__textarea-el').forEach(el => {
      addCollectedItem(list, { type: 'input', el });
    });
    q('.n-checkbox-box, .n-checkbox input[type=checkbox]').forEach(el => {
      addCollectedItem(list, { type: 'el-checkbox', el });
    });
    q('.n-date-picker').forEach(el => {
      if (list.seenEl.has(el) || !isElementInActivePopup(el)) return;
      const input = el.querySelector('.n-input__input-el');
      if (input && !list.seenEl.has(input)) {
        list.seenEl.add(el);
        list.seenEl.add(input);
        list.items.push({ type: 'el-date-picker', el: input });
      }
    });

    q('[data-v-], [v-]').forEach(el => {
      if (!isElementInActivePopup(el)) return;
    });

    q('.dropdown, .custom-select, .ant-select, .el-select, .el-date-editor, .react-select__control, .react-select, .MuiSelect-select, mat-select').forEach(el => {
      if (list.seenEl.has(el) || !isElementInActivePopup(el)) return;
      const input = el.querySelector('input:not([type=hidden])');
      if (input && !list.seenEl.has(input)) { list.seenEl.add(el); addCollectedItem(list, { type: el.classList.contains('el-date-editor') ? 'el-date-picker' : 'vue-select', el: input }); }
      else { const btn = el.querySelector('button, [role=button], .ant-select-selector, .react-select__control, .react-select__value-container'); if (btn) { list.seenEl.add(el); list.items.push({ type: 'custom-dropdown', el }); } }
    });
    q('.n-base-selection:not(:has(.n-base-selection-input))').forEach(el => {
      if (list.seenEl.has(el) || !isElementInActivePopup(el) || !isNaiveSelectionElement(el)) return;
      list.seenEl.add(el);
      list.items.push({ type: 'custom-dropdown', el, from: 'naive-ui' });
    });
    try { q('*').forEach(el => { if (el.shadowRoot) collectFromRoot(el.shadowRoot, list); }); } catch (err) {}
  }

  const api = { createCollectionState, collectFromRoot };

  if (typeof window !== 'undefined') window.__BengaliCollector__ = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
