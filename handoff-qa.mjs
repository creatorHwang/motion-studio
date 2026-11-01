import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:8765';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || chromium.executablePath();
const browser = await chromium.launch({ headless: true, executablePath });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('pageerror', error => errors.push(error.message));

await page.goto(`${base}/motion/`, { waitUntil: 'load' });
await page.locator('#subject').fill('도심 러닝');
await page.locator('#motion-select').selectOption('11');
await page.locator('#prompt-library-tunnel').click();
await page.locator('input[name="handoff-lang"][value="ko"]').check();
await Promise.all([
  page.waitForURL(`${base}/?go=polish&from=motion`),
  page.locator('#handoff-send').click()
]);
const result = JSON.parse(await page.locator('#result').innerText());
if (result.value?.v !== 1 || result.value?.from !== 'motion' || result.value?.lang !== 'ko') throw new Error('invalid handoff contract');
if (result.value?.topic !== '도심 러닝' || result.value?.motionId !== 11) throw new Error('handoff content mismatch');
if (result.removed !== true) throw new Error('handoff was not removed after reading');
if (errors.length) throw new Error(`browser errors: ${errors.join(' | ')}`);
console.log('PASS | same-origin handoff storage → navigation → read → delete');
await browser.close();
