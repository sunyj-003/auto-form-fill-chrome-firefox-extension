const storage = require('../../extensions/chrome/core/storage');

describe('storage excluded sites', () => {
  test('normalizes plain hosts and URL inputs', () => {
    expect(storage.normalizeExcludedSites([
      ' Example.com ',
      'https://sub.example.com/path?q=1',
      '*.demo.test',
      'demo.test/settings',
    ])).toEqual([
      'example.com',
      'sub.example.com',
      'demo.test',
    ]);
  });

  test('matches exact host and subdomains only', () => {
    expect(storage.isSiteExcluded('https://example.com/form', ['example.com'])).toBe(true);
    expect(storage.isSiteExcluded('https://app.example.com/form', ['example.com'])).toBe(true);
    expect(storage.isSiteExcluded('https://notexample.com/form', ['example.com'])).toBe(false);
    expect(storage.isSiteExcluded('https://fake-example.com/form', ['example.com'])).toBe(false);
  });

  test('does not match partial sibling hosts', () => {
    expect(storage.isSiteExcluded('https://ample.com/form', ['example.com'])).toBe(false);
    expect(storage.isSiteExcluded('https://example.co/form', ['example.com'])).toBe(false);
  });
});
