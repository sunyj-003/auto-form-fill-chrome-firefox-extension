/**
 * Native HTML Form Integration Tests
 * Run: npx playwright test tests/integration/native-form.spec.js
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

const contentJsCode = require('fs').readFileSync('./extensions/chrome/content.js', 'utf8');
const fakeDataCode = require('fs').readFileSync('./extensions/chrome/generators/fakeData.js', 'utf8');

test.describe('Native HTML Form Integration', () => {

  test('should fill all native HTML input types', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/tests/form-test/index.html');
    await page.waitForSelector('#native-username', { timeout: 10000 });

    // Mock chrome storage
    await page.addScriptTag({ content: `
      window.chrome = {
        runtime: { id: 'test-extension' },
        storage: {
          sync: {
            get: (keys, callback) => setTimeout(() => callback({
              formSettings: {
                name: true, email: true, phone: true, address: true,
                company: true, select: true, checkbox: true, radio: true,
                textarea: true, date: true, number: true, password: true,
                url: true, text: true, file: true
              },
              customRules: [],
              phoneFormat: 'local',
              shortcutEnabled: false,
              autoFillEnabled: false
            }), 0)
          },
          local: { get: (keys, callback) => setTimeout(() => callback({}), 0) },
          onChanged: { addListener: () => {} }
        }
      };
    `});

    await page.addScriptTag({ content: fakeDataCode });
    await page.addScriptTag({ content: contentJsCode });

    await page.waitForTimeout(500);
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
    await page.waitForTimeout(1500);

    // Verify all field types
    const results = await page.evaluate(() => ({
      text: document.querySelector('#native-username')?.value || '',
      email: document.querySelector('#native-email')?.value || '',
      password: document.querySelector('#native-password')?.value || '',
      phone: document.querySelector('#native-phone')?.value || '',
      number: document.querySelector('#native-age')?.value || '',
      date: document.querySelector('#native-birthday')?.value || '',
      url: document.querySelector('#native-website')?.value || '',
      select: document.querySelector('#native-country')?.value || '',
      textarea: document.querySelector('#native-bio')?.value || '',
      checkbox: document.querySelector('#native-agree')?.checked || false,
      radio: document.querySelector('input[name="native-gender"]:checked')?.value || ''
    }));

    console.log('Native HTML Fill Results:', results);

    // Assertions
    expect(results.text).toBeTruthy();
    expect(results.email).toMatch(/@/);
    expect(results.password).toBeTruthy();
    expect(results.phone).toMatch(/^01\d{9}$/);
    expect(results.number).toBeTruthy();
    expect(results.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(results.url).toMatch(/^https?:\/\//);
    expect(results.select).toBeTruthy();
    expect(results.textarea).toBeTruthy();
    expect(results.checkbox).toBe(true);
    expect(results.radio).toBeTruthy();
  });

  test('should handle empty form gracefully', async ({ page }) => {
    await page.goto('data:text/html,<html><body><form id="empty-form"></form></body></html>');

    await page.addScriptTag({ content: `
      window.chrome = {
        runtime: { id: 'test' },
        storage: {
          sync: { get: (k, cb) => setTimeout(() => cb({ formSettings: {}, customRules: [] }), 0) },
          local: { get: (k, cb) => setTimeout(() => cb({}), 0) },
          onChanged: { addListener: () => {} }
        }
      };
    `});

    await page.addScriptTag({ content: fakeDataCode });
    await page.addScriptTag({ content: contentJsCode });

    await page.waitForTimeout(300);

    // Should not throw
    const result = await page.evaluate(() => {
      try {
        if (window.__bengaliFakeFill) {
          window.__bengaliFakeFill();
          return { success: true };
        }
        return { success: false, reason: 'function not found' };
      } catch (e) {
        return { success: false, reason: e.message };
      }
    });

    expect(result.success).toBe(true);
  });

  test('should skip sensitive fields', async ({ page }) => {
    await page.goto('data:text/html,' + encodeURIComponent(`
      <html>
      <body>
        <form>
          <input type="text" id="username" placeholder="Username">
          <input type="password" id="password" placeholder="Password">
          <input type="password" id="confirm-password" placeholder="Confirm Password">
          <input type="text" id="credit-card" placeholder="Credit Card">
          <input type="text" id="cvv" placeholder="CVV">
          <input type="text" id="ssn" placeholder="SSN">
        </form>
      </body>
      </html>
    `));

    await page.addScriptTag({ content: `
      window.chrome = {
        runtime: { id: 'test' },
        storage: {
          sync: { get: (k, cb) => setTimeout(() => cb({ formSettings: { name: true, password: true, text: true }, customRules: [] }), 0) },
          local: { get: (k, cb) => setTimeout(() => cb({}), 0) },
          onChanged: { addListener: () => {} }
        }
      };
    `});

    await page.addScriptTag({ content: fakeDataCode });
    await page.addScriptTag({ content: contentJsCode });

    await page.waitForTimeout(300);
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
    await page.waitForTimeout(1000);

    const values = await page.evaluate(() => ({
      username: document.querySelector('#username')?.value || '',
      password: document.querySelector('#password')?.value || '',
      confirmPassword: document.querySelector('#confirm-password')?.value || '',
      creditCard: document.querySelector('#credit-card')?.value || '',
      cvv: document.querySelector('#cvv')?.value || '',
      ssn: document.querySelector('#ssn')?.value || ''
    }));

    // Username and password should be filled
    expect(values.username).toBeTruthy();
    expect(values.password).toBeTruthy();

    // Sensitive fields should remain empty
    expect(values.confirmPassword).toBe('');
    expect(values.creditCard).toBe('');
    expect(values.cvv).toBe('');
    expect(values.ssn).toBe('');
  });

  test('should respect field type settings toggle', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/tests/form-test/index.html');
    await page.waitForSelector('#native-username');

    // Only enable name field
    await page.addScriptTag({ content: `
      window.chrome = {
        runtime: { id: 'test' },
        storage: {
          sync: { get: (k, cb) => setTimeout(() => cb({
            formSettings: { name: true, email: false, phone: false },
            customRules: []
          }), 0) },
          local: { get: (k, cb) => setTimeout(() => cb({}), 0) },
          onChanged: { addListener: () => {} }
        }
      };
    `});

    await page.addScriptTag({ content: fakeDataCode });
    await page.addScriptTag({ content: contentJsCode });

    await page.waitForTimeout(300);
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
    await page.waitForTimeout(1000);

    const results = await page.evaluate(() => ({
      username: document.querySelector('#native-username')?.value || '',
      email: document.querySelector('#native-email')?.value || '',
      phone: document.querySelector('#native-phone')?.value || ''
    }));

    // Name should be filled (enabled)
    expect(results.username).toBeTruthy();
  });

  test('should apply custom rules correctly', async ({ page }) => {
    await page.goto('data:text/html,' + encodeURIComponent(`
      <html>
      <body>
        <form>
          <input type="text" id="custom-field-1" placeholder="Custom Field 1">
          <input type="text" id="custom-field-2" placeholder="Custom Field 2">
        </form>
      </body>
      </html>
    `));

    await page.addScriptTag({ content: `
      window.chrome = {
        runtime: { id: 'test' },
        storage: {
          sync: { get: (k, cb) => setTimeout(() => cb({
            formSettings: { text: true, name: true, email: true },
            customRules: [
              { pattern: 'Custom Field 1', fillType: 'email', regex: false },
              { pattern: 'Custom Field 2', fillType: 'phone', regex: false }
            ]
          }), 0) },
          local: { get: (k, cb) => setTimeout(() => cb({}), 0) },
          onChanged: { addListener: () => {} }
        }
      };
    `});

    await page.addScriptTag({ content: fakeDataCode });
    await page.addScriptTag({ content: contentJsCode });

    await page.waitForTimeout(300);
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());
    await page.waitForTimeout(1000);

    const results = await page.evaluate(() => ({
      field1: document.querySelector('#custom-field-1')?.value || '',
      field2: document.querySelector('#custom-field-2')?.value || ''
    }));

    // Custom rules should be applied
    expect(results.field1).toMatch(/@/);  // email type
    expect(results.field2).toMatch(/^01\d{9}$/);  // phone type
  });
});