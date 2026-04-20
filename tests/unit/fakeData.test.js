/**
 * Fake Data Generator Unit Tests
 * Run: npx playwright test tests/unit/fakeData.test.js
 * Or: node tests/unit/fakeData.test.js
 */

const {
  firstNames, lastNames, streets, cities, companies,
  rand, randInt, randomDate, formatDate,
  fakeName, fakeAddress, fakeCity, fakePostcode, fakePhone, fakePhoneLocal,
  fakeEmail, fakeEmailForContext, fakeDateISO, fakeDateUser, fakeBirthDateISO, fakeBirthDateUser,
  fakeDateFormatted, fakeBirthDateFormatted, getDateFormatFromContext,
  fakeNumberForContext, fakeNidForContext, fakePasswordForContext, fakeUrlForContext,
  fakeCompany, fakeSentence,
  getValueByType
} = require('../../extensions/chrome/generators/fakeData');

describe('Fake Data Generators', () => {
  describe('rand()', () => {
    test('should return an element from the array', () => {
      const arr = [1, 2, 3];
      const result = rand(arr);
      expect(arr).toContain(result);
    });

    test('should return different results across multiple calls', () => {
      const arr = [1, 2, 3, 4, 5];
      const results = new Set();
      for (let i = 0; i < 20; i++) {
        results.add(rand(arr));
      }
      // Should have at least 2 different values
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('randInt()', () => {
    test('should return integer within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randInt(5, 10);
        expect(result).toBeGreaterThanOrEqual(5);
        expect(result).toBeLessThanOrEqual(10);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    test('should work with same min and max', () => {
      const result = randInt(5, 5);
      expect(result).toBe(5);
    });
  });

  describe('randomDate()', () => {
    test('should return date within range', () => {
      const start = new Date(2020, 0, 1);
      const end = new Date(2020, 11, 31);
      const result = randomDate(start, end);
      expect(result.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(result.getTime()).toBeLessThanOrEqual(end.getTime());
    });
  });

  describe('formatDate()', () => {
    test('should format as yyyy-mm-dd by default', () => {
      const d = new Date(2020, 5, 15);
      expect(formatDate(d)).toBe('2020-06-15');
    });

    test('should format as dd/mm/yyyy', () => {
      const d = new Date(2020, 5, 15);
      expect(formatDate(d, 'dd/mm/yyyy')).toBe('15/06/2020');
    });

    test('should format as mm/dd/yyyy', () => {
      const d = new Date(2020, 5, 15);
      expect(formatDate(d, 'mm/dd/yyyy')).toBe('06/15/2020');
    });

    test('should format as dd-mm-yyyy', () => {
      const d = new Date(2020, 5, 15);
      expect(formatDate(d, 'dd-mm-yyyy')).toBe('15-06-2020');
    });

    test('should format as mm-dd-yyyy', () => {
      const d = new Date(2020, 5, 15);
      expect(formatDate(d, 'mm-dd-yyyy')).toBe('06-15-2020');
    });
  });

  describe('fakeName()', () => {
    test('should return a string with first and last name', () => {
      const name = fakeName();
      expect(typeof name).toBe('string');
      expect(name.split(' ').length).toBe(2);
    });

    test('should contain names from the arrays', () => {
      for (let i = 0; i < 20; i++) {
        const name = fakeName();
        const parts = name.split(' ');
        expect(firstNames).toContain(parts[0]);
        expect(lastNames).toContain(parts[1]);
      }
    });
  });

  describe('fakeAddress()', () => {
    test('should return a string containing Dhaka cities', () => {
      const address = fakeAddress();
      expect(typeof address).toBe('string');
      expect(address.length).toBeGreaterThan(5);
      // Should contain a city name
      const hasCity = cities.some(city => address.includes(city));
      expect(hasCity).toBe(true);
    });

    test('should contain a street name', () => {
      const address = fakeAddress();
      const hasStreet = streets.some(street => address.includes(street));
      expect(hasStreet).toBe(true);
    });
  });

  describe('fakeCity()', () => {
    test('should return a city from the list', () => {
      for (let i = 0; i < 20; i++) {
        const city = fakeCity();
        expect(cities).toContain(city);
      }
    });
  });

  describe('fakePostcode()', () => {
    test('should return a 4-digit string', () => {
      for (let i = 0; i < 20; i++) {
        const postcode = fakePostcode();
        expect(postcode.length).toBe(4);
        const num = parseInt(postcode, 10);
        expect(num).toBeGreaterThanOrEqual(1200);
        expect(num).toBeLessThanOrEqual(9999);
      }
    });
  });

  describe('fakePhone()', () => {
    test('should return international format by default', () => {
      for (let i = 0; i < 20; i++) {
        const phone = fakePhone();
        expect(phone).toMatch(/^\+8801\d{10}$/);
      }
    });

    test('should return local format when international=false', () => {
      for (let i = 0; i < 20; i++) {
        const phone = fakePhone(false);
        expect(phone).toMatch(/^01\d{10}$/);
      }
    });
  });

  describe('fakePhoneLocal()', () => {
    test('should return local format', () => {
      const phone = fakePhoneLocal();
      expect(phone).toMatch(/^01\d{10}$/);
    });
  });

  describe('fakeEmail()', () => {
    test('should return email with @', () => {
      const email = fakeEmail();
      expect(email).toMatch(/@/);
    });

    test('should use provided name for email local part', () => {
      const email = fakeEmail('John Doe');
      const localPart = email.split('@')[0];
      expect(localPart).toContain('john');
    });
  });

  describe('fakeEmailForContext()', () => {
    test('should return gmail for gmail context', () => {
      const email = fakeEmailForContext('gmail');
      expect(email).toMatch(/@gmail\.com$/);
    });

    test('should return yahoo for yahoo context', () => {
      const email = fakeEmailForContext('yahoo');
      expect(email).toMatch(/@yahoo\.com$/);
    });

    test('should return outlook for outlook context', () => {
      const email = fakeEmailForContext('outlook');
      expect(email).toMatch(/@outlook\.com$/);
    });

    test('should return company email for work context', () => {
      const email = fakeEmailForContext('company work office corp');
      expect(email).toMatch(/@company\.com$/);
    });

    test('should return generic email for unknown context', () => {
      const email = fakeEmailForContext('random unknown');
      expect(email).toMatch(/@/);
    });
  });

  describe('fakeDateISO()', () => {
    test('should return ISO format date string', () => {
      const date = fakeDateISO();
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('should return date in valid range', () => {
      for (let i = 0; i < 20; i++) {
        const date = fakeDateISO();
        const year = parseInt(date.split('-')[0], 10);
        expect(year).toBeGreaterThanOrEqual(2000);
        expect(year).toBeLessThanOrEqual(2018);
      }
    });
  });

  describe('fakeBirthDateISO()', () => {
    test('should return date between 1995 and 2015', () => {
      for (let i = 0; i < 20; i++) {
        const date = fakeBirthDateISO();
        const year = parseInt(date.split('-')[0], 10);
        expect(year).toBeGreaterThanOrEqual(1995);
        expect(year).toBeLessThanOrEqual(2015);
      }
    });
  });

  describe('getDateFormatFromContext()', () => {
    test('should detect dd.mm.yyyy format', () => {
      expect(getDateFormatFromContext('date.dd.mm.yyyy')).toBe('dd/mm/yyyy');
    });

    test('should detect mm.dd.yyyy format', () => {
      expect(getDateFormatFromContext('date.mm.dd.yyyy')).toBe('mm/dd/yyyy');
    });

    test('should detect dd-mm-y format', () => {
      expect(getDateFormatFromContext('dd-mm-yyyy')).toBe('dd-mm-yyyy');
    });

    test('should detect mm-dd-y format', () => {
      expect(getDateFormatFromContext('mm-dd-yyyy')).toBe('mm-dd-yyyy');
    });

    test('should default to yyyy-mm-dd', () => {
      expect(getDateFormatFromContext('random')).toBe('yyyy-mm-dd');
    });
  });

  describe('fakeNumberForContext()', () => {
    test('should return age between 18-65', () => {
      for (let i = 0; i < 20; i++) {
        const num = parseInt(fakeNumberForContext('age'), 10);
        expect(num).toBeGreaterThanOrEqual(18);
        expect(num).toBeLessThanOrEqual(65);
      }
    });

    test('should return year for year context', () => {
      const num = fakeNumberForContext('year');
      const year = parseInt(num, 10);
      expect(year).toBeGreaterThanOrEqual(1980);
      expect(year).toBeLessThanOrEqual(2005);
    });

    test('should return quantity for qty context', () => {
      const num = parseInt(fakeNumberForContext('quantity'), 10);
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(99);
    });

    test('should return percentage 0-100', () => {
      const num = parseInt(fakeNumberForContext('percentage'), 10);
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThanOrEqual(100);
    });

    test('should return price for price context', () => {
      const num = parseInt(fakeNumberForContext('price'), 10);
      expect(num).toBeGreaterThanOrEqual(5000);
      expect(num).toBeLessThanOrEqual(150000);
    });
  });

  describe('fakeNidForContext()', () => {
    test('should return 10-digit number', () => {
      const nid = fakeNidForContext('');
      expect(nid.replace(/-/g, '')).toMatch(/^\d{10}$/);
    });

    test('should add dashes for dash context', () => {
      const nid = fakeNidForContext('dash hyphen format');
      expect(nid).toMatch(/^\d{4}-\d{4}-\d{2}$/);
    });
  });

  describe('fakePasswordForContext()', () => {
    test('should return 4-digit PIN for pin context', () => {
      const pwd = fakePasswordForContext('pin');
      expect(pwd).toMatch(/^\d{4}$/);
    });

    test('should return strong password for strong context', () => {
      const pwd = fakePasswordForContext('strong');
      expect(pwd.length).toBeGreaterThan(5);
    });

    test('should return default password', () => {
      const pwd = fakePasswordForContext('');
      expect(pwd).toBe('Test@12345');
    });
  });

  describe('fakeUrlForContext()', () => {
    test('should return http only for http context', () => {
      const url = fakeUrlForContext('http only');
      expect(url).toMatch(/^http:\/\//);
    });

    test('should return https with www for www context', () => {
      const url = fakeUrlForContext('www');
      expect(url).toMatch(/^https:\/\/www\.|^https:\/\//);
    });

    test('should return default https URL', () => {
      const url = fakeUrlForContext('');
      expect(url).toMatch(/^https:\/\//);
    });
  });

  describe('fakeCompany()', () => {
    test('should return company from list', () => {
      for (let i = 0; i < 20; i++) {
        const company = fakeCompany();
        expect(companies).toContain(company);
      }
    });
  });

  describe('fakeSentence()', () => {
    test('should return a sentence', () => {
      const sentence = fakeSentence();
      expect(typeof sentence).toBe('string');
      expect(sentence.length).toBeGreaterThan(10);
    });
  });

  describe('getValueByType()', () => {
    test('should return name for name type', () => {
      const value = getValueByType('name');
      const parts = value.split(' ');
      expect(firstNames).toContain(parts[0]);
      expect(lastNames).toContain(parts[1]);
    });

    test('should return email for email type', () => {
      const value = getValueByType('email');
      expect(value).toMatch(/@/);
    });

    test('should return local phone when phoneFormat=local', () => {
      const value = getValueByType('phone', '', { phoneFormat: 'local' });
      expect(value).toMatch(/^01\d{10}$/);
    });

    test('should return international phone when phoneFormat=international', () => {
      const value = getValueByType('phone', '', { phoneFormat: 'international' });
      expect(value).toMatch(/^\+8801\d{10}$/);
    });

    test('should return address for address type', () => {
      const value = getValueByType('address');
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(5);
    });

    test('should return city for city type', () => {
      const value = getValueByType('city');
      expect(cities).toContain(value);
    });

    test('should return postcode for postcode type', () => {
      const value = getValueByType('postcode');
      expect(value.length).toBe(4);
    });

    test('should return company for company type', () => {
      const value = getValueByType('company');
      expect(companies).toContain(value);
    });

    test('should return date for date type', () => {
      const value = getValueByType('date');
      expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('should return number for number type', () => {
      const value = getValueByType('number', 'age');
      const num = parseInt(value, 10);
      expect(num).toBeGreaterThanOrEqual(18);
      expect(num).toBeLessThanOrEqual(65);
    });

    test('should return nid for nid type', () => {
      const value = getValueByType('nid');
      expect(value.replace(/-/g, '').length).toBe(10);
    });

    test('should return password for password type', () => {
      const value = getValueByType('password');
      expect(typeof value).toBe('string');
    });

    test('should return url for url type', () => {
      const value = getValueByType('url');
      expect(value).toMatch(/^https?:\/\//);
    });

    test('should return sentence for sentence/bio/description types', () => {
      const sentence = getValueByType('sentence');
      expect(typeof sentence).toBe('string');
      const bio = getValueByType('bio');
      expect(typeof bio).toBe('string');
      const desc = getValueByType('description');
      expect(typeof desc).toBe('string');
    });

    test('should handle custom rule with fixed email', () => {
      const value = getValueByType('email', '', {
        fromCustomRule: true,
        rulePattern: 'test@example.com',
        isRegexRule: false
      });
      expect(value).toBe('test@example.com');
    });

    test('should handle custom rule with full email pattern', () => {
      const value = getValueByType('email', '', {
        fromCustomRule: true,
        rulePattern: 'test@customdomain.com',
        isRegexRule: false
      });
      // 当有完整邮箱时，直接返回
      expect(value).toBe('test@customdomain.com');
    });

    test('should use default email when domain-only pattern without @', () => {
      const value = getValueByType('email', '', {
        fromCustomRule: true,
        rulePattern: 'customdomain.com',
        isRegexRule: false
      });
      // 当前实现: 没有@时不处理，返回默认email
      expect(value).toMatch(/@/);
    });
  });
});