const puppeteer = require('puppeteer-core');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const SITE = 'file:///' + path.resolve(ROOT, 'shop.html').replace(/\\/g, '/');
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

  // ---- 1. Initial render ----
  const cards = await page.$$eval('#shopGrid .product-card', els => els.length);
  check('renders 8 cards per page (12 products, PER_PAGE=8)', cards === 8, `got ${cards}`);

  const count = await page.$eval('[data-result-count]', el => el.textContent.trim());
  check('result count reflects total', count.includes('12'), count);

  // ---- 2. CSS loaded ----
  const styled = await page.evaluate(() => {
    const h = document.querySelector('.page-hero h1');
    const grid = document.querySelector('.shop-grid');
    return {
      h1size: parseFloat(getComputedStyle(h).fontSize),
      cols: getComputedStyle(grid).gridTemplateColumns.split(' ').length
    };
  });
  check('stylesheet loaded (h1 >= 30px)', styled.h1size >= 30, `${styled.h1size}px`);
  check('desktop = 4-column grid', styled.cols === 4, `${styled.cols} cols`);

  // ---- 3. Sidebar ----
  const sidebar = await page.evaluate(() => {
    const el = document.querySelector('#shopFilters');
    const r = el.getBoundingClientRect();
    return { visible: r.width > 0 && r.left >= 0, pos: getComputedStyle(el).position };
  });
  check('desktop: filter sidebar inline & sticky', sidebar.visible && sidebar.pos === 'sticky', JSON.stringify(sidebar));

  // ---- 4. Hero padding not doubled ----
  const heroPad = await page.$eval('.page-hero', el => getComputedStyle(el).paddingTop);
  check('hero section padding reset to 0', parseFloat(heroPad) === 0, heroPad);

  // ---- 5. Category filter ----
  await page.click('input[name="category"][value="protein"]');
  await wait(250);
  const proteinCount = await page.$$eval('#shopGrid .product-card', e => e.length);
  check('category=protein -> 3 results', proteinCount === 3, `got ${proteinCount}`);

  // ---- 6. Empty state ----
  // NOTE: creatine has a single in-stock product, so creatine + sold-out is
  // a legitimate impossible combination.
  await page.click('.filter-reset');
  await wait(200);
  await page.click('input[name="category"][value="creatine"]');
  await wait(250);
  await page.click('input[name="availability"][value="sold-out"]');
  await wait(250);
  const emptyVisible = await page.$eval('#shopEmpty', el => el.classList.contains('is-visible'));
  const emptyCards = await page.$$eval('#shopGrid .product-card', e => e.length);
  check('empty state for impossible combo', emptyVisible && emptyCards === 0, `visible=${emptyVisible} cards=${emptyCards}`);

  // ---- 7. Reset from the empty state ----
  await page.click('#shopEmpty [data-reset-filters]');
  await wait(300);
  const afterReset = await page.$$eval('#shopGrid .product-card', e => e.length);
  const emptyGone = await page.$eval('#shopEmpty', el => !el.classList.contains('is-visible'));
  check('empty-state reset restores products', afterReset === 8 && emptyGone, `cards=${afterReset}`);

  // sold-out within a stocked category still returns results (ISO Whey Protein)
  await page.click('input[name="category"][value="protein"]');
  await wait(200);
  await page.click('input[name="availability"][value="sold-out"]');
  await wait(300);
  const mixedCards = await page.$$eval('#shopGrid .product-card', e => e.length);
  const mixedSoldOut = await page.$$eval('#shopGrid .product-card.is-sold-out', e => e.length);
  check('protein + sold-out returns the 1 sold-out item', mixedCards === 1 && mixedSoldOut === 1, `cards=${mixedCards}`);

  // ---- 7b. Reset from the sidebar ----
  await page.click('.filter-reset');
  await wait(300);
  const afterSidebarReset = await page.$$eval('#shopGrid .product-card', e => e.length);
  check('sidebar reset restores products', afterSidebarReset === 8, `cards=${afterSidebarReset}`);

  // ---- 8. Sorting ----
  await page.select('#shopSort', 'price-asc');
  await wait(250);
  const asc = await page.$$eval('#shopGrid .price', els =>
    els.map(e => parseInt(e.textContent.replace(/[^0-9]/g, ''), 10)));
  check('sort price low->high', asc.every((v, i, a) => i === 0 || a[i - 1] <= v), asc.join(','));

  await page.select('#shopSort', 'price-desc');
  await wait(250);
  const desc = await page.$$eval('#shopGrid .price', els =>
    els.map(e => parseInt(e.textContent.replace(/[^0-9]/g, ''), 10)));
  check('sort price high->low', desc.every((v, i, a) => i === 0 || a[i - 1] >= v), desc.join(','));

  await page.select('#shopSort', 'popularity');
  await wait(250);

  // ---- 9. Pagination ----
  const pageBtns = await page.$$eval('.page-btn', els => els.length);
  check('pagination renders (2 pages + 2 arrows)', pageBtns === 4, `${pageBtns}`);

  await page.click('.page-btn[data-page="2"]');
  await wait(400);
  const page2 = await page.$$eval('#shopGrid .product-card', e => e.length);
  const current = await page.$eval('.page-btn[aria-current="page"]', el => el.textContent.trim());
  check('page 2 shows remaining 4 products', page2 === 4 && current === '2', `cards=${page2} current=${current}`);

  // On the last page the NEXT arrow must be disabled
  const nextDisabled = await page.$eval('.page-btn[data-page="3"]', el => el.disabled);
  check('next disabled on last page', nextDisabled === true, String(nextDisabled));

  await page.click('.page-btn[data-page="1"]');
  await wait(400);
  // Back on page 1 the PREV arrow must be disabled
  const prevDisabled = await page.$eval('.page-btn[data-page="0"]', el => el.disabled);
  check('prev disabled on first page', prevDisabled === true, String(prevDisabled));

  // ---- 10. Search ----
  await page.type('#shopSearch', 'whey');
  await wait(450);
  const searchCards = await page.$$eval('#shopGrid .product-card', e => e.length);
  check('search "whey" narrows results', searchCards === 3, `got ${searchCards}`);

  await page.$eval('#shopSearch', el => { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await wait(400);

  // ---- 11. Cart feedback ----
  await page.click('#shopGrid .add-cart');
  await wait(250);
  const badge = await page.$eval('[data-cart-count]', el => el.textContent.trim());
  const toastVisible = await page.$eval('#shopToast', el => el.classList.contains('is-visible'));
  const toastText = await page.$eval('[data-toast-text]', el => el.textContent);
  check('cart badge increments', badge === '1', badge);
  check('toast shows product name', toastVisible && toastText.includes('added to cart'), toastText);

  await wait(2600);
  const toastHidden = await page.$eval('#shopToast', el => !el.classList.contains('is-visible'));
  check('toast auto-hides', toastHidden);

  // ---- 12. Sold-out ----
  const soldOut = await page.evaluate(() => {
    const so = [...document.querySelectorAll('.product-card.is-sold-out')];
    return {
      count: so.length,
      disabled: so.every(c => c.querySelector('.add-cart').disabled),
      label: so.length ? so[0].querySelector('.add-cart').textContent.trim() : null
    };
  });
  check('sold-out cards disabled', soldOut.count > 0 && soldOut.disabled && soldOut.label === 'Sold Out', JSON.stringify(soldOut));

  // ---- 13. Image fallback ----
  const imgsOk = await page.evaluate(() =>
    [...document.querySelectorAll('.product-image img')].every(i => i.complete && i.naturalWidth > 0));
  check('all product images resolve (fallback works)', imgsOk);

  // ---- 14. A11y ----
  const a11y = await page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    labels: [...document.querySelectorAll('select,input[type=search]')].every(el =>
      el.labels?.length > 0 || el.getAttribute('aria-label')),
    skip: !!document.querySelector('.skip-link[href="#main"]'),
    main: !!document.getElementById('main'),
    live: !!document.querySelector('[aria-live]'),
    current: !!document.querySelector('a[aria-current="page"]')
  }));
  check('exactly one H1', a11y.h1 === 1, `${a11y.h1}`);
  check('all form controls labelled', a11y.labels);
  check('skip link + main landmark', a11y.skip && a11y.main);
  check('aria-live region present', a11y.live);
  check('aria-current page link', a11y.current);

  // ---- 15. No horizontal overflow ----
  for (const w of [1440, 1280, 1024, 768, 640, 390, 375]) {
    await page.setViewport({ width: w, height: 900 });
    await wait(250);
    const o = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth
    }));
    check(`no h-overflow @${w}px`, o.scroll <= o.client + 1, `${o.scroll} vs ${o.client}`);
  }

  // ---- 16. Mobile drawer ----
  await page.setViewport({ width: 390, height: 844 });
  await wait(250);

  const toggleVisible = await page.evaluate(() =>
    getComputedStyle(document.querySelector('[data-open-filters]')).display !== 'none');
  check('mobile: filter trigger visible', toggleVisible);

  await page.click('[data-open-filters]');
  await wait(450);
  const drawerOpen = await page.evaluate(() => {
    const d = document.querySelector('#shopFilters');
    return {
      open: d.classList.contains('is-open'),
      onScreen: d.getBoundingClientRect().left >= -1,
      backdrop: document.querySelector('.drawer-backdrop').classList.contains('is-open'),
      expanded: document.querySelector('[data-open-filters]').getAttribute('aria-expanded'),
      locked: document.body.classList.contains('drawer-open'),
      focused: document.activeElement.tagName
    };
  });
  check('mobile: drawer opens on screen', drawerOpen.open && drawerOpen.onScreen, JSON.stringify(drawerOpen));
  check('mobile: backdrop + scroll lock + aria-expanded',
    drawerOpen.backdrop && drawerOpen.locked && drawerOpen.expanded === 'true');
  check('mobile: focus moves into drawer', drawerOpen.focused === 'INPUT', drawerOpen.focused);

  await page.keyboard.press('Escape');
  await wait(450);
  const drawerClosed = await page.evaluate(() => {
    const d = document.querySelector('#shopFilters');
    return {
      closed: !d.classList.contains('is-open'),
      left: d.getBoundingClientRect().left,
      unlocked: !document.body.classList.contains('drawer-open')
    };
  });
  check('mobile: Escape closes drawer', drawerClosed.closed && drawerClosed.left < -100, JSON.stringify(drawerClosed));
  check('mobile: scroll lock released', drawerClosed.unlocked);

  // ---- 17. Mobile 2-col grid ----
  const mCols = await page.$eval('#shopGrid', el =>
    getComputedStyle(el).gridTemplateColumns.split(' ').length);
  check('mobile: 2-column product grid', mCols === 2, `${mCols} cols`);

  // ---- 18. Backdrop click closes ----
  // Click to the RIGHT of the drawer, not on the backdrop's centre point
  // (the centre sits underneath the drawer panel itself).
  await page.click('[data-open-filters]');
  await wait(400);
  await page.mouse.click(370, 420);
  await wait(400);
  const bdClosed = await page.evaluate(() =>
    !document.querySelector('#shopFilters').classList.contains('is-open'));
  check('mobile: backdrop click closes drawer', bdClosed);

  // ---- 19. URL category param ----
  await page.goto(SITE + '?category=protein', { waitUntil: 'networkidle0' });
  await wait(400);
  const urlFiltered = await page.$$eval('#shopGrid .product-card', e => e.length);
  const urlChecked = await page.$eval('input[name="category"][value="protein"]', el => el.checked);
  check('?category=protein pre-filters (homepage link)', urlFiltered === 3 && urlChecked, `cards=${urlFiltered}`);

  // ---- 20. Spec fidelity: hero + results header + facets ----
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(400);

  const copy = await page.evaluate(() => ({
    eyebrow: document.querySelector('.page-hero .eyebrow').textContent.trim(),
    h1: document.querySelector('.page-hero h1').textContent.replace(/\s+/g, ' ').trim(),
    lead: document.querySelector('.page-hero__lead').textContent.trim(),
    crumb: document.querySelector('.breadcrumb').textContent.replace(/\s+/g, ' ').trim(),
    heading: document.querySelector('.shop-head__titles h2').textContent.trim(),
    sub: document.querySelector('.shop-head__titles p').textContent.trim()
  }));
  check('hero eyebrow = "Shop Our Products"', copy.eyebrow === 'Shop Our Products', copy.eyebrow);
  check('hero H1 = "Premium Nutrition Supplements"', copy.h1 === 'Premium Nutrition Supplements', copy.h1);
  check('hero lead matches the spec', copy.lead === 'Top quality products for your fitness journey.', copy.lead);
  check('breadcrumb = Home / Shop', copy.crumb === 'Home / Shop', copy.crumb);
  check('results heading = "All Products"', copy.heading === 'All Products', copy.heading);
  check('results subtitle matches the spec', copy.sub === 'Browse our complete range of supplements.', copy.sub);

  const sortOpts = await page.$$eval('#shopSort option', els => els.map(o => o.textContent.trim()));
  check('sort = the 4 spec options',
    sortOpts.join('|') === 'Popularity|Price: Low to High|Price: High to Low|Newest', sortOpts.join('|'));

  const facets = await page.evaluate(() => {
    const grab = key => Array.from(document.querySelectorAll('[data-filter-group="' + key + '"] .filter-opt'))
      .map(el => el.querySelector('.filter-opt__label').textContent.trim() + '=' +
                 el.querySelector('.filter-opt__count').textContent.trim());
    return {
      category: grab('category'),
      availability: grab('availability'),
      brand: grab('brand'),
      hasSlider: !!document.querySelector('.price-range input[type="range"]'),
      priceLabels: Array.from(document.querySelectorAll('.price-range__values span')).map(s => s.textContent.trim())
    };
  });
  check('category facet = 5 spec categories + counts',
    facets.category.join('|') === 'Protein=3|Creatine=1|Mass Gainer=2|Pre-Workout=2|Other Supplements=4',
    facets.category.join('|'));
  check('availability facet = In Stock 10 / Out of Stock 2',
    facets.availability.join('|') === 'In Stock=10|Out of Stock=2', facets.availability.join('|'));
  check('brand facet = 4 placeholder brands + counts',
    facets.brand.join('|') === 'Brand 1=4|Brand 2=2|Brand 3=3|Others=3', facets.brand.join('|'));
  check('price range slider with ₹0 / ₹5,000+ labels',
    facets.hasSlider && facets.priceLabels[0] === '₹0' && facets.priceLabels[1] === '₹5,000+',
    JSON.stringify(facets.priceLabels));

  // ---- 21. Brand filter + price range ----
  await page.click('input[name="brand"][value="brand-1"]');
  await wait(250);
  const brandCards = await page.$$eval('#shopGrid .product-card', e => e.length);
  check('brand filter -> 4 products', brandCards === 4, `got ${brandCards}`);

  await page.click('.filter-reset');
  await wait(300);

  await page.$eval('#priceMax', el => {
    el.value = 2000;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await wait(300);
  const priceCards = await page.$$eval('#shopGrid .product-card', e => e.length);
  const maxLabel = await page.$eval('[data-price-max]', el => el.textContent.trim());
  check('price max ₹2,000 -> 6 products', priceCards === 6, `got ${priceCards}`);
  check('price max label updates', maxLabel === '₹2,000', maxLabel);

  await page.click('.filter-reset');
  await wait(300);
  const resetCards = await page.$$eval('#shopGrid .product-card', e => e.length);
  const resetLabel = await page.$eval('[data-price-max]', el => el.textContent.trim());
  check('Clear Filters resets the slider + grid',
    resetCards === 8 && resetLabel === '₹5,000+', `cards=${resetCards} label=${resetLabel}`);

  // ---- 22. Product card content + trust strip ----
  const cardBits = await page.$eval('#shopGrid .product-card', el => ({
    cat: el.querySelector('.product-cat').textContent.trim(),
    name: el.querySelector('h3').textContent.trim(),
    meta: el.querySelector('.product-meta').textContent.trim(),
    price: el.querySelector('.price').textContent.trim(),
    stock: el.querySelector('.stock').textContent.trim(),
    badge: el.querySelector('.badge') ? el.querySelector('.badge').textContent.trim() : null,
    button: el.querySelector('.add-cart').textContent.trim(),
    img: el.querySelector('.product-image img').getAttribute('data-src')
  }));
  check('card shows category + name + size/variant',
    cardBits.cat === 'Protein' && cardBits.name === 'Whey Protein' &&
    cardBits.meta === '2.2 kg · Chocolate', JSON.stringify(cardBits));
  check('card shows badge + price + stock + Add to Cart',
    cardBits.badge === 'Bestseller' && cardBits.price === '₹4,499' &&
    cardBits.stock === 'In Stock' && cardBits.button === 'Add to Cart', JSON.stringify(cardBits));
  check('card image uses a replaceable remote product image',
    /^https:\/\/images\.unsplash\.com\//.test(cardBits.img || ''), String(cardBits.img));

  const trust = await page.$$eval('.delivery-strip--dark .delivery-card strong', els => els.map(e => e.textContent.trim()));
  check('trust strip = COD + All India Delivery',
    trust.join('|') === 'Cash on Delivery Available|All India Delivery', trust.join('|'));

  await page.click('.page-btn[data-page="2"]');
  await wait(350);
  const saleMrp = await page.$$eval('.price-mrp', els => els.map(e => e.textContent.trim()));
  check('sale card shows struck-through MRP', saleMrp.length === 1 && saleMrp[0] === '₹4,999', saleMrp.join(','));

  // ---- 23. Screenshots ----
  await page.setViewport({ width: 1440, height: 1100 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(500);
  await page.screenshot({ path: 'test-shop-desktop.png' });

  await page.setViewport({ width: 390, height: 844 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(500);
  await page.screenshot({ path: 'test-shop-mobile.png' });

  // Only script errors matter; remote images need network so load failures are tolerated
  // product photography is supplied (the onerror fallback handles them).
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