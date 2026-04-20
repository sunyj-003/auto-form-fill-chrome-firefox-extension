const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');
const { installInjectedExtension } = require('../tests/e2e/helpers/module-injection');
const { triggerShortcutFill } = require('../tests/e2e/helpers/real-extension');

const rootDir = path.resolve(__dirname, '..');
const formTestDir = path.join(rootDir, 'tests/form-test');
const outputDir = path.join(rootDir, 'artifacts/test-report');
const extensionPath = path.join(rootDir, 'extensions/chrome');

function ensureOutputDir() {
  fs.mkdirSync(outputDir, { recursive: true });
}

function waitFor(condition, timeout = 10000, interval = 100) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    async function poll() {
      try {
        const result = await condition();
        if (result) {
          resolve(result);
          return;
        }
      } catch (error) {
        reject(error);
        return;
      }

      if (Date.now() - startedAt > timeout) {
        reject(new Error('Timed out while waiting for page state'));
        return;
      }

      setTimeout(poll, interval);
    }

    poll();
  });
}

function startStaticServer(port = 4173) {
  const server = http.createServer((req, res) => {
    const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const relativePath = requestPath === '/' ? '/index.html' : requestPath;
    const filePath = path.normalize(path.join(formTestDir, relativePath));

    if (!filePath.startsWith(formTestDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(error.code === 'ENOENT' ? 404 : 500);
        res.end(error.code === 'ENOENT' ? 'Not found' : 'Internal server error');
        return;
      }

      res.writeHead(200, {
        'Content-Type': getContentType(filePath),
      });
      res.end(data);
    });
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      resolve({
        server,
        baseURL: `http://127.0.0.1:${port}`,
      });
    });
  });
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

async function captureInjectedNative(baseURL) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  try {
    await page.goto(`${baseURL}/index.html`);
    await page.waitForSelector('#native-username', { timeout: 15000 });
    await installInjectedExtension(page, {
      autoFillEnabled: false,
      formSettings: { name: true, email: true, phone: true, password: true, textarea: true, checkbox: true, select: true },
    });
    await page.waitForTimeout(500);
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());

    await waitFor(async () => {
      const values = await page.evaluate(() => ({
        username: document.querySelector('#native-username')?.value || '',
        email: document.querySelector('#native-email')?.value || '',
        phone: document.querySelector('#native-phone')?.value || '',
      }));
      return values.username && values.email.includes('@') && values.phone;
    });

    const target = page.locator('.native-form');
    await target.screenshot({ path: path.join(outputDir, 'native-form-filled.png') });
  } finally {
    await browser.close();
  }
}

async function captureInjectedDynamicStep(baseURL) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  try {
    await page.goto(`${baseURL}/index.html`);
    await page.waitForSelector('#dynamic-name-1', { timeout: 15000 });
    await installInjectedExtension(page, {
      autoFillEnabled: true,
      formSettings: { name: true, email: true, phone: true, address: true, company: true },
    });
    await page.waitForTimeout(500);
    await page.evaluate(() => window.__bengaliFakeFill && window.__bengaliFakeFill());

    await waitFor(async () => {
      const values = await page.evaluate(() => ({
        name: document.querySelector('#dynamic-name-1')?.value || '',
        email: document.querySelector('#dynamic-email-1')?.value || '',
      }));
      return values.name && values.email.includes('@');
    });

    await page.click('#nextStepBtn');
    await page.waitForTimeout(300);

    await waitFor(async () => {
      const values = await page.evaluate(() => ({
        phone: document.querySelector('#dynamic-phone-2')?.value || '',
        address: document.querySelector('#dynamic-address-2')?.value || '',
      }));
      return values.phone && values.address;
    });

    await page.locator('#step-2').screenshot({ path: path.join(outputDir, 'dynamic-step-2-filled.png') });
  } finally {
    await browser.close();
  }
}

async function captureRealExtension(baseURL) {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-shot-ext-'));
  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chromium',
    headless: true,
    viewport: { width: 1440, height: 1200 },
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  try {
    const page = context.pages()[0] || await context.newPage();
    await page.goto(`${baseURL}/native-extension.html`);
    await page.waitForTimeout(500);
    await triggerShortcutFill(page);

    await waitFor(async () => {
      const values = await page.evaluate(() => ({
        username: document.querySelector('#native-username')?.value || '',
        email: document.querySelector('#native-email')?.value || '',
      }));
      return values.username && values.email.includes('@');
    }, 15000);

    await page.locator('body').screenshot({ path: path.join(outputDir, 'real-extension-native-filled.png') });
  } finally {
    await context.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
}

async function main() {
  ensureOutputDir();
  const { server, baseURL } = await startStaticServer();

  try {
    await captureInjectedNative(baseURL);
    await captureInjectedDynamicStep(baseURL);
    await captureRealExtension(baseURL);
    console.log(JSON.stringify({
      outputDir,
      screenshots: [
        path.join(outputDir, 'native-form-filled.png'),
        path.join(outputDir, 'dynamic-step-2-filled.png'),
        path.join(outputDir, 'real-extension-native-filled.png'),
      ],
    }, null, 2));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
