function installFakeData() {
  window.__BengaliFakeFillData__ = {
    rand: (arr) => arr[0],
    firstNames: ['Ada'],
    lastNames: ['Lovelace'],
    fakeName: () => 'Ada Lovelace',
    fakeAddress: () => '1 Test Road',
    fakeCity: () => 'Dhaka',
    fakePostcode: () => '1207',
    fakePhone: () => '+8801712345678',
    fakePhoneLocal: () => '01712345678',
    fakeEmail: () => 'user@example.com',
    fakeEmailForContext: () => 'user@example.com',
    fakeDateISO: () => '2024-01-02',
    fakeDateUser: () => '2024-01-02',
    fakeBirthDateISO: () => '1990-01-02',
    fakeBirthDateUser: () => '1990-01-02',
    fakeDateFormatted: () => '2024-01-02',
    fakeBirthDateFormatted: () => '1990-01-02',
    getDateFormatFromContext: () => 'YYYY-MM-DD',
    fakeNumberForContext: () => '42',
    fakeNidForContext: () => '1234567890',
    fakePasswordForContext: () => 'Password123!',
    fakeUrlForContext: () => 'https://example.com',
    fakeCompany: () => 'Test Company',
    fakeSentence: () => 'Test sentence',
    getValueByType: () => '',
  };
}

describe('fill.js', () => {
  let fill;

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '';
    installFakeData();
    require('../../extensions/chrome/core/context');
    require('../../extensions/chrome/core/events');
    fill = require('../../extensions/chrome/core/fill');
  });

  afterEach(() => {
    delete window.__BengaliFakeFillData__;
    delete window.__BengaliContext__;
    delete window.__BengaliEvents__;
    delete window.__BengaliFill__;
  });

  test('detects runtime numeric constraints on text inputs', () => {
    document.body.innerHTML = '<input id="generic" type="text" placeholder="请输入" />';
    const el = document.getElementById('generic');

    el.addEventListener('input', () => {
      el.value = el.value.replace(/\D/g, '');
    });

    const result = fill.detectInputConstraint(el);

    expect(result.kind).toBe('numeric');
    expect(result.source).toBe('runtime-probe');
    expect(result.mode).toBe('integer');
  });

  test('detects decimal constraints on text inputs', () => {
    document.body.innerHTML = '<input id="temp" type="text" placeholder="请输入" />';
    const el = document.getElementById('temp');

    el.addEventListener('input', () => {
      const match = String(el.value || '').match(/\d+(?:\.\d+)?/);
      el.value = match ? match[0] : '';
    });

    const result = fill.detectInputConstraint(el);

    expect(result.kind).toBe('numeric');
    expect(result.mode).toBe('decimal');
  });

  test('formats numeric values according to runtime mode', () => {
    expect(fill.formatNumericForConstraint('体温(口腔）', { mode: 'decimal' })).toBe('36.5');
    expect(fill.formatNumericForConstraint('血压', { mode: 'composite' })).toBe('120/80');
    expect(fill.formatNumericForConstraint('年龄', { mode: 'integer' })).toBe('42');
  });

  test('formats date values to the accepted runtime shape', () => {
    expect(fill.formatDateForConstraint('2024-01')).toMatch(/^\d{4}-\d{2}$/);
    expect(fill.formatDateForConstraint('2024/01')).toMatch(/^\d{4}\/\d{2}$/);
    expect(fill.formatDateForConstraint('202401')).toMatch(/^\d{6}$/);
    expect(fill.formatDateForConstraint('2024-01-02')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(fill.formatDateForConstraint('2024/01/02')).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    expect(fill.formatDateForConstraint('20240102')).toMatch(/^\d{8}$/);
  });

  test('detects runtime date constraints on text inputs', () => {
    document.body.innerHTML = '<input id="date-like" type="text" placeholder="日期" />';
    const el = document.getElementById('date-like');

    el.addEventListener('input', () => {
      const cleaned = String(el.value || '').replace(/[^\d-]/g, '').slice(0, 10);
      const m = cleaned.match(/^(\d{0,4})(?:-?(\d{0,2}))?(?:-?(\d{0,2}))?$/);
      if (!m) {
        el.value = '';
        return;
      }
      const [, y = '', mm = '', dd = ''] = m;
      const first = y;
      const second = mm ? `-${mm}` : '';
      const third = dd ? `-${dd}` : '';
      el.value = `${first}${second}${third}`;
    });

    const result = fill.detectInputConstraint(el);
    expect(result.kind).toBe('date');
    expect(result.source).toBe('runtime-probe');
  });

  test('skips low-confidence generic text inputs', () => {
    document.body.innerHTML = '<input id="generic" type="text" placeholder="请输入" />';
    const el = document.getElementById('generic');

    fill.guessAndFillInput(el, () => true, []);

    expect(el.value).toBe('');
  });

  test('fills runtime-constrained numeric text inputs with numeric data', () => {
    document.body.innerHTML = '<input id="generic" type="text" placeholder="请输入" />';
    const el = document.getElementById('generic');

    el.addEventListener('input', () => {
      el.value = el.value.replace(/\D/g, '');
    });

    fill.guessAndFillInput(el, () => true, []);

    expect(el.value).toBe('42');
  });
});
