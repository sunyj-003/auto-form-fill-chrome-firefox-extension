/**
 * Field Detection Unit Tests
 * Run: node tests/unit/field-detection.test.js
 */

const {
  SENSITIVE_FIELDS,
  DETECTION_PRIORITY,
  isSensitiveField,
  getDetectionPriority,
  sortByPriority,
  inferFromType,
  extractLabel,
} = require('./field-detection');

describe('Field Detection', () => {
  describe('SENSITIVE_FIELDS', () => {
    test('should have sensitive field patterns defined', () => {
      expect(SENSITIVE_FIELDS.length).toBeGreaterThan(0);
      SENSITIVE_FIELDS.forEach(field => {
        expect(field.pattern).toBeInstanceOf(RegExp);
        expect(field.field).toBe('skip');
        expect(field.reason).toBeDefined();
      });
    });

    test('should detect password confirmation', () => {
      const result = isSensitiveField('confirm password');
      expect(result.skip).toBe(true);
      expect(result.reason).toBe('Password confirmation');
    });

    test('should detect credit card', () => {
      const result = isSensitiveField('credit card number');
      expect(result.skip).toBe(true);
      expect(result.reason).toBe('Credit card');
    });

    test('should detect CVV', () => {
      const result = isSensitiveField('cvv code');
      expect(result.skip).toBe(true);
      expect(result.reason).toBe('CVV');
    });

    test('should detect SSN', () => {
      const result = isSensitiveField('social security number ssn');
      expect(result.skip).toBe(true);
      expect(result.reason).toBe('Social Security');
    });

    test('should not flag normal fields', () => {
      const result = isSensitiveField('first name username email');
      expect(result.skip).toBe(false);
    });
  });

  describe('DETECTION_PRIORITY', () => {
    test('should have all priority levels defined', () => {
      expect(DETECTION_PRIORITY.CUSTOM_RULE).toBe(100);
      expect(DETECTION_PRIORITY.LABEL).toBe(80);
      expect(DETECTION_PRIORITY.PLACEHOLDER).toBe(80);
      expect(DETECTION_PRIORITY.ID).toBe(60);
      expect(DETECTION_PRIORITY.NAME).toBe(60);
      expect(DETECTION_PRIORITY.ARIA_LABEL).toBe(60);
      expect(DETECTION_PRIORITY.TYPE).toBe(40);
      expect(DETECTION_PRIORITY.AUTO_INFER).toBe(20);
    });

    test('should prioritize custom rules over labels', () => {
      expect(DETECTION_PRIORITY.CUSTOM_RULE).toBeGreaterThan(DETECTION_PRIORITY.LABEL);
    });

    test('should prioritize labels over id/name', () => {
      expect(DETECTION_PRIORITY.LABEL).toBeGreaterThan(DETECTION_PRIORITY.ID);
    });
  });

  describe('getDetectionPriority()', () => {
    test('should return priority for known types', () => {
      expect(getDetectionPriority('CUSTOM_RULE')).toBe(100);
      expect(getDetectionPriority('LABEL')).toBe(80);
      expect(getDetectionPriority('ID')).toBe(60);
      expect(getDetectionPriority('TYPE')).toBe(40);
    });

    test('should return AUTO_INFER for unknown types', () => {
      expect(getDetectionPriority('UNKNOWN')).toBe(20);
      expect(getDetectionPriority('')).toBe(20);
      expect(getDetectionPriority(null)).toBe(20);
    });
  });

  describe('sortByPriority()', () => {
    test('should sort sources by priority descending', () => {
      const sources = [
        { type: 'ID', value: 'test' },
        { type: 'CUSTOM_RULE', value: 'test' },
        { type: 'LABEL', value: 'test' },
      ];
      const sorted = sortByPriority([...sources]);
      expect(sorted[0].type).toBe('CUSTOM_RULE');
      expect(sorted[1].type).toBe('LABEL');
      expect(sorted[2].type).toBe('ID');
    });

    test('should handle empty array', () => {
      const sorted = sortByPriority([]);
      expect(sorted).toEqual([]);
    });

    test('should handle single element', () => {
      const sorted = sortByPriority([{ type: 'ID', value: 'test' }]);
      expect(sorted.length).toBe(1);
    });
  });

  describe('inferFromType()', () => {
    test('should infer email type', () => {
      expect(inferFromType({ type: 'email' })).toBe('email');
    });

    test('should infer phone type', () => {
      expect(inferFromType({ type: 'tel' })).toBe('phone');
    });

    test('should infer password type', () => {
      expect(inferFromType({ type: 'password' })).toBe('password');
    });

    test('should infer url type', () => {
      expect(inferFromType({ type: 'url' })).toBe('url');
    });

    test('should infer number type', () => {
      expect(inferFromType({ type: 'number' })).toBe('number');
    });

    test('should infer date types', () => {
      expect(inferFromType({ type: 'date' })).toBe('date');
      expect(inferFromType({ type: 'datetime-local' })).toBe('date');
      expect(inferFromType({ type: 'time' })).toBe('date');
      expect(inferFromType({ type: 'month' })).toBe('date');
      expect(inferFromType({ type: 'week' })).toBe('date');
    });

    test('should infer checkbox type', () => {
      expect(inferFromType({ type: 'checkbox' })).toBe('checkbox');
    });

    test('should infer radio type', () => {
      expect(inferFromType({ type: 'radio' })).toBe('radio');
    });

    test('should infer file type', () => {
      expect(inferFromType({ type: 'file' })).toBe('file');
    });

    test('should infer text for search', () => {
      expect(inferFromType({ type: 'search' })).toBe('text');
    });

    test('should default to text', () => {
      expect(inferFromType({ type: 'text' })).toBe('text');
      expect(inferFromType({ type: 'unknown' })).toBe('text');
      expect(inferFromType({})).toBe('text');
      expect(inferFromType(null)).toBe('text');
      expect(inferFromType(undefined)).toBe('text');
    });
  });

  describe('extractLabel()', () => {
    test('should return empty string for null element', () => {
      expect(extractLabel(null)).toBe('');
    });

    test('should return empty string for undefined element', () => {
      expect(extractLabel(undefined)).toBe('');
    });

    test('should check aria-label attribute', () => {
      const el = {
        getAttribute: () => 'Test Label',
        id: '',
        previousElementSibling: null,
        closest: () => null
      };
      expect(extractLabel(el)).toBe('Test Label');
    });

    test('should check previousElementSibling label', () => {
      const labelEl = { textContent: ' Previous Label ', tagName: 'LABEL' };
      const el = {
        getAttribute: () => null,
        id: '',
        previousElementSibling: labelEl,
        closest: () => null
      };
      expect(extractLabel(el)).toBe('Previous Label');
    });

    test('should trim whitespace from label text', () => {
      const labelEl = { textContent: '  Whitespace  ', tagName: 'LABEL' };
      const el = {
        getAttribute: () => null,
        id: '',
        previousElementSibling: labelEl,
        closest: () => null
      };
      expect(extractLabel(el)).toBe('Whitespace');
    });
  });
});