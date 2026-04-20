(function () {
  // Get random helper - tries to use fake data rand, falls back to native
  function rand(arr) {
    const FD = window.__BengaliFakeFillData__;
    if (FD?.rand) return FD.rand(arr);
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Timeout helper
  function withTimeout(promise, ms) {
    return new Promise(resolve => {
      const t = setTimeout(() => resolve("timeout"), ms);
      promise.then(res => { clearTimeout(t); resolve(res); })
        .catch(() => { clearTimeout(t); resolve("error"); });
    });
  }

  function isVisibleElement(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 2 && rect.height > 2 && style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity || '1') > 0;
  }

  function getNaiveSelectedText(root) {
    if (!root) return '';
    const selected = root.querySelector('.n-base-selection-label__render-label, .n-base-selection-label, .n-base-selection-input__content, .n-tag__content');
    return String(selected?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function getVisibleNaiveDropdown() {
    const containers = Array.from(document.querySelectorAll('.v-binder-follower-content, .n-base-select-menu, .n-select-menu'));
    return containers.find((el) => isVisibleElement(el) && el.querySelector('.n-base-select-option, .n-select-option, .n-option'));
  }

  async function selectNaiveOption(nSelect, clickTarget) {
    const beforeText = getNaiveSelectedText(nSelect);
    clickTarget.click();

    for (let attempt = 0; attempt < 16; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 250 : 120));

      const dropdown = getVisibleNaiveDropdown();
      if (!dropdown) continue;

      const items = Array.from(dropdown.querySelectorAll('.n-base-select-option, .n-select-option, .n-option'))
        .filter((item) => isVisibleElement(item) && item.getAttribute('aria-disabled') !== 'true' && !item.classList.contains('n-base-select-option--disabled'));

      if (!items.length) continue;

      const validItems = items.filter((item) => {
        const text = String(item.textContent || '').replace(/\s+/g, ' ').trim();
        return text && !/^(请选择|请选择.+|select|choose|pick)$/i.test(text);
      });
      const pool = validItems.length ? validItems : items;
      const choice = rand(pool);
      const choiceText = String(choice.textContent || '').replace(/\s+/g, ' ').trim();
      const clickNode = choice.querySelector('.n-base-select-option__content, .n-select-option__content') || choice;

      clickNode.scrollIntoView({ block: 'nearest' });
      clickNode.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
      clickNode.click();
      clickNode.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));

      for (let verify = 0; verify < 8; verify++) {
        await new Promise((resolve) => setTimeout(resolve, 80));
        const afterText = getNaiveSelectedText(nSelect);
        const selected = nSelect.classList.contains('n-base-selection--selected') || Boolean(afterText);
        if ((afterText && afterText !== beforeText) || (choiceText && afterText.includes(choiceText)) || selected) {
          return true;
        }
      }
    }

    return false;
  }

  // jQuery Select2 handling
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

  // Process framework dropdowns (Vue Select, Element Plus, Ant Design, React Select, Naive UI)
  async function processFrameworkDropdown(input) {
    if (input.disabled || input.readOnly) return;

    const FD = window.__BengaliFakeFillData__;
    const fakeDateUser = FD?.fakeDateUser || (() => new Date().toISOString().slice(0, 10));

    // Ant Design handling
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

    // React Select handling
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
    let nSelect = input.closest(".n-select, .n-base-selection");
    if (!nSelect && (input.classList.contains("n-select") || input.classList.contains("n-base-selection"))) {
      nSelect = input;
    }
    if (nSelect && !nSelect.classList.contains("n-base-selection--disabled")) {
      const trigger = nSelect.querySelector(".n-base-selection__border, .n-base-selection__suffix, .n-base-selection__arrow, .n-base-selection-label, .n-base-selection__value, .n-base-selection-trigger");
      const clickTarget = trigger || nSelect;
      if (clickTarget && clickTarget !== input && clickTarget.click) {
        return selectNaiveOption(nSelect, clickTarget);
      }
    }

    // Vue Select handling
    let vselect = input.closest(".v-select, .vue-select, div[class*='select']");
    let toggle = input.closest(".vs__dropdown-toggle");

    if (!vselect && toggle) vselect = toggle.parentElement;
    if (vselect && !toggle) toggle = vselect.querySelector(".vs__dropdown-toggle");

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
              const valid = options.filter(o => !/select|choose/i.test(o.textContent?.trim() || ''));
              const pool = valid.length > 0 ? valid : options;
              let pick = null;
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

  // Element Plus date picker handling
  async function processElementPlusDatePicker(input) {
    if (input.disabled || input.readOnly) return;

    const picker = input.closest(".el-date-editor");
    if (picker && !picker.classList.contains("is-disabled")) {
      const hiddenInput = picker.querySelector("input[type=hidden]");
      if (hiddenInput) {
        const FD = window.__BengaliFakeFillData__;
        const fakeDateUser = FD?.fakeDateUser || (() => new Date().toISOString().slice(0, 10));
        const dateValue = fakeDateUser();
        hiddenInput.value = dateValue;
        hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }

      let wrapper = picker.querySelector(".el-input__wrapper");
      if (!wrapper) wrapper = picker.querySelector(".el-date-editor__wrapper");
      if (wrapper) {
        wrapper.click();
        await new Promise(r => setTimeout(r, 300));

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

  // Naive UI date picker handling
  async function processNaiveDatePicker(input) {
    if (input.disabled || input.readOnly) return;

    const datePicker = input.closest(".n-date-picker");
    if (!datePicker) return;

    const FD = window.__BengaliFakeFillData__;
    const fakeDateUser = FD?.fakeDateUser || (() => new Date().toISOString().slice(0, 10));

    input.value = fakeDateUser();
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    const wrapper = datePicker.querySelector(".n-input");
    if (wrapper) {
      wrapper.click();
      await new Promise(r => setTimeout(r, 500));

      const followers = document.querySelectorAll(".v-binder-follower-content");
      for (const f of followers) {
        const panel = f.querySelector(".n-date-picker-panel, .n-calendar");
        if (panel) {
          const cell = panel.querySelector(".n-date-panel-cell:not(.n-date-panel-cell--disabled)");
          if (cell) {
            cell.click();
            await new Promise(r => setTimeout(r, 200));
            break;
          }
        }
      }
    }
  }

  const api = {
    fillSelect2,
    processFrameworkDropdown,
    processElementPlusDatePicker,
    processNaiveDatePicker,
    withTimeout,
    rand,
  };

  if (typeof window !== 'undefined') {
    window.__BengaliDropdown__ = api;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
