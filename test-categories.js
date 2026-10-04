/**
 * Categories page checks — run with `npm run test:categories`
 *
 * Covers: structure, copy, Shop deep links, trust strip, accessibility,
 * responsive breakpoints (rules.md 8) and horizontal overflow.
 * Uses puppeteer-core against the installed Chrome, exactly like test-shop.js.
 */
const puppeteer = require('puppeteer-core');
const path = require('path');

const SITE = 'file:///' + path.resolve(__dirname, 'categories.html').replace(/\\/g, '/');
const SHOP = 'file:///' + path.resolve(__dirname, 'shop.html').replace(/\\/g, '/');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const pass = [], fail = [];
const check = (name, cond, extra = '') =>
  (cond ? pass : fail).push(name + (extra ? ` -> ${extra}` : ''));
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(400);

  // ---- 1. Structure ----
  const cardCount = await page.$$eval('.cat-card', els => els.length);
  check('renders all 8 category cards', cardCount === 8, `got ${cardCount}`);

  const quickCount = await page.$$eval('.quick-card', els => els.length);
  check('renders 4 popular-category cards', quickCount === 4, `got ${quickCount}`);

  const h1s = await page.$$eval('h1', els => els.length);
  check('exactly one <h1>', h1s === 1, `got ${h1s}`);

  // ---- 2. CSS loaded ----
  const styled = await page.evaluate(() => {
    const h = document.querySelector('.page-hero h1');
    const grid = document.querySelector('.cat-grid');
    return {
      h1size: parseFloat(getComputedStyle(h).fontSize),
      cols: getComputedStyle(grid).gridTemplateColumns.split(' ').length
    };
  });
  check('stylesheet loaded (h1 >= 30px)', styled.h1size >= 30, `${styled.h1size}px`);
  check('desktop = 4-column category grid', styled.cols === 4, `${styled.cols} cols`);

  // ---- 3. Header / nav state ----
  const nav = await page.evaluate(() => {
    const active = document.querySelector('.nav-links .active');
    return {
      activeText: active ? active.textContent.trim() : '',
      activeHref: active ? active.getAttribute('href') : '',
      current: active ? active.getAttribute('aria-current') : '',
      logos: document.querySelectorAll('header .logo').length,
      hasCart: !!document.querySelector('.nav-actions [aria-label="Cart"]'),
      searchHref: (document.querySelector('.nav-actions a[aria-label="Search products"]') || {}).href || ''
    };
  });
  check('nav marks Categories as the active page',
    nav.activeText === 'Categories' && nav.activeHref === 'categories.html' && nav.current === 'page',
    JSON.stringify(nav));
  check('header keeps logo + cart + search',
    nav.logos === 1 && nav.hasCart && nav.searchHref.includes('shop.html'),
    `logos=${nav.logos} cart=${nav.hasCart} search=${nav.searchHref}`);


// ---- 4. Hero ----
  const hero = await page.evaluate(() => {
    const el = document.querySelector('.page-hero');
    return {
      pad: parseFloat(getComputedStyle(el).paddingTop),
      eyebrow: document.querySelector('.page-hero .eyebrow').textContent.trim(),
      h1: document.querySelector('.page-hero h1').textContent.replace(/\s+/g, ' ').trim(),
      lead: document.querySelector('.page-hero__lead').textContent.trim(),
      crumb: document.querySelector('.breadcrumb').textContent.replace(/\s+/g, ' ').trim(),
      image: el.getAttribute('style') || ''
    };
  });
  check('hero section padding reset to 0', hero.pad === 0, `${hero.pad}px`);
  check('hero eyebrow', hero.eyebrow === 'Explore Our Range', hero.eyebrow);
  check('hero H1 = "Shop By Category"', hero.h1 === 'Shop By Category', hero.h1);
  check('hero lead copy',
    hero.lead === 'Browse our full range and find the products that fit your fitness goals.', hero.lead);
  check('breadcrumb = Home / Categories', hero.crumb === 'Home / Categories', hero.crumb);
  check('hero uses the replaceable assets/categories-hero.jpg path',
    /categories-hero\.jpg/.test(hero.image), hero.image.trim());

  // ---- 5. Card anatomy ----
  const anatomy = await page.evaluate(() => {
    const bad = [];
    document.querySelectorAll('.cat-card').forEach(card => {
      const missing = [];
      if (!card.querySelector('img')) missing.push('image');
      if (!card.querySelector('h3')) missing.push('name');
      if (!card.querySelector('.cat-card__desc')) missing.push('description');
      if (!card.querySelector('.cat-card__count')) missing.push('product count');
      if (!card.querySelector('.cat-card__arrow')) missing.push('arrow');
      if (missing.length) bad.push((card.querySelector('h3') || {}).textContent + ': ' + missing.join(', '));
    });
    return bad;
  });
  check('every card has image + name + description + count + arrow',
    anatomy.length === 0, anatomy.join(' | '));

  const counts = await page.$$eval('.cat-card__count', els => els.map(e => e.textContent.trim()));
  check('product counts are placeholders on every card',
    counts.length === 8 && counts.every(c => /^\d+ Products$/.test(c)), counts.join(', '));

  const cardCopy = await page.$$eval('.cat-card', els => els.map(el => ({
    name: el.querySelector('h3').textContent.trim(),
    desc: el.querySelector('.cat-card__desc').textContent.trim(),
    img: el.querySelector('img').getAttribute('src')
  })));
  check('card names match the brief',
    cardCopy.map(c => c.name).join('|') ===
    'Protein|Creatine|Mass Gainer|Pre-Workout|BCAA / EAA|Vitamins & Wellness|Amino Acids|Other Supplements',
    cardCopy.map(c => c.name).join('|'));
  check('card images use replaceable assets/categories/*.jpg paths',
    cardCopy.every(c => /^assets\/categories\/[a-z-]+\.jpg$/.test(c.img)),
    cardCopy.map(c => c.img).join(', '));
  check('card descriptions are all populated',
    cardCopy.every(c => c.desc.length > 3),
    cardCopy.map(c => `${c.name}="${c.desc}"`).join(' | '));

  // ---- 6. Deep links into Shop ----
  const links = await page.$$eval('.cat-card', els => els.map(e => e.getAttribute('href')));
  const validSlugs = ['protein', 'creatine', 'mass-gainer', 'pre-workout', 'other'];
  const slugs = links.map(h => (h.match(/category=([a-z-]+)/) || [])[1]);
  check('all 8 cards deep-link into the Shop page',
    links.every(h => /^shop\.html\?category=[a-z-]+$/.test(h)), links.join(' | '));
  check('every deep link uses a category the Shop understands',
    slugs.every(s => validSlugs.includes(s)), slugs.join('|'));

  const quickLinks = await page.$$eval('.quick-card', els => els.map(e => e.getAttribute('href')));
  check('popular categories = protein, creatine, mass-gainer, pre-workout',
    quickLinks.join('|') ===
    'shop.html?category=protein|shop.html?category=creatine|shop.html?category=mass-gainer|shop.html?category=pre-workout',
    quickLinks.join(' | '));

  const quickCopy = await page.$$eval('.quick-card', els => els.map(e =>
    e.querySelector('h3').textContent.trim() + '/' + e.querySelector('.quick-card__cta').textContent.trim()));
  check('popular cards show name + "Shop Now ->"',
    quickCopy.every(c => c.endsWith('/Shop Now →')), quickCopy.join(' | '));

  // ---- 7. Featured section ----
  const feature = await page.evaluate(() => ({
    heading: document.querySelector('.cat-feature__copy h2').textContent.replace(/\s+/g, ' ').trim(),
    img: document.querySelector('.cat-feature__media img').getAttribute('src'),
    bullets: document.querySelectorAll('.cat-feature__list li').length,
    cta: document.querySelector('.cat-feature__copy .btn').getAttribute('href'),
    ctaText: document.querySelector('.cat-feature__copy .btn').textContent.trim(),
    cols: getComputedStyle(document.querySelector('.cat-feature__grid')).gridTemplateColumns.split(' ').length
  }));
  check('featured H2 matches the brief',
    feature.heading === 'Why Choose the Right Category?', feature.heading);
  check('featured image uses the replaceable category-featured.jpg path',
    feature.img === 'assets/category-featured.jpg', feature.img);
  check('featured list has supporting points', feature.bullets === 3, `${feature.bullets}`);
  check('featured CTA links to the Shop page',
    feature.cta === 'shop.html' && feature.ctaText === 'Explore Products',
    `${feature.cta} "${feature.ctaText}"`);
  check('desktop featured block is a 2-column split', feature.cols === 2, `${feature.cols} cols`);

  // ---- 8. Trust strip ----
  const trust = await page.$$eval('.delivery-strip--dark .delivery-card strong',
    els => els.map(e => e.textContent.trim()));
  check('trust strip = COD + All India Delivery + Quality Products',
    trust.join('|') === 'Cash on Delivery Available|All India Delivery|Quality Products', trust.join('|'));

  // ---- 9. Accessibility ----
  const a11y = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')];
    const nameless = [...document.querySelectorAll('a,button')]
      .filter(el => !el.textContent.trim() && !el.getAttribute('aria-label') && !el.querySelector('.sr-only'))
      .map(el => el.outerHTML.slice(0, 60));
    const heads = [...document.querySelectorAll('h1,h2,h3')].map(e => +e.tagName[1]);
    let jump = null;
    for (let i = 1; i < heads.length; i++) {
      if (heads[i] - heads[i - 1] > 1) { jump = heads[i - 1] + '->' + heads[i]; break; }
    }
    return {
      imgNoAlt: imgs.filter(i => !i.hasAttribute('alt')).length,
      nameless: nameless,
      jump: jump,
      lang: document.documentElement.lang,
      main: document.querySelectorAll('main#main').length,
      skip: !!document.querySelector('.skip-link'),
      // One in the nav + one in the breadcrumb = 2. Both are correct usage.
      navCurrent: document.querySelectorAll('.nav-links [aria-current="page"]').length,
      crumbCurrent: document.querySelectorAll('.breadcrumb [aria-current="page"]').length
    };
  });
  check('all images declare an alt attribute', a11y.imgNoAlt === 0, `${a11y.imgNoAlt} missing`);
  check('all links/buttons have an accessible name', a11y.nameless.length === 0, a11y.nameless.join(' | '));
  check('heading levels never skip a level', a11y.jump === null, String(a11y.jump));
  check('page has lang, main#main, skip link and nav + breadcrumb aria-current',
    a11y.lang === 'en' && a11y.main === 1 && a11y.skip &&
    a11y.navCurrent === 1 && a11y.crumbCurrent === 1, JSON.stringify(a11y));

  // ---- 10. No horizontal overflow (rules.md 8) ----
  for (const w of [1440, 1280, 1024, 768, 640, 390, 375]) {
    await page.setViewport({ width: w, height: 900 });
    await page.goto(SITE, { waitUntil: 'networkidle0' });
    await wait(250);
    const over = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`no horizontal overflow @ ${w}px`, over <= 0, `overflow ${over}px`);
  }

  // ---- 11. Responsive grids ----
  await page.setViewport({ width: 1024, height: 900 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(250);
  const tablet = await page.evaluate(() => ({
    cols: getComputedStyle(document.querySelector('.cat-grid')).gridTemplateColumns.split(' ').length,
    quick: getComputedStyle(document.querySelector('.quick-grid')).gridTemplateColumns.split(' ').length,
    feature: getComputedStyle(document.querySelector('.cat-feature__grid')).gridTemplateColumns.split(' ').length
  }));
  check('tablet: 3-column category grid', tablet.cols === 3, `${tablet.cols} cols`);
  check('tablet: 2-column popular cards', tablet.quick === 2, `${tablet.quick} cols`);
  check('tablet: featured block stacks', tablet.feature === 1, `${tablet.feature} col`);

  await page.setViewport({ width: 390, height: 844 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(250);
  const mobile = await page.evaluate(() => ({
    cols: getComputedStyle(document.querySelector('.cat-grid')).gridTemplateColumns.split(' ').length,
    quick: getComputedStyle(document.querySelector('.quick-grid')).gridTemplateColumns.split(' ').length,
    trust: getComputedStyle(document.querySelector('.delivery-grid--3')).gridTemplateColumns.split(' ').length,
    heroH1: parseFloat(getComputedStyle(document.querySelector('.page-hero h1')).fontSize),
    cardW: document.querySelector('.cat-card').getBoundingClientRect().width
  }));
  check('mobile: 2-column category grid', mobile.cols === 2, `${mobile.cols} cols`);
  check('mobile: 2-column popular cards', mobile.quick === 2, `${mobile.quick} cols`);
  check('mobile: trust strip stacks to 1 column', mobile.trust === 1, `${mobile.trust} col`);
  check('mobile: hero H1 stays >= 30px', mobile.heroH1 >= 30, `${mobile.heroH1}px`);
  check('mobile: cards remain tappable (>= 100px wide)', mobile.cardW >= 100, `${Math.round(mobile.cardW)}px`);

  // ---- 12. Deep links actually filter the Shop page ----
  const expectations = [
    ['protein', 3], ['creatine', 1], ['mass-gainer', 2], ['pre-workout', 2], ['other', 4]
  ];
  for (const [slug, expected] of expectations) {
    await page.goto(`${SHOP}?category=${slug}`, { waitUntil: 'networkidle0' });
    await wait(300);
    const got = await page.$$eval('#shopGrid .product-card', els => els.length);
    const empty = await page.$eval('#shopEmpty', el => el.classList.contains('is-visible'));
    check(`deep link ?category=${slug} -> ${expected} products`, got === expected && !empty, `got ${got}`);
  }

  // ---- 13. Clicking a card navigates to the filtered Shop ----
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(300);
  await page.click('.cat-card');
  await wait(600);
  // The Shop results heading is statically "All Products" per the shop spec, so
  // verify the deep link by the checked facet and the filtered result count.
  const landed = await page.evaluate(() => ({
    url: location.href,
    checked: (document.querySelector('input[name="category"][value="protein"]') || {}).checked,
    cards: document.querySelectorAll('#shopGrid .product-card').length
  }));
  check('clicking a category card opens the filtered Shop page',
    /shop\.html\?category=protein$/.test(landed.url) &&
    landed.checked === true && landed.cards === 3,
    `${landed.url.split('/').pop()} checked=${landed.checked} cards=${landed.cards}`);

  // ---- 14. Screenshots ----
  await page.setViewport({ width: 1440, height: 1100 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(500);
  await page.screenshot({ path: 'test-categories-desktop.png', fullPage: true });

  await page.setViewport({ width: 390, height: 844 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(500);
  await page.screenshot({ path: 'test-categories-mobile.png', fullPage: true });

  // Only script errors matter — missing assets/*.jpg are expected until real
  // photography is supplied (the onerror fallback hides them).
  const realErrors = errors.filter(e => !e.includes('ERR_FILE_NOT_FOUND'));
  check('no JS/script errors', realErrors.length === 0, realErrors.join(' | '));

  await browser.close();

  console.log('\n===== PASS (' + pass.length + ') =====');
  pass.forEach(t => console.log('  OK   ' + t));
  if (fail.length) {
    console.log('\n===== FAIL (' + fail.length + ') =====');
    fail.forEach(t => console.log('  FAIL ' + t));
  }
  console.log(`\nRESULT: ${pass.length} passed, ${fail.length} failed`);
  process.exit(fail.length ? 1 : 0);
})();

