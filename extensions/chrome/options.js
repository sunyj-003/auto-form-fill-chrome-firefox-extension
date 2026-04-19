const storage = window.__BengaliStorage__;
const FORM_KEYS = storage.FORM_KEYS;

function showToast(msg) {
  const el = document.getElementById('toast');
  const msgEl = document.getElementById('toastMessage');
  if (!el) return;
  if (msgEl) msgEl.textContent = msg || 'Saved';
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2200);
}

async function load() {
  const settings = await storage.getSettings();
  const customFiles = await storage.getCustomFiles();

  const shortcutEl = document.getElementById('shortcutToggle');
  if (shortcutEl) {
    shortcutEl.classList.toggle('on', settings.shortcutEnabled);
    shortcutEl.setAttribute('aria-checked', settings.shortcutEnabled);
  }

  const autoFillEl = document.getElementById('autoFillToggle');
  if (autoFillEl) {
    autoFillEl.classList.toggle('on', settings.autoFillEnabled);
    autoFillEl.setAttribute('aria-checked', settings.autoFillEnabled);
  }

  const phoneFormatEl = document.getElementById('phoneFormat');
  if (phoneFormatEl) phoneFormatEl.value = settings.phoneFormat;

  FORM_KEYS.forEach(k => {
    const t = document.getElementById('t_' + k);
    if (t) {
      const on = settings.formSettings[k] !== false;
      t.classList.toggle('on', on);
      t.setAttribute('aria-checked', on);
    }
  });

  updateFieldCount();
  renderRules(settings.customRules);
  updateCustomFilesStatus(customFiles);
}

function updateFieldCount() {
  const el = document.getElementById('fieldCount');
  if (!el) return;
  let on = 0;
  FORM_KEYS.forEach(k => {
    const t = document.getElementById('t_' + k);
    if (t && t.classList.contains('on')) on++;
  });
  el.textContent = `${on} / ${FORM_KEYS.length} on`;
}

async function setField(k, on) {
  const t = document.getElementById('t_' + k);
  if (!t) return;
  t.classList.toggle('on', on);
  t.setAttribute('aria-checked', on);
  try {
    await storage.updateFormSettings({ [k]: on });
    updateFieldCount();
    showToast('Saved');
  } catch (err) {
    showToast('Save failed');
  }
}
async function setAllFields(on) {
  const s = {};
  FORM_KEYS.forEach(k => { s[k] = on; const t = document.getElementById('t_' + k); if (t) { t.classList.toggle('on', on); t.setAttribute('aria-checked', on); } });
  try {
    await storage.updateFormSettings(s);
    updateFieldCount();
    showToast(on ? 'All fields enabled' : 'All fields disabled');
  } catch (err) {
    showToast('Save failed');
  }
}

function renderRules(rules) {
  const list = document.getElementById('rulesList');
  if (!list) return;
  if (rules.length === 0) {
    list.innerHTML = `
      <div class="rules-empty">
        <div class="illus" aria-hidden="true">📝</div>
        <p>No custom rules yet</p>
        <p class="hint">Add patterns below. Complete values (like +8801878578504) fill EXACT value. Text (like "phone") fills random data.</p>
        <p class="hint" style="margin-top:10px;text-align:left"><strong>Fixed value</strong>: <code>+8801878578504</code> [fixed] → Phone = fills that exact number. <strong>Text</strong>: <code>nickname</code> → Name (any field containing "nickname").<br><strong>Regex</strong>: <code>my_.*field</code> → Email (pattern match).<br><strong>Skip</strong>: <code>internal_id</code> → Skip (don’t fill).</p>
      </div>`;
    return;
  }
  list.innerHTML = rules.map((rule, i) =>
    `<div class="rule-item" data-i="${i}">
      <span class="pattern">${escapeHtml(rule.pattern)}</span>
      <span class="fillType">${rule.regex ? '[regex]' : '[fixed]'} → ${escapeHtml(rule.fillType)}</span>
      <button type="button" class="btn btn-danger delRule" data-i="${i}" aria-label="Remove rule">Remove</button>
    </div>`
  ).join('');
  list.querySelectorAll('.delRule').forEach(btn => {
    btn.onclick = async () => {
      const idx = +btn.dataset.i;
      try {
        await storage.removeCustomRule(idx);
        await load();
        showToast('Rule removed');
      } catch (err) {
        showToast('Remove failed');
      }
    };
  });
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

// ——— Tabs ———
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const panelId = 'panel-' + tab.dataset.panel;
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.add('active');
  });
});

// ——— General: shortcut ———
const shortcutEl = document.getElementById('shortcutToggle');
const phoneFormatEl = document.getElementById('phoneFormat');
if (phoneFormatEl) phoneFormatEl.addEventListener('change', function () {
  const val = this.value === 'international' ? 'international' : 'local';
  storage.setPhoneFormat(val)
    .then(() => showToast('Saved'))
    .catch(() => showToast('Save failed'));
});

if (shortcutEl) {
  shortcutEl.addEventListener('click', function () {
    const on = this.classList.toggle('on');
    this.setAttribute('aria-checked', on);
    storage.setShortcutEnabled(on)
      .then(() => showToast('Saved'))
      .catch(() => showToast('Save failed'));
  });
  shortcutEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click(); }
  });
}

// ——— 持续自动填充开关 ———
const autoFillEl = document.getElementById('autoFillToggle');
if (autoFillEl) {
  autoFillEl.addEventListener('click', function () {
    const on = this.classList.toggle('on');
    this.setAttribute('aria-checked', on);
    storage.setAutoFillEnabled(on)
      .then(() => showToast(on ? 'Auto-fill enabled' : 'Auto-fill disabled'))
      .catch(() => showToast('Save failed'));
  });
  autoFillEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click(); }
  });
}

// ——— Field chips: toggle + label click ———
FORM_KEYS.forEach(k => {
  const t = document.getElementById('t_' + k);
  const chip = t?.closest('.field-chip');
  if (!t) return;
  const toggle = async () => {
    const on = !t.classList.toggle('on');
    t.setAttribute('aria-checked', on);
    try {
      await storage.updateFormSettings({ [k]: on });
      updateFieldCount();
      showToast('Saved');
    } catch (err) {
      showToast('Save failed');
    }
  };
  t.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  t.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  if (chip) chip.addEventListener('click', (e) => { if (e.target === chip || e.target.classList.contains('label')) toggle(); });
});

// ——— Enable all / Disable all ———
document.getElementById('enableAll')?.addEventListener('click', () => setAllFields(true));
document.getElementById('disableAll')?.addEventListener('click', () => setAllFields(false));

// ——— Custom rules: add ———
const addBtn = document.getElementById('addRule');
const patternInput = document.getElementById('rulePattern');
const ruleTypeSelect = document.getElementById('ruleType');
const ruleRegexCheckbox = document.getElementById('ruleRegex');
if (addBtn && patternInput && ruleTypeSelect) {
  addBtn.addEventListener('click', async () => {
    const pattern = patternInput.value.trim();
    const fillType = ruleTypeSelect.value;
    const regex = !!ruleRegexCheckbox?.checked;
    if (!pattern) {
      showToast('Pattern cannot be empty');
      return;
    }

    // M4.23: Validate rule before saving
    if (storage.validateRule) {
      const validation = storage.validateRule({ pattern, fillType, regex });
      if (!validation.valid) {
        showToast(validation.errors[0]);
        return;
      }
    }

    try {
      await storage.addCustomRule({ pattern, fillType, regex });
      patternInput.value = '';
      if (ruleRegexCheckbox) ruleRegexCheckbox.checked = false;
      await load();
      showToast('Rule added');
    } catch (err) {
      showToast('Save failed');
    }
  });
  patternInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addBtn.click(); });
}

// ——— Reset: modal ———
const modalOverlay = document.getElementById('modalOverlay');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');
const resetBtn = document.getElementById('resetBtn');

function openModal() {
  if (modalOverlay) {
    modalOverlay.classList.add('show');
    modalOverlay.setAttribute('aria-hidden', 'false');
    modalCancel?.focus();
  }
}
function closeModal() {
  if (modalOverlay) {
    modalOverlay.classList.remove('show');
    modalOverlay.setAttribute('aria-hidden', 'true');
    resetBtn?.focus();
  }
}

if (resetBtn) resetBtn.addEventListener('click', openModal);
modalCancel?.addEventListener('click', closeModal);
modalConfirm?.addEventListener('click', () => {
  storage.resetSettings()
    .then(async () => {
      closeModal();
      await load();
      showToast('Reset to defaults');
    })
    .catch(() => showToast('Save failed'));
});
modalOverlay?.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
modalOverlay?.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ——— Custom Files ———
async function saveCustomFile(key, dataUrl, fileName) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) { showToast('Invalid file'); return; }
  try {
    const customFiles = await storage.saveCustomFile(key, dataUrl, fileName);
    showToast('Saved');
    updateCustomFilesStatus(customFiles);
  } catch (err) {
    showToast('Save failed');
  }
}

document.getElementById('customImage')?.addEventListener('change', function(e) {
  const file = e.target.files?.[0];
  if (!file || file.size > 2000000) { showToast(file ? 'File too large (max 2MB)' : 'No file'); return; }
  const reader = new FileReader();
  reader.onload = () => { saveCustomFile('image', reader.result, file.name); };
  reader.readAsDataURL(file);
});

document.getElementById('customPdf')?.addEventListener('change', function(e) {
  const file = e.target.files?.[0];
  if (!file || file.size > 2000000) { showToast(file ? 'File too large (max 2MB)' : 'No file'); return; }
  const reader = new FileReader();
  reader.onload = () => { saveCustomFile('pdf', reader.result, file.name); };
  reader.readAsDataURL(file);
});

document.getElementById('customDoc')?.addEventListener('change', function(e) {
  const file = e.target.files?.[0];
  if (!file || file.size > 2000000) { showToast(file ? 'File too large (max 2MB)' : 'No file'); return; }
  const reader = new FileReader();
  reader.onload = () => { saveCustomFile('doc', reader.result, file.name); };
  reader.readAsDataURL(file);
});

document.getElementById('clearCustomFiles')?.addEventListener('click', () => {
  storage.clearCustomFiles()
    .then(() => {
      showToast('Custom files cleared');
      updateCustomFilesStatus(null);
      ['customImage', 'customPdf', 'customDoc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
    })
    .catch(() => showToast('Clear failed'));
});

function updateCustomFilesStatus(customFiles) {
  const el = document.getElementById('customFilesStatus');
  if (!el) return;
  const files = storage.normalizeCustomFiles(customFiles);
  const labels = [];
  if (files.image) labels.push(`Image: ${files.imageName}`);
  if (files.pdf) labels.push(`PDF: ${files.pdfName}`);
  if (files.doc) labels.push(`DOC: ${files.docName}`);
  el.textContent = labels.length ? labels.join(' | ') : 'No custom files saved.';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { load().catch(() => showToast('Load failed')); });
} else {
  load().catch(() => showToast('Load failed'));
}
window.addEventListener('pageshow', () => { load().catch(() => showToast('Load failed')); });
