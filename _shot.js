const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });

  for (const f of ['index.html', 'shop.html', 'categories.html', 'about.html']) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto('file:///' + path.resolve(f).replace(/\\/g, '/'), { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 3000));
    await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; }));
    await new Promise(r => setTimeout(r, 4000));

    const rows = await page.evaluate(() =>
      [...document.images].map(i => {
        const r = i.getBoundingClientRect();
        const boxAR = r.height ? (r.width / r.height) : 0;
        const natAR = i.naturalHeight ? (i.naturalWidth / i.naturalHeight) : 0;
        return {
          src: (i.getAttribute('src') || '').split('/').pop().split('?')[0].slice(0, 26),
          natW: i.naturalWidth, natH: i.naturalHeight,
          natAR: +natAR.toFixed(2), boxAR: +boxAR.toFixed(2),
          fit: getComputedStyle(i).objectFit
        };
      })
    );

    console.log('\n===== ' + f + ' =====');
    rows.forEach(r => {
      // flag when the source photo is far from the box shape -> letterbox/pillarbox
      const bad = r.natAR > 0 && Math.abs(r.natAR - r.boxAR) / r.boxAR > 0.35;
      console.log((bad ? '  MISMATCH ' : '  ok       ') +
        r.src.padEnd(27) + 'nat=' + String(r.natW).padStart(4) + 'x' + String(r.natH).padEnd(4) +
        ' natAR=' + String(r.natAR).padStart(5) + ' boxAR=' + String(r.boxAR).padStart(5) +
        ' fit=' + r.fit);
    });
    await page.close();
  }
  await browser.close();
})();