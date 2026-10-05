const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const url = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');

  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'shot-idx-desktop.png', fullPage: true });

  await page.setViewport({ width: 390, height: 844 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  const h = await page.evaluate(() => document.body.scrollHeight);
  await page.screenshot({ path: 'shot-idx-mobile.png', clip: { x: 0, y: 0, width: 390, height: h } });

  await browser.close();
  console.log('screenshots done');
})();