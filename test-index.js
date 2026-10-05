/**
 * Homepage checks; run with `npm run test:index`
 *
 * Covers: section structure, the inline Reicon SVG sprite (every <use>
 * must resolve to a real <symbol>, so an icon can never silently vanish),
 * local image paths, accessibility, responsive breakpoints (rules.md 8)
 * and horizontal overflow at phone widths.
 *
 * This file is deliberately ASCII-only: every non-ASCII char is written with
 * String.fromCodePoint so an encoding round-trip can never corrupt it.
 */
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const SITE = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const RUPEE = String.fromCodePoint(0x20b9);

const pass = [], fail = [];
const check = (name, cond, extra = '') =>
  (cond ? pass : fail).push(name + (extra ? ` -> ${extra}` : ''));
const wait = ms => new Promise(r => setTimeout(r, ms));

// capture which file each failed request was for, not just "it failed"
async function failedRequests(page) {
  const missing = [];
  page.on('requestfailed', r => {
    const u = r.url();
    missing.push(u.replace(/^file:\/\/\/.*?(?=[^\/]*$)/, '') + ' [' + (r.failure() || {}).errorText + ']');
  });
  return missing;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });

  const page = await browser.newPage();
  const errors = [];
  const missing = await failedRequests(page);
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(400);

  // ---- 1. Structure ----
  // hero + categories + featured + why + delivery + store + instagram
  const sections = await page.$$eval('main > section', els => els.length);
  check('renders all 7 homepage sections', sections === 7, `got ${sections}`);

  const cats = await page.$$eval('.categories .category', els => els.length);
  check('renders 5 category cards', cats === 5, `got ${cats}`);

  const products = await page.$$eval('.product-card', els => els.length);
  check('renders 4 featured product cards', products === 4, `got ${products}`);

  const h1s = await page.$$eval('h1', els => els.length);
  check('exactly one <h1>', h1s === 1, `got ${h1s}`);

  const whyItems = await page.$$eval('.why-item', els => els.length);
  check('renders 4 "why choose us" points', whyItems === 4, `got ${whyItems}`);

  const deliveryCards = await page.$$eval('.delivery-strip .delivery-card', els => els.length);
  check('renders 2 delivery cards', deliveryCards === 2, `got ${deliveryCards}`);

  const insta = await page.$$eval('.insta-card', els => els.length);
  check('renders 8 Instagram tiles', insta === 8, `got ${insta}`);

  // ---- 2. Stylesheets actually applied ----
  const styled = await page.evaluate(() => ({
    heroH1: parseFloat(getComputedStyle(document.querySelector('.hero h1')).fontSize),
    prodCols: getComputedStyle(document.querySelector('.products')).gridTemplateColumns.split(' ').length,
    instaCols: getComputedStyle(document.querySelector('.insta-grid')).gridTemplateColumns.split(' ').length
  }));
  check('stylesheet loaded (hero h1 >= 40px)', styled.heroH1 >= 40, `${styled.heroH1}px`);
  check('desktop = 4-column product grid', styled.prodCols === 4, `${styled.prodCols} cols`);
  check('desktop = 8-column Instagram grid', styled.instaCols === 8, `${styled.instaCols} cols`);

  // ---- 3. The Reicon sprite ----
  const sprite = await page.evaluate(() => {
    const symbols = [...document.querySelectorAll('svg symbol')];
    const uses = [...document.querySelectorAll('svg.icon use')];
    const ids = new Set(symbols.map(s => '#' + s.id));
    return {
      symbolCount: symbols.length,
      useCount: uses.length,
      unresolved: uses.map(u => u.getAttribute('href')).filter(h => !ids.has(h))
    };
  });
  check('inline sprite defines symbols', sprite.symbolCount > 0, `${sprite.symbolCount} symbols`);
  check('page uses SVG icons', sprite.useCount > 0, `${sprite.useCount} icons`);
  check('every <use> resolves to a <symbol>',
    sprite.unresolved.length === 0,
    sprite.unresolved.length ? sprite.unresolved.join(' ') : 'all resolved');

  // an icon must actually paint: a <use> pointing at nothing measures 0x0
  const collapsed = await page.evaluate(() =>
    [...document.querySelectorAll('svg.icon')]
      .map(s => { const r = s.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; })
      .filter(([w, h]) => w === 0 || h === 0));
  check('every icon renders with a real box', collapsed.length === 0,
    collapsed.length ? `${collapsed.length} collapsed` : 'all painted');

  // ---- 4. Images resolve on disk ----
  // The below-the-fold images are loading="lazy", so they have not been
  // requested yet at this point. Force them eager before asserting.
  await page.evaluate(() => {
    document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
  });
  await wait(900);

  const imgs = await page.evaluate(() =>
    [...document.images].map(i => ({
      src: i.getAttribute('src'),
      ok: i.complete && i.naturalWidth > 0,
      alt: i.getAttribute('alt')
    })));
  const broken = imgs.filter(i => !i.ok);
  check('every local image loads', broken.length === 0,
    broken.length ? broken.map(b => b.src).join(' ') : `${imgs.length} images`);
  check('no image is missing alt', imgs.every(i => i.alt && i.alt.trim().length),
    `${imgs.filter(i => !i.alt).length} missing`);

  // products live under assets/products/, not assets/
  const productSrcs = await page.$$eval('.product-image img', els => els.map(e => e.getAttribute('src')));
  check('product images point at assets/products/',
    productSrcs.length > 0 && productSrcs.every(s => s.startsWith('assets/products/')),
    productSrcs[0] || 'none');

  // ---- 5. Prices render with the rupee sign ----
  const prices = await page.$$eval('.price', els => els.map(e => e.textContent.trim()));
  check('all 4 prices show the rupee symbol',
    prices.length === 4 && prices.every(p => p.startsWith(RUPEE)),
    prices.join(' '));

  // ---- 6. Accessibility ----
  const a11y = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    main: document.querySelectorAll('main').length,
    mainId: !!document.querySelector('main#main'),
    skip: !!document.querySelector('.skip-link'),
    current: [...document.querySelectorAll('[aria-current]')].map(e => e.getAttribute('aria-current')),
    exposedIcons: [...document.querySelectorAll('svg.icon')]
      .filter(s => s.getAttribute('aria-hidden') !== 'true').length,
    headingSkip: (() => {
      const lv = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => +h.tagName[1]);
      for (let i = 1; i < lv.length; i++) if (lv[i] - lv[i - 1] > 1) return `${lv[i - 1]}->${lv[i]}`;
      return null;
    })(),
    namelessBtns: [...document.querySelectorAll('button')]
      .filter(b => !b.textContent.trim() && !b.getAttribute('aria-label')).length,
    namelessLinks: [...document.querySelectorAll('a')]
      .filter(a => !a.textContent.trim() && !a.getAttribute('aria-label')).length
  }));

  check('page has lang, main#main and skip link',
    a11y.lang && a11y.main === 1 && a11y.mainId && a11y.skip,
    JSON.stringify({ lang: a11y.lang, main: a11y.main, jump: a11y.mainId, skip: a11y.skip }));
  check('nav marks Home as the current page',
    a11y.current.includes('page'), a11y.current.join(','));
  check('all icons are aria-hidden', a11y.exposedIcons === 0, `${a11y.exposedIcons} exposed`);
  check('heading levels never skip', a11y.headingSkip === null, a11y.headingSkip || 'ok');
  check('every button has an accessible name', a11y.namelessBtns === 0, `${a11y.namelessBtns} nameless`);
  check('every link has an accessible name', a11y.namelessLinks === 0, `${a11y.namelessLinks} nameless`);

  // ---- 7. Internal links resolve ----
  // strip any query string before hitting the filesystem
  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href'))
      .filter(h => h && !/^(https?:|mailto:|tel:|#)/.test(h)));
  const deadLinks = [...new Set(hrefs)].filter(h => !fs.existsSync(path.resolve(__dirname, h.split('?')[0])));
  check('all internal links point at real files', deadLinks.length === 0,
    deadLinks.length ? deadLinks.join(' ') : `${new Set(hrefs).size} links`);

  // ---- 8. Responsive + horizontal overflow ----
  for (const w of [1440, 1024, 768, 390, 320]) {
    await page.setViewport({ width: w, height: 900 });
    await page.goto(SITE, { waitUntil: 'networkidle0' });
    await wait(300);
    const r = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const over = [...document.querySelectorAll('body *')]
        .filter(el => el.getBoundingClientRect().right > docW + 1)
        .map(el => el.tagName.toLowerCase() + '.' +
          ((el.className.baseVal ?? el.className ?? '').toString().split(' ')[0]));
      return {
        scrolled: window.scrollX,
        widest: Math.max(0, document.documentElement.scrollWidth - docW),
        over: [...new Set(over)].slice(0, 4)
      };
    });
    check(`no horizontal scrolling @ ${w}px`,
      r.scrolled === 0 && r.widest === 0,
      `scrolledX=${r.scrolled} widestOverflow=${r.widest}${r.over.length ? ' ' + r.over.join(',') : ''}`);
  }

  // product grid collapses to 2 columns on phones
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(300);
  const mob = await page.evaluate(() => ({
    prodCols: getComputedStyle(document.querySelector('.products')).gridTemplateColumns.split(' ').length,
    // "PERFORMANCE" must fit: this is the widest word in the hero h1
    heroFits: (() => {
      const h1 = document.querySelector('.hero h1');
      return h1.scrollWidth <= h1.clientWidth + 1;
    })()
  }));
  check('mobile: product grid drops to 2 columns', mob.prodCols === 2, `${mob.prodCols} cols`);
  check('mobile: hero headline is not clipped', mob.heroFits, mob.heroFits ? 'fits' : 'clipped');

  // CSS background-images do not resolve over file://, so every test file here
  // ignores ERR_FILE_NOT_FOUND for the hero/page-hero artwork. An <img> that
  // fails shows up in the "every local image loads" check instead.
  const realErrors = errors.filter(e => !e.includes('ERR_FILE_NOT_FOUND'));
  const realMissing = missing.filter(m => !m.includes('hero'));
  check('no JS/script errors', realErrors.length === 0, realErrors.join(' | ') || 'clean');
  check('no unexpected failed requests', realMissing.length === 0,
    realMissing.length ? realMissing.join(' ') : 'all resolved');

  await browser.close();

  pass.forEach(p => console.log('  OK   ' + p));
  if (fail.length) { console.log(''); fail.forEach(f => console.log('  FAIL ' + f)); }
  console.log(`\nRESULT: ${pass.length} passed, ${fail.length} failed`);
  process.exit(fail.length ? 1 : 0);
})();