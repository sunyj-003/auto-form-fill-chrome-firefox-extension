/**
 * Field Type Model - Defines canonical field types for Bengali Fake Fill
 * M4.19: Field Type Model
 */
(function () {
  // All supported field types (canonical)
  const FIELD_TYPES = [
    'name',      // Full name or parts (first, last, given, family)
    'email',    // Email address
    'phone',    // Phone number (Bangladeshi format)
    'address',  // Street address
    'company',  // Company/organization
    'password', // Password
    'url',      // URL/website
    'date',    // Date (various formats)
    'birthDate', // Birth date
    'number',  // Numeric value
    'nid',     // National ID
    'textarea', // Text area (description, notes)
    'select',  // Dropdown/select
    'checkbox', // Checkbox
    'radio',   // Radio button
    'file',    // File upload
    'text',    // Generic text (fallback)
  ];

  // Field type groups for UI display
  const FIELD_TYPE_GROUPS = {
    personal: ['name', 'email', 'phone', 'birthDate', 'nid'],
    location: ['address', 'company'],
    account: ['password', 'url'],
    form: ['date', 'number', 'textarea', 'select', 'checkbox', 'radio', 'file'],
  };

  // All fill types that accept random data (vs fixed values)
  const RANDOM_FILLABLE_TYPES = [
    'name', 'email', 'phone', 'address', 'company', 'password', 'url',
    'date', 'birthDate', 'number', 'nid', 'textarea', 'select', 'text'
  ];

  // All fill types that can have exact values filled
  const EXACT_VALUE_TYPES = [
    'name', 'email', 'phone', 'address', 'company', 'password', 'url',
    'date', 'birthDate', 'number', 'nid', 'textarea', 'text', 'skip'
  ];

  // Validate if a fill type is allowed
  function isValidFillType(fillType) {
    return FIELD_TYPES.includes(fillType);
  }

  // Check if fill type accepts random data generation
  function isRandomFillable(fillType) {
    return RANDOM_FILLABLE_TYPES.includes(fillType);
  }

  // Check if fill type accepts exact values
  function isExactValueFillable(fillType) {
    return EXACT_VALUE_TYPES.includes(fillType);
  }

  // Get all allowed fill types as options array for UI
  function getFieldTypeOptions() {
    return FIELD_TYPES.map(type => ({
      value: type,
      label: capitalizeFirst(type),
    }));
  }

  function capitalizeFirst(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Normalize fill type (case insensitive)
  function normalizeFillType(fillType) {
    if (!fillType || typeof fillType !== 'string') return null;
    const normalized = fillType.toLowerCase().trim();
    return FIELD_TYPES.includes(normalized) ? normalized : null;
  }

  const api = {
    FIELD_TYPES,
    FIELD_TYPE_GROUPS,
    RANDOM_FILLABLE_TYPES,
    EXACT_VALUE_TYPES,
    isValidFillType,
    isRandomFillable,
    isExactValueFillable,
    getFieldTypeOptions,
    normalizeFillType,
  };

  if (typeof window !== 'undefined') {
    window.__BengaliFieldTypes__ = api;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();