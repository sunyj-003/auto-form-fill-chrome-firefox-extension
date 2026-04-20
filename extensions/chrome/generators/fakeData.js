/**
 * 假数据生成器模块 (Generators)
 * 供 content.js 和各框架适配器共享使用
 */

const firstNames = [
  "Rahim", "Karim", "Jamal", "Kamal", "Shamim", "Rafiq", "Nazmul", "Faruk", "Imran", "Sajid",
  "Ayesha", "Sharmin", "Shamima", "Farhana", "Nusrat", "Jannat", "Mahi", "Runa", "Salma", "Rashida"
];
const lastNames = [
  "Uddin", "Ahmed", "Islam", "Hossain", "Rahman", "Chowdhury", "Miah", "Sarkar", "Talukder", "Biswas"
];
const streets = [
  "Mirpur Road", "Dhanmondi 27", "Banani 11", "Gulshan 2", "Uttara Sector 4",
  "Chawk Bazar", "Agrabad", "Kumarpara", "Zindabazar", "New Market Road"
];
const cities = ["Dhaka", "Chattogram", "Sylhet", "Khulna", "Rajshahi", "Barishal", "Rangpur", "Mymensingh"];
const companies = [
  "Dhaka Soft Ltd", "Bangla Tech Solutions", "Padma Group", "Jamdani IT", "Sundarban Logistics"
];

/* --- 工具函数 --- */
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

/* --- 日期生成 --- */
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(d, format) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  if (format === "dd/mm/yyyy") return day + "/" + m + "/" + y;
  if (format === "mm/dd/yyyy") return m + "/" + day + "/" + y;
  if (format === "dd-mm-yyyy") return day + "-" + m + "-" + y;
  if (format === "mm-dd-yyyy") return m + "-" + day + "-" + y;
  return y + "-" + m + "-" + day;
}

/* --- 导出函数 --- */

function fakeName() { return rand(firstNames) + " " + rand(lastNames); }

function fakeAddress() { return randInt(10, 999) + " " + rand(streets) + ", " + rand(cities); }

function fakeCity() { return rand(cities); }

function fakePostcode() { return String(randInt(1200, 9999)); }

function fakePhone(international = true) {
  const ops = ["13", "14", "15", "16", "17", "18", "19"];
  const op = rand(ops);
  let rest = "";
  for (let i = 0; i < 8; i++) rest += randInt(0, 9);
  return international ? "+8801" + op + rest.substring(0, 8) : "01" + op + rest.substring(0, 8);
}

function fakePhoneLocal() { return fakePhone(false); }

function fakeEmail(name) {
  const clean = (name || fakeName()).toLowerCase().replace(/[^a-z]/g, ".");
  const domains = ["mail.com", "example.com", "bdmail.com", "demo.net"];
  return (clean || "user") + randInt(10, 999) + "@" + rand(domains);
}

function fakeEmailForContext(ctx) {
  const name = fakeName();
  const clean = name.toLowerCase().replace(/[^a-z]/g, ".");
  const base = (clean || "user") + randInt(10, 999);
  if (/gmail/i.test(ctx)) return base + "@gmail.com";
  if (/yahoo/i.test(ctx)) return base + "@yahoo.com";
  if (/outlook|hotmail|live|msn/i.test(ctx)) return base + "@outlook.com";
  if (/icloud|apple/i.test(ctx)) return base + "@icloud.com";
  if (/proton/i.test(ctx)) return base + "@protonmail.com";
  if (/company|work|office|corp/i.test(ctx)) return base + "@company.com";
  return base + "@" + rand(["mail.com", "example.com", "bdmail.com", "demo.net"]);
}

function fakeDateISO() {
  const d = randomDate(new Date(2000, 0, 1), new Date(2018, 11, 31));
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function fakeDateUser() { return fakeDateISO(); }

function fakeBirthDateISO() {
  const d = randomDate(new Date(1995, 0, 1), new Date(2015, 11, 31));
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function fakeBirthDateUser() { return fakeBirthDateISO(); }

function fakeDateFormatted(format) {
  return formatDate(randomDate(new Date(2000, 0, 1), new Date(2018, 11, 31)), format);
}

function fakeBirthDateFormatted(format) {
  return formatDate(randomDate(new Date(1995, 0, 1), new Date(2015, 11, 31)), format);
}

function getDateFormatFromContext(ctx) {
  if (/\.dd\.mm|dmY/i.test(ctx)) return "dd/mm/yyyy";
  if (/\.mm\.dd|mdY/i.test(ctx)) return "mm/dd/yyyy";
  if (/dd-mm-y|dd\.mm/i.test(ctx)) return "dd-mm-yyyy";
  if (/mm-dd-y|mm\.dd/i.test(ctx)) return "mm-dd-yyyy";
  return "yyyy-mm-dd";
}

function fakeNumberForContext(ctx) {
  if (/age|year.*old|years?\s*old/i.test(ctx)) return String(randInt(18, 65));
  if (/qty|quantity|amount|count|num.*item/i.test(ctx)) return String(randInt(1, 99));
  if (/year|birth\s*year|graduation/i.test(ctx)) return String(randInt(1980, 2005));
  if (/percent|%|percentage/i.test(ctx)) return String(randInt(0, 100));
  if (/price|salary|amount|tk|taka|bdt/i.test(ctx)) return String(randInt(5000, 150000));
  if (/roll|student.*id|registration/i.test(ctx)) return String(randInt(100, 99999));
  return String(randInt(1, 999));
}

function fakeNidForContext(ctx) {
  const n = String(randInt(1000000000, 9999999999));
  if (/dash|hyphen|xxxx-xxxx-xxxx|nid\s*format/i.test(ctx)) return n.slice(0, 4) + "-" + n.slice(4, 8) + "-" + n.slice(8);
  return n;
}

function fakePasswordForContext(ctx) {
  if (/pin|simple|numeric|digit/i.test(ctx)) return String(randInt(1000, 9999));
  if (/strong|complex|secure/i.test(ctx)) return "Test@" + randInt(100, 999) + "Ab!";
  return "Test@12345";
}

function fakeUrlForContext(ctx) {
  if (/http\s*only|no\s*https/i.test(ctx)) return "http://example.com";
  if (/www\.|with\s*www/i.test(ctx)) return "https://www.example.com";
  return "https://example.com";
}

function fakeCompany() { return rand(companies); }

function fakeSentence() {
  return rand([
    "This is sample bangla style data for form testing.",
    "Customer from Dhaka city with typical address.",
    "Order created for demo purpose only.",
    "Please ignore this fake registration information.",
    "Sample description for Bengali user profile."
  ]);
}

/* --- 按类型获取值 (供外部调用) --- */
function getValueByType(fillType, ctx, opts) {
  const rulePattern = (opts && opts.rulePattern) ? String(opts.rulePattern) : '';
  const fromCustomRule = !!(opts && opts.fromCustomRule);
  const isRegexRule = !!(opts && opts.isRegexRule);
  const pf = (opts && opts.phoneFormat) || 'local';

  switch (fillType) {
    case 'name':
      return /first|fname|given/i.test(ctx) ? rand(firstNames)
        : /last|lname|sur/i.test(ctx) ? rand(lastNames) : fakeName();
    case 'email':
      if (fromCustomRule && rulePattern && !isRegexRule && /@/.test(rulePattern)) {
        const match = rulePattern.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        if (match) return rulePattern;
        const domain = rulePattern.split('@')[1];
        if (domain) {
          const name = fakeName().toLowerCase().replace(/[^a-z]/g, ".");
          return (name || "user") + randInt(10, 999) + "@" + domain;
        }
      }
      return fakeEmailForContext(ctx);
    case 'phone': return pf === 'international' ? fakePhone() : fakePhoneLocal();
    case 'address': return fakeAddress();
    case 'city': return fakeCity();
    case 'postcode': return fakePostcode();
    case 'company': return fakeCompany();
    case 'date': return fakeDateISO();
    case 'datetime': return fakeDateISO() + "T" + String(randInt(0, 23)).padStart(2, "0") + ":" + String(randInt(0, 59)).padStart(2, "0");
    case 'time': return String(randInt(0, 23)).padStart(2, "0") + ":" + String(randInt(0, 59)).padStart(2, "0");
    case 'number': return fakeNumberForContext(ctx);
    case 'nid': return fakeNidForContext(ctx);
    case 'password': return fakePasswordForContext(ctx);
    case 'url': return fakeUrlForContext(ctx);
    case 'sentence': return fakeSentence();
    case 'bio': return fakeSentence();
    case 'description': return fakeSentence();
    case 'file':
      const defaultFiles = {
        image: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="],
        pdf: "data:application/pdf;base64,",
        doc: "data:application/msword;base64,"
      };
      const ftype = (opts && opts.fileType) || 'image';
      return defaultFiles[ftype] || defaultFiles.image;
    default: return fakeName();
  }
}

/* --- 模块导出 --- */
if (typeof window !== 'undefined') {
  window.__BengaliFakeData__ = {
    // 数据
    firstNames, lastNames, streets, cities, companies,
    // 工具
    rand, randInt, randomDate, formatDate,
    // 生成器
    fakeName, fakeAddress, fakeCity, fakePostcode, fakePhone, fakePhoneLocal,
    fakeEmail, fakeEmailForContext, fakeDateISO, fakeDateUser, fakeBirthDateISO, fakeBirthDateUser,
    fakeDateFormatted, fakeBirthDateFormatted, getDateFormatFromContext,
    fakeNumberForContext, fakeNidForContext, fakePasswordForContext, fakeUrlForContext,
    fakeCompany, fakeSentence,
    // 核心
    getValueByType
  };
  // Backward-compatible alias for older adapter experiments.
  window.__BengaliFakeFillData__ = window.__BengaliFakeData__;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // 数据
    firstNames, lastNames, streets, cities, companies,
    // 工具
    rand, randInt, randomDate, formatDate,
    // 生成器
    fakeName, fakeAddress, fakeCity, fakePostcode, fakePhone, fakePhoneLocal,
    fakeEmail, fakeEmailForContext, fakeDateISO, fakeDateUser, fakeBirthDateISO, fakeBirthDateUser,
    fakeDateFormatted, fakeBirthDateFormatted, getDateFormatFromContext,
    fakeNumberForContext, fakeNidForContext, fakePasswordForContext, fakeUrlForContext,
    fakeCompany, fakeSentence,
    // 核心
    getValueByType
  };
}
