/**
 * About page checks; run with `npm run test:about`
 *
 * Covers: structure, spec copy, shared-visual-identity parity with the other
 * pages, Shop deep links, business-accuracy guardrails (rules.md 3 and 4),
 * accessibility, responsive breakpoints (rules.md 8) and horizontal overflow.
 * Uses puppeteer-core against the installed Chrome, like the other suites.
 */
const puppeteer = require('puppeteer-core');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const SITE = 'file:///' + path.resolve(ROOT, 'about.html').replace(/\\/g, '/');
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
  const sections = await page.$$eval('main section', els => els.length);
  check('renders all 6 page sections', sections === 6, `got ${sections}`);

  const offers = await page.$$eval('.offer-card', els => els.length);
  check('renders 4 "What We Offer" cards', offers === 4, `got ${offers}`);

  const whyCards = await page.$$eval('.why-card', els => els.length);
  check('renders 4 "Why D Web Studio" points', whyCards === 4, `got ${whyCards}`);

  const h1s = await page.$$eval('h1', els => els.length);
  check('exactly one <h1>', h1s === 1, `got ${h1s}`);

  // ---- 2. CSS loaded ----
  const styled = await page.evaluate(() => {
    const h = document.querySelector('.page-hero h1');
    const offers = document.querySelector('.offer-grid');
    const why = document.querySelector('.about-why');
    return {
      h1size: parseFloat(getComputedStyle(h).fontSize),
      offerCols: getComputedStyle(offers).gridTemplateColumns.split(' ').length,
      whyCols: getComputedStyle(why.querySelector('.about-why__grid')).gridTemplateColumns.split(' ').length,
      whyBg: getComputedStyle(why).backgroundColor
    };
  });
  check('stylesheet loaded (h1 >= 30px)', styled.h1size >= 30, `${styled.h1size}px`);
  check('desktop = 4-column offer grid', styled.offerCols === 4, `${styled.offerCols} cols`);
  check('desktop = 4-column why grid', styled.whyCols === 4, `${styled.whyCols} cols`);
  check('"Why D Web Studio" is a dark section', styled.whyBg === 'rgb(8, 13, 18)', styled.whyBg);

  // ---- 3. Header / nav state ----
  const nav = await page.evaluate(() => {
    const active = document.querySelector('.nav-links .active');
    return {
      activeText: active ? active.textContent.trim() : '',
      activeHref: active ? active.getAttribute('href') : '',
      current: active ? active.getAttribute('aria-current') : '',
      order: [...document.querySelectorAll('.nav-links a')].map(a => a.textContent.trim()).join(','),
      logos: document.querySelectorAll('header .logo').length,
      hasCart: !!document.querySelector('.nav-actions [aria-label="Cart"]'),
      hasLogin: !!document.querySelector('.login-btn'),
      searchHref: (document.querySelector('.nav-actions a[aria-label="Search products"]') || {}).href || ''
    };
  });
  check('nav marks About as the active page',
    nav.activeText === 'About' && nav.activeHref === 'about.html' && nav.current === 'page', JSON.stringify(nav));
  check('nav order = Home, Shop, Categories, About, Contact',
    nav.order === 'Home,Shop,Categories,About,Contact', nav.order);
  check('header keeps logo + search + cart + login',
    nav.logos === 1 && nav.hasCart && nav.hasLogin && nav.searchHref.includes('shop.html'),
    `logos=${nav.logos} cart=${nav.hasCart} login=${nav.hasLogin}`);

  // ---- 4. Hero ----
  const hero = await page.evaluate(() => {
    const el = document.querySelector('.page-hero');
    return {
      pad: parseFloat(getComputedStyle(el).paddingTop),
      eyebrow: document.querySelector('.page-hero .eyebrow').textContent.trim(),
      h1: document.querySelector('.page-hero h1').textContent.replace(/\s+/g, ' ').trim(),
      accent: document.querySelector('.page-hero h1 span').textContent.trim(),
      lead: document.querySelector('.page-hero__lead').textContent.replace(/\s+/g, ' ').trim(),
      crumb: document.querySelector('.breadcrumb').textContent.replace(/\s+/g, ' ').trim(),
      image: el.getAttribute('style') || ''
    };
  });
  check('hero section padding reset to 0', hero.pad === 0, `${hero.pad}px`);
  check('hero label = "ABOUT D WEB STUDIO"', hero.eyebrow === 'About D Web Studio', hero.eyebrow);
  check('hero H1 = "Fuel Your Fitness. Build Your Goals."',
    hero.h1 === 'Fuel Your Fitness. Build Your Goals.', hero.h1);
  check('hero H1 accent line is "Build Your Goals."', hero.accent === 'Build Your Goals.', hero.accent);
  check('hero H1 is uppercase in the stylesheet',
    await page.$eval('.page-hero h1', el => getComputedStyle(el).textTransform) === 'uppercase');
  check('hero supporting text present', hero.lead.length > 40, hero.lead);
  check('breadcrumb = Home / About', hero.crumb === 'Home / About', hero.crumb);
  check('hero uses the replaceable remote hero image',
    /images\.unsplash\.com\//.test(hero.image), hero.image.trim());


// ---- 5. Our Story ----
  const story = await page.evaluate(() => ({
    eyebrow: document.querySelector('.about-story .eyebrow').textContent.trim(),
    heading: document.querySelector('.about-story h2').textContent.replace(/\s+/g, ' ').trim(),
    paras: document.querySelectorAll('.about-story__copy > p:not(.eyebrow)').length,
    img: document.querySelector('.about-story__media img').getAttribute('src'),
    cols: getComputedStyle(document.querySelector('.about-story__grid')).gridTemplateColumns.split(' ').length,
    text: document.querySelector('.about-story__copy').textContent
  }));
  check('story label = "OUR STORY"', story.eyebrow === 'Our Story', story.eyebrow);
  check('story has a heading', story.heading.length > 10, story.heading);
  check('story has 3 supporting paragraphs', story.paras === 3, `${story.paras}`);
  check('story covers physical + online shopping',
    /physical store|in person/i.test(story.text) && /online/i.test(story.text));
  check('story uses the replaceable remote store image', /^https:\/\/images\.unsplash\.com\//.test(story.img), story.img);
  check('desktop story block is a 2-column split', story.cols === 2, `${story.cols} cols`);

  // ---- 6. What We Offer ----
  const offer = await page.evaluate(() => [...document.querySelectorAll('.offer-card')].map(c => ({
    name: c.querySelector('h3').textContent.trim(),
    desc: c.querySelector('p').textContent.trim(),
    cta: c.querySelector('a').textContent.trim(),
    href: c.querySelector('a').getAttribute('href'),
    hasIcon: !!c.querySelector('svg')
  })));
  check('offer cards = Protein, Creatine, Mass Gainer, Pre-Workout',
    offer.map(o => o.name).join('|') === 'Protein|Creatine|Mass Gainer|Pre-Workout',
    offer.map(o => o.name).join('|'));
  check('every offer card has an icon', offer.every(o => o.hasIcon));
  check('every offer card has a short description',
    offer.every(o => o.desc.length > 20), offer.map(o => o.desc).join(' | '));
  check('every offer card has an Explore button',
    offer.every(o => o.cta === 'Explore'), offer.map(o => o.cta).join('|'));
  check('offer buttons deep-link into the Shop page',
    offer.every(o => /^shop\.html\?category=[a-z-]+$/.test(o.href)),
    offer.map(o => o.href).join(' | '));

  // ---- 7. Why D Web Studio ----
  const why = await page.evaluate(() => ({
    heading: document.querySelector('.about-why__head h2').textContent.replace(/\s+/g, ' ').trim(),
    eyebrow: document.querySelector('.about-why .eyebrow').textContent.trim(),
    titles: [...document.querySelectorAll('.why-card h3')].map(e => e.textContent.trim())
  }));
  check('why label = "WHY D WEB STUDIO"', why.eyebrow === 'Why D Web Studio', why.eyebrow);
  check('why heading = "More Than Just Supplements"', why.heading === 'More Than Just Supplements', why.heading);
  check('why covers quality, support, shopping and delivery',
    why.titles.join('|') ===
    'Quality-Focused Products|Helpful Support|Simple Shopping|Convenient Delivery', why.titles.join('|'));

  // ---- 8. Business accuracy guardrails (rules.md 3 and 4) ----
  const copy = await page.evaluate(() => document.querySelector('main').textContent.replace(/\s+/g, ' ').trim());
  const banned = [
    'guaranteed', 'guarantee', 'certified', 'certification', 'award',
    'years of experience', 'trusted by', 'lifetime', 'clinically proven',
    'testimonial', 'best seller', 'miracle', 'expert certified'
  ];
  const found = banned.filter(w => copy.toLowerCase().includes(w.toLowerCase()));
  check('no unsupported claims in the copy (rules.md 3/4)', found.length === 0, found.join(', '));
// ---- 9. Physical Store ----
  const store = await page.evaluate(() => ({
    eyebrow: document.querySelector('.about-store .eyebrow').textContent.trim(),
    location: document.querySelector('.about-store__location').textContent.replace(/\s+/g, ' ').trim(),
    cta: document.querySelector('.about-store__copy .btn').textContent.trim(),
    ctaHref: document.querySelector('.about-store__copy .btn').getAttribute('href'),
    img: document.querySelector('.about-store__media img').getAttribute('src'),
    bullets: document.querySelectorAll('.about-store__list li').length,
    cols: getComputedStyle(document.querySelector('.about-store__grid')).gridTemplateColumns.split(' ').length
  }));
  check('store label = "VISIT OUR STORE"', store.eyebrow === 'Visit Our Store', store.eyebrow);
  check('store shows Sonipat, Haryana', store.location === 'Sonipat, Haryana', store.location);
  // Compare by code point so this file stays pure ASCII and can never be
  // re-encoded (a PowerShell round-trip previously corrupted literal glyphs).
  check('store CTA = "Get Directions ->"',
    store.cta === 'Get Directions ' + String.fromCodePoint(0x2192), JSON.stringify(store.cta));
  check('store directions link is a flagged placeholder', store.ctaHref === '#', `href="${store.ctaHref}"`);
  check('store uses the replaceable remote store image', /^https:\/\/images\.unsplash\.com\//.test(store.img), store.img);
  check('store lists 3 practical points', store.bullets === 3, `${store.bullets}`);
  check('desktop store block is a 2-column split', store.cols === 2, `${store.cols} cols`);

  // ---- 10. CTA ----
  const cta = await page.evaluate(() => ({
    heading: document.querySelector('.about-cta h2').textContent.replace(/\s+/g, ' ').trim(),
    buttons: [...document.querySelectorAll('.about-cta__actions .btn')]
      .map(b => b.textContent.trim() + '=' + b.getAttribute('href')),
    bg: getComputedStyle(document.querySelector('.about-cta')).backgroundColor
  }));
  check('CTA heading = "Ready to Fuel Your Goals?"', cta.heading === 'Ready to Fuel Your Goals?', cta.heading);
  check('CTA buttons = Shop Products + Contact Us',
    cta.buttons.join('|') === 'Shop Products=shop.html|Contact Us=contact.html', cta.buttons.join('|'));
  check('CTA is a dark/blue premium section', cta.bg === 'rgb(14, 20, 27)', cta.bg);

  // ---- 11. Visual identity parity with the other pages ----
  const identity = await page.evaluate(() => {
    const pick = (sel, prop) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el)[prop] : '';
    };
    const foot = document.querySelector('footer');
    return {
      fontFamily: getComputedStyle(document.body).fontFamily,
      containerWidth: document.querySelector('main .container').getBoundingClientRect().width,
      logoText: document.querySelector('header .logo').textContent.replace(/\s+/g, ' ').trim(),
      footerLinks: [...document.querySelectorAll('.footer-links a')].map(a => a.textContent.trim()).join(','),
      footerSocials: [...document.querySelectorAll('.socials .social')].map(a => a.getAttribute('aria-label')).join(','),
      copyright: document.querySelector('.copyright').textContent.trim(),
      footerBg: getComputedStyle(foot).backgroundColor,
      blueBtn: pick('.about-cta .btn-primary', 'backgroundColor'),
      brandBlue: pick('.about-cta h2 span', 'color'),
      headerBg: getComputedStyle(document.querySelector('header')).backgroundColor
    };
  });
  check('uses the shared body font stack', /Inter|Arial|system-ui/i.test(identity.fontFamily), identity.fontFamily);
  check('reuses the shared .container width (1180px)', Math.round(identity.containerWidth) === 1180,
    `${Math.round(identity.containerWidth)}px`);
  check('logo matches the other pages', identity.logoText === 'DW D WEB STUDIO', identity.logoText);
  check('footer links match the other pages',
    identity.footerLinks === 'Home,Shop,Categories,About,Contact', identity.footerLinks);
  check('footer keeps Instagram, YouTube, Facebook',
    identity.footerSocials === 'Instagram,YouTube,Facebook', identity.footerSocials);
  check('copyright matches the other pages',
    identity.copyright === String.fromCodePoint(0x00A9) + ' 2026 D Web Studio. All rights reserved.',
    JSON.stringify(identity.copyright));
  // The header is deliberately slightly translucent over the page, the footer
  // solid — both must stay in the site's dark family.
  check('header and footer both keep the site dark background',
    /rgba?\(7, 11, 15/.test(identity.headerBg) && /rgba?\(8, 13, 18/.test(identity.footerBg),
    `footer=${identity.footerBg} header=${identity.headerBg}`);
// ---- 12. Accessibility ----
  const a11y = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')];
    const nameless = [...document.querySelectorAll('a,button')]
      .filter(el => !el.textContent.trim() && !el.getAttribute('aria-label') && !el.querySelector('.sr-only'))
      .map(el => el.outerHTML.slice(0, 60));
    const heads = [...document.querySelectorAll('h1,h2,h3,h4')].map(e => +e.tagName[1]);
    let jump = null;
    for (let i = 1; i < heads.length; i++) {
      if (heads[i] - heads[i - 1] > 1) { jump = heads[i - 1] + '->' + heads[i]; break; }
    }
    const decorative = [...document.querySelectorAll('svg')]
      .filter(s => s.closest('[aria-hidden="true"]') === null).length;
    return {
      imgNoAlt: imgs.filter(i => !i.hasAttribute('alt')).length,
      emptyAlt: imgs.filter(i => i.getAttribute('alt') === '').length,
      nameless: nameless,
      jump: jump,
      lang: document.documentElement.lang,
      main: document.querySelectorAll('main#main').length,
      skip: !!document.querySelector('.skip-link'),
      navCurrent: document.querySelectorAll('.nav-links [aria-current="page"]').length,
      crumbCurrent: document.querySelectorAll('.breadcrumb [aria-current="page"]').length,
      decorative: decorative
    };
  });
  check('all images declare an alt attribute', a11y.imgNoAlt === 0, `${a11y.imgNoAlt} missing`);
  check('all images have non-empty alt text', a11y.emptyAlt === 0, `${a11y.emptyAlt} empty`);
  check('all links/buttons have an accessible name', a11y.nameless.length === 0, a11y.nameless.join(' | '));
  check('heading levels never skip a level', a11y.jump === null, String(a11y.jump));
  check('all decorative icons are aria-hidden', a11y.decorative === 0, `${a11y.decorative} exposed`);
  check('page has lang, main#main, skip link and nav + breadcrumb aria-current',
    a11y.lang === 'en' && a11y.main === 1 && a11y.skip &&
    a11y.navCurrent === 1 && a11y.crumbCurrent === 1, JSON.stringify(a11y));

  // ---- 13. No horizontal overflow (rules.md 8) ----
  for (const w of [1440, 1280, 1024, 768, 640, 390, 375]) {
    await page.setViewport({ width: w, height: 900 });
    await page.goto(SITE, { waitUntil: 'networkidle0' });
    await wait(250);
    const over = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`no horizontal overflow @ ${w}px`, over <= 0, `overflow ${over}px`);
  }

  // ---- 14. Responsive layout ----
  await page.setViewport({ width: 1024, height: 900 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(250);
  const tablet = await page.evaluate(() => ({
    offer: getComputedStyle(document.querySelector('.offer-grid')).gridTemplateColumns.split(' ').length,
    why: getComputedStyle(document.querySelector('.about-why__grid')).gridTemplateColumns.split(' ').length,
    story: getComputedStyle(document.querySelector('.about-story__grid')).gridTemplateColumns.split(' ').length,
    store: getComputedStyle(document.querySelector('.about-store__grid')).gridTemplateColumns.split(' ').length
  }));
  check('tablet: offer + why grids = 2 columns',
    tablet.offer === 2 && tablet.why === 2, `offer=${tablet.offer} why=${tablet.why}`);
  check('tablet: story + store blocks stack',
    tablet.story === 1 && tablet.store === 1, `story=${tablet.story} store=${tablet.store}`);

  await page.setViewport({ width: 390, height: 844 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(250);
  const mobile = await page.evaluate(() => ({
    offer: getComputedStyle(document.querySelector('.offer-grid')).gridTemplateColumns.split(' ').length,
    why: getComputedStyle(document.querySelector('.about-why__grid')).gridTemplateColumns.split(' ').length,
    heroH1: parseFloat(getComputedStyle(document.querySelector('.page-hero h1')).fontSize),
    ctaBtnW: document.querySelector('.about-cta__actions .btn').getBoundingClientRect().width,
    ctaCol: getComputedStyle(document.querySelector('.about-cta__actions')).flexDirection
  }));
  check('mobile: single-column offer + why grids',
    mobile.offer === 1 && mobile.why === 1, `offer=${mobile.offer} why=${mobile.why}`);
  check('mobile: hero H1 stays >= 30px', mobile.heroH1 >= 30, `${mobile.heroH1}px`);
  check('mobile: CTA buttons go full width',
    mobile.ctaCol === 'column' && mobile.ctaBtnW > 250,
    `${mobile.ctaCol} ${Math.round(mobile.ctaBtnW)}px`);

  // ---- 15. Images degrade gracefully before real photos land ----
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(600);
  const degraded = await page.evaluate(() =>
    ['.about-story__media', '.about-store__media'].map(s => {
      const r = document.querySelector(s).getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    }));
  check('media placeholders keep their size with no photo',
    degraded.every(d => d.w > 100 && d.h > 100), JSON.stringify(degraded));

  // ---- 16. Deep link from an offer card reaches filtered Shop results ----
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(300);
  await page.click('.offer-card a');
  await wait(700);
  const landed = await page.evaluate(() => ({
    url: location.href,
    checked: (document.querySelector('input[name="category"][value="protein"]') || {}).checked,
    cards: document.querySelectorAll('#shopGrid .product-card').length
  }));
  check('offer CTA opens the filtered Shop page',
    /shop\.html\?category=protein$/.test(landed.url) && landed.checked === true && landed.cards === 3,
    `${landed.url.split('/').pop()} checked=${landed.checked} cards=${landed.cards}`);

  // ---- 17. Screenshots ----
  await page.setViewport({ width: 1440, height: 1100 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(500);
  await page.screenshot({ path: 'test-about-desktop.png', fullPage: true });

  await page.setViewport({ width: 390, height: 844 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(500);
  await page.screenshot({ path: 'test-about-mobile.png', fullPage: true });

  // Only script errors matter; remote images need network so load failures are tolerated
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
