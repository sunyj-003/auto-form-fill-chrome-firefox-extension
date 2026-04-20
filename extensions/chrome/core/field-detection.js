/**
 * Field Detection Priority - Defines how fields are detected and prioritized
 * M4.20: Field Detection Priority
 *
 * Priority order (highest to lowest):
 * 1. Custom rules (regex or fixed pattern match)
 * 2. Label or placeholder text
 * 3. id/name/aria attributes
 * 4. type attribute (input type)
 * 5. Auto-inference from context
 */
(function () {
  // Sensitive field patterns to skip by default
  const SENSITIVE_FIELDS = [
    { pattern: /password.*confirm/i, field: 'skip', reason: 'Password confirmation' },
    { pattern: /confirm.*password/i, field: 'skip', reason: 'Password confirmation' },
    { pattern: /credit.?card/i, field: 'skip', reason: 'Credit card' },
    { pattern: /card.?number/i, field: 'skip', reason: 'Card number' },
    { pattern: /cvv/i, field: 'skip', reason: 'CVV' },
    { pattern: /cvc/i, field: 'skip', reason: 'CVC' },
    { pattern: /security.?code/i, field: 'skip', reason: 'Security code' },
    { pattern: /ssn/i, field: 'skip', reason: 'Social Security' },
    { pattern: /social.?security/i, field: 'skip', reason: 'Social Security' },
    { pattern: /bank.?account/i, field: 'skip', reason: 'Bank account' },
    { pattern: /routing.?number/i, field: 'skip', reason: 'Routing number' },
    { pattern: /pin.?number/i, field: 'skip', reason: 'PIN' },
    { pattern: /token/i, field: 'skip', reason: 'Security token' },
    { pattern: /secret.?key/i, field: 'skip', reason: 'Secret key' },
    { pattern: /api.?key/i, field: 'skip', reason: 'API key' },
    { pattern: /private.?key/i, field: 'skip', reason: 'Private key' },
    { pattern: /auth.?code/i, field: 'skip', reason: 'Auth code' },
  ];

  // Detection priority definitions
  const DETECTION_PRIORITY = {
    // Priority 1: Custom rules - highest priority, applied first
    CUSTOM_RULE: 100,

    // Priority 2: Labels and placeholders - explicit field labels
    LABEL: 80,
    PLACEHOLDER: 80,

    // Priority 3: id/name/aria attributes - semantic identifiers
    ID: 60,
    NAME: 60,
    ARIA_LABEL: 60,
    ARIA_LABELLEDBY: 60,
    DATA_FIELD: 55,
    DATA_NAME: 55,
    DATA_TESTID: 55,

    // Priority 4: type attribute - explicit input type
    TYPE: 40,

    // Priority 5: Auto-inference - context-based guessing
    AUTO_INFER: 20,
  };

  // Check if a field is sensitive and should be skipped
  function isSensitiveField(context, options) {
    options = options || {};
    const ctxString = String(context || '').toLowerCase();
    const idLower = (options.id || '').toLowerCase();
    const nameLower = (options.name || '').toLowerCase();
    const combined = ctxString + ' ' + idLower + ' ' + nameLower;

    for (const sensitive of SENSITIVE_FIELDS) {
      if (sensitive.pattern.test(combined)) {
        return { skip: true, reason: sensitive.reason };
      }
    }
    return { skip: false };
  }

  // Get detection priority for a field attribute type
  function getDetectionPriority(attrType) {
    return DETECTION_PRIORITY[attrType] || DETECTION_PRIORITY.AUTO_INFER;
  }

  // Sort detection sources by priority
  function sortByPriority(sources) {
    return sources.sort((a, b) => {
      const priA = getDetectionPriority(a.type);
      const priB = getDetectionPriority(b.type);
      return priB - priA;
    });
  }

  // Field type inference based on input type attribute
  function inferFromType(el) {
    if (!el) return 'text';
    const type = (el.type || 'text').toLowerCase();

    const typeMap = {
      'email': 'email',
      'tel': 'phone',
      'password': 'password',
      'url': 'url',
      'number': 'number',
      'date': 'date',
      'datetime-local': 'date',
      'time': 'date',
      'month': 'date',
      'week': 'date',
      'checkbox': 'checkbox',
      'radio': 'radio',
      'file': 'file',
      'search': 'text',
      'text': 'text',
    };

    return typeMap[type] || 'text';
  }

  // Extract label text from various sources
  function extractLabel(el) {
    if (!el) return '';
    const root = el.getRootNode?.();
    const doc = root || document;

    // Check label[for]
    if (el.id) {
      const lbl = doc.querySelector?.(`label[for="${el.id}"]`);
      if (lbl?.textContent) return lbl.textContent.trim();
    }

    // Check previousElementSibling label
    if (el.previousElementSibling?.tagName === 'LABEL') {
      return el.previousElementSibling.textContent.trim();
    }

    // Check parent container label
    const parent = el.closest('div, td, th, form, fieldset, label');
    const lbl = parent?.querySelector?.('label');
    if (lbl?.textContent) return lbl.textContent.trim();

    // Check aria-label
    const ariaLabel = el.getAttribute?.('aria-label');
    if (ariaLabel) return ariaLabel.trim();

    // Check aria-labelledby
    const ariaLabelledBy = el.getAttribute?.('aria-labelledby');
    if (ariaLabelledBy) {
      const target = doc.getElementById?.(ariaLabelledBy);
      if (target?.textContent) return target.textContent.trim();
    }

    return '';
  }

  const api = {
    SENSITIVE_FIELDS,
    DETECTION_PRIORITY,
    isSensitiveField,
    getDetectionPriority,
    sortByPriority,
    inferFromType,
    extractLabel,
  };

  if (typeof window !== 'undefined') {
    window.__BengaliFieldDetection__ = api;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();