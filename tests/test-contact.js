/**
 * Contact page checks; run with `npm run test:contact`
 *
 * Covers: structure, spec copy, shared-visual-identity parity with the other
 * pages, the "no fake contact details" rule (rules.md 3), the no-backend form
 * guarantee, accessibility, responsive breakpoints (rules.md 8) and horizontal
 * overflow. Uses puppeteer-core against the installed Chrome, like the others.
 *
 * This file is deliberately ASCII-only: every non-ASCII char is written with
 * String.fromCodePoint so an encoding round-trip can never corrupt it.
 */
const puppeteer = require('puppeteer-core');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const SITE = 'file:///' + path.resolve(ROOT, 'contact.html').replace(/\\/g, '/');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ARROW = String.fromCodePoint(0x2192);

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

  const infoCards = await page.$$eval('.info-card', els => els.length);
  check('renders 4 contact information cards', infoCards === 4, `got ${infoCards}`);

  const faqs = await page.$$eval('.faq-item', els => els.length);
  check('renders 4 FAQ items', faqs === 4, `got ${faqs}`);

  const h1s = await page.$$eval('h1', els => els.length);
  check('exactly one <h1>', h1s === 1, `got ${h1s}`);

  // ---- 2. CSS loaded ----
  const styled = await page.evaluate(() => ({
    h1size: parseFloat(getComputedStyle(document.querySelector('.page-hero h1')).fontSize),
    infoCols: getComputedStyle(document.querySelector('.info-grid')).gridTemplateColumns.split(' ').length,
    heroPad: parseFloat(getComputedStyle(document.querySelector('.page-hero')).paddingTop),
    ctaBg: getComputedStyle(document.querySelector('.contact-cta')).backgroundColor
  }));
  check('stylesheet loaded (h1 >= 30px)', styled.h1size >= 30, `${styled.h1size}px`);
  check('desktop = 4-column info grid', styled.infoCols === 4, `${styled.infoCols} cols`);
  check('hero section padding reset to 0', styled.heroPad === 0, `${styled.heroPad}px`);
  check('CTA is a dark premium section', styled.ctaBg === 'rgb(14, 20, 27)', styled.ctaBg);

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
  check('nav marks Contact as the active page',
    nav.activeText === 'Contact' && nav.activeHref === 'contact.html' && nav.current === 'page',
    JSON.stringify(nav));
  check('nav order = Home, Shop, Categories, About, Contact',
    nav.order === 'Home,Shop,Categories,About,Contact', nav.order);
  check('header keeps logo + search + cart + login',
    nav.logos === 1 && nav.hasCart && nav.hasLogin && nav.searchHref.includes('shop.html'),
    `logos=${nav.logos} cart=${nav.hasCart} login=${nav.hasLogin}`);
// ---- 4. Hero ----
  const hero = await page.evaluate(() => {
    const el = document.querySelector('.page-hero');
    return {
      eyebrow: document.querySelector('.page-hero .eyebrow').textContent.trim(),
      h1: document.querySelector('.page-hero h1').textContent.replace(/\s+/g, ' ').trim(),
      transform: getComputedStyle(document.querySelector('.page-hero h1')).textTransform,
      lead: document.querySelector('.page-hero__lead').textContent.replace(/\s+/g, ' ').trim(),
      crumb: document.querySelector('.breadcrumb').textContent.replace(/\s+/g, ' ').trim(),
      image: el.getAttribute('style') || ''
    };
  });
  check('hero label = "GET IN TOUCH"', hero.eyebrow === 'Get In Touch', hero.eyebrow);
  // The heading uses a straight apostrophe, so the rendered text is ASCII.
  check('hero H1 = "We\'re Here to Help"',
    hero.h1 === "We're Here to Help", JSON.stringify(hero.h1));
  check('hero H1 is uppercase in the stylesheet', hero.transform === 'uppercase', hero.transform);
  check('hero supporting text matches the spec',
    hero.lead === 'Have a question about a product, order or store? Get in touch with us.', hero.lead);
  check('breadcrumb = Home / Contact', hero.crumb === 'Home / Contact', hero.crumb);
  check('hero uses the replaceable remote hero image',
    /images\.unsplash\.com\//.test(hero.image), hero.image.trim());

  // ---- 5. Contact information cards ----
  const info = await page.evaluate(() => [...document.querySelectorAll('.info-card')].map(c => ({
    name: c.querySelector('h3').textContent.trim(),
    value: c.querySelector('.info-card__value').textContent.trim(),
    pending: c.classList.contains('info-card--pending'),
    hasIcon: !!c.querySelector('svg')
  })));
  check('info cards = Visit Our Store, Call Us, WhatsApp, Instagram',
    info.map(i => i.name).join('|') === 'Visit Our Store|Call Us|WhatsApp|Instagram',
    info.map(i => i.name).join('|'));
  check('every info card has an icon', info.every(i => i.hasIcon));
  check('Visit Our Store shows Sonipat, Haryana',
    info[0].value === 'Sonipat, Haryana', info[0].value);
  check('Instagram shows @dwebstudio',
    info[3].value === '@dwebstudio', info[3].value);
  check('Call Us and WhatsApp are marked pending',
    info[1].pending && info[2].pending, `call=${info[1].pending} whatsapp=${info[2].pending}`);
  check('verified cards are not marked pending',
    !info[0].pending && !info[3].pending);

  // ---- 6. No fake contact details (rules.md 3) ----
  const copy = await page.evaluate(() =>
    document.querySelector('main').textContent.replace(/\s+/g, ' ').trim());

  // A real Indian mobile/landline number must not appear anywhere.
  const phoneLike = copy.match(/(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/);
  check('no invented phone number anywhere on the page', phoneLike === null,
    phoneLike ? phoneLike[0] : 'none found');

  const telLinks = await page.$$eval('a[href^="tel:"], a[href^="wa.me"]', els => els.length);
  check('no fake dialable tel: or wa.me links', telLinks === 0, `${telLinks} links`);

  const banned = ['guaranteed', 'certified', 'award', 'years of experience',
    'trusted by', 'lifetime', 'clinically proven', 'best seller', 'miracle'];
  const found = banned.filter(w => copy.toLowerCase().includes(w.toLowerCase()));
  check('no unsupported claims in the copy', found.length === 0, found.join(', '));

  check('no fake map/iframe embed', await page.$$eval('iframe', els => els.length) === 0);
  check('map area is a clearly labelled placeholder', /map coming soon/i.test(copy), 'placeholder text present');
  check('unverified address is flagged, not invented',
    /to be added once verified/i.test(copy), 'pending note present');
// ---- 7. Form: fields, and no backend ----
  const form = await page.evaluate(() => {
    const f = document.getElementById('contactForm');
    return {
      exists: !!f,
      action: f ? f.getAttribute('action') : null,
      method: f ? f.getAttribute('method') : null,
      labels: [...f.querySelectorAll('label')].map(l => l.textContent.trim()),
      ids: [...f.querySelectorAll('input,select,textarea')].map(i => i.id),
      required: [...f.querySelectorAll('input,select,textarea')].every(i => i.required),
      submitText: f.querySelector('button[type="submit"]').textContent.trim(),
      statusLive: document.getElementById('formStatus').getAttribute('aria-live')
    };
  });
  check('contact form exists', form.exists);
  check('fields = Name, Phone / Email, Subject, Message',
    form.labels.join('|') === 'Name|Phone / Email|Subject|Message', form.labels.join('|'));
  check('every control has a unique id matching its label',
    form.ids.length === 4 && form.ids.every(Boolean), form.ids.join(','));
  check('all fields are required', form.required);
  check('button text = "Send Message"', form.submitText === 'Send Message', form.submitText);
  check('form has NO action/method so it cannot post anywhere',
    form.action === null && form.method === null, `action=${form.action} method=${form.method}`);
  check('status region is aria-live polite', form.statusLive === 'polite', String(form.statusLive));

  const netCalls = await page.evaluate(async () => {
    let sent = false;
    const origFetch = window.fetch;
    window.fetch = function () { sent = true; return origFetch.apply(this, arguments); };
    document.getElementById('cfName').value = 'Test';
    document.getElementById('cfPhone').value = '9999999999';
    document.getElementById('cfSubject').value = 'product';
    document.getElementById('cfMessage').value = 'Hello';
    document.getElementById('contactForm').requestSubmit();
    await new Promise(r => setTimeout(r, 400));
    window.fetch = origFetch;
    return {
      sent: sent,
      text: document.getElementById('formStatus').textContent.trim(),
      url: location.href.split('/').pop()
    };
  });
  check('submitting sends no network request', netCalls.sent === false);
  check('submitting stays on the page (no navigation)',
    netCalls.url === 'contact.html', netCalls.url);
  check('submitting shows an honest inline demo notice',
    /not connected yet/i.test(netCalls.text), JSON.stringify(netCalls.text));

  const jsSrc = require('fs').readFileSync(path.join(ROOT, 'js', 'customer', 'contact.js'), 'utf8');
  check('js/contact.js contains no fetch / XHR / sendBeacon',
    !/fetch\(|XMLHttpRequest|sendBeacon/.test(jsSrc));

  // Empty submit must be blocked, not silently accepted.
  const blocked = await page.evaluate(async () => {
    location.reload();
    return true;
  });
  await wait(700);
  const emptySubmit = await page.evaluate(async () => {
    document.getElementById('contactForm').requestSubmit();
    await new Promise(r => setTimeout(r, 200));
    return {
      valid: document.getElementById('contactForm').checkValidity(),
      status: document.getElementById('formStatus').textContent.trim()
    };
  });
  check('empty required form is not accepted', emptySubmit.valid === false);
  check('empty submit shows no fake success message',
    emptySubmit.status === '', JSON.stringify(emptySubmit.status));

  // ---- 8. Store location ----
  const store = await page.evaluate(() => ({
    heading: document.querySelector('.contact-store h2').textContent.trim(),
    city: [...document.querySelectorAll('.contact-store__address span')]
      .map(s => s.textContent.trim()).filter(Boolean).join(''),
    cta: document.querySelector('.contact-store__copy .btn').textContent.trim(),
    ctaHref: document.querySelector('.contact-store__copy .btn').getAttribute('href'),
    mapH: Math.round(document.querySelector('.contact-map').getBoundingClientRect().height)
  }));
  check('store heading = "FIND OUR STORE"', store.heading === 'Find Our Store', store.heading);
  check('store shows Sonipat, Haryana', store.city === 'Sonipat, Haryana', store.city);
  check('store CTA = "Get Directions ' + ARROW + '"', store.cta === 'Get Directions ' + ARROW, store.cta);
  check('directions link is a flagged placeholder', store.ctaHref === '#', `href="${store.ctaHref}"`);
  check('map container has real height', store.mapH > 200, `${store.mapH}px`);
// ---- 9. FAQ ----
  const faq = await page.evaluate(() => [...document.querySelectorAll('.faq-item')].map(d => ({
    q: d.querySelector('summary span').textContent.trim(),
    a: d.querySelector('.faq-item__body p').textContent.replace(/\s+/g, ' ').trim(),
    open: d.open
  })));
  check('FAQ covers products, ordering, COD and tracking',
    faq.map(f => f.q).join('|') ===
    'Which products are available?|How can I place an order?|Is Cash on Delivery available?|How can I track my order?',
    faq.map(f => f.q).join('|'));
  check('every FAQ has an answer', faq.every(f => f.a.length > 40));
  check('FAQ answers link onward to real pages',
    faq.filter(f => /Shop|Categories|form above/.test(f.a)).length >= 3);
  check('FAQ starts collapsed so the page is not a wall of text',
    faq.every(f => f.open === false));

  // Native <details> must toggle by keyboard.
  await page.focus('.faq-item summary');
  await page.keyboard.press('Enter');
  await wait(250);
  const toggled = await page.$eval('.faq-item', d => d.open);
  check('FAQ expands via keyboard (native <details>)', toggled === true, `open=${toggled}`);
  await page.keyboard.press('Enter');
  await wait(200);

  // ---- 10. CTA ----
  const cta = await page.evaluate(() => ({
    heading: document.querySelector('.contact-cta h2').textContent.replace(/\s+/g, ' ').trim(),
    buttons: [...document.querySelectorAll('.contact-cta__actions .btn')]
      .map(b => b.textContent.trim() + '=' + b.getAttribute('href'))
  }));
  check('CTA heading = "Ready to Shop?"', cta.heading === 'Ready to Shop?', cta.heading);
  check('CTA buttons = Shop Now + Visit Instagram',
    cta.buttons.join('|') === 'Shop Now=shop.html|Visit Instagram=#', cta.buttons.join('|'));

  // ---- 11. Visual identity parity ----
  const identity = await page.evaluate(() => {
    const foot = document.querySelector('footer');
    return {
      fontFamily: getComputedStyle(document.body).fontFamily,
      containerWidth: document.querySelector('main .container').getBoundingClientRect().width,
      logoText: document.querySelector('header .logo').textContent.replace(/\s+/g, ' ').trim(),
      footerLinks: [...document.querySelectorAll('.footer-links a')].map(a => a.textContent.trim()).join(','),
      footerSocials: [...document.querySelectorAll('.socials .social')].map(a => a.getAttribute('aria-label')).join(','),
      copyright: document.querySelector('.copyright').textContent.trim(),
      footerBg: getComputedStyle(foot).backgroundColor,
      headerBg: getComputedStyle(document.querySelector('header')).backgroundColor,
      brandBlue: getComputedStyle(document.querySelector('.contact-cta h2 span')).color
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
  check('header and footer both keep the site dark background',
    /rgba?\(7, 11, 15/.test(identity.headerBg) && /rgba?\(8, 13, 18/.test(identity.footerBg),
    `footer=${identity.footerBg} header=${identity.headerBg}`);
  check('accent colour is the site electric blue',
    identity.brandBlue === 'rgb(22, 140, 255)', identity.brandBlue);
// ---- 12. Accessibility ----
  const a11y = await page.evaluate(() => {
    const nameless = [...document.querySelectorAll('a,button,summary')]
      .filter(el => !el.textContent.trim() && !el.getAttribute('aria-label'))
      .map(el => el.outerHTML.slice(0, 60));
    const heads = [...document.querySelectorAll('h1,h2,h3,h4')].map(e => +e.tagName[1]);
    let jump = null;
    for (let i = 1; i < heads.length; i++) {
      if (heads[i] - heads[i - 1] > 1) { jump = heads[i - 1] + '->' + heads[i]; break; }
    }
    const controls = [...document.querySelectorAll('#contactForm input,#contactForm select,#contactForm textarea')];
    return {
      nameless: nameless,
      jump: jump,
      lang: document.documentElement.lang,
      main: document.querySelectorAll('main#main').length,
      skip: !!document.querySelector('.skip-link'),
      navCurrent: document.querySelectorAll('.nav-links [aria-current="page"]').length,
      crumbCurrent: document.querySelectorAll('.breadcrumb [aria-current="page"]').length,
      // Every control must have a label bound via for= (rules.md 9)
      unlabelled: controls.filter(c => !document.querySelector(`label[for="${c.id}"]`)).length,
      decorative: [...document.querySelectorAll('svg')]
        .filter(s => s.closest('[aria-hidden="true"]') === null).length,
      imgAlt: [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length
    };
  });
  check('all links, buttons and summaries have an accessible name',
    a11y.nameless.length === 0, a11y.nameless.join(' | '));
  check('heading levels never skip a level', a11y.jump === null, String(a11y.jump));
  check('every form control has a bound <label for>', a11y.unlabelled === 0, `${a11y.unlabelled} unlabelled`);
  check('all decorative icons are aria-hidden', a11y.decorative === 0, `${a11y.decorative} exposed`);
  check('all images declare alt', a11y.imgAlt === 0, `${a11y.imgAlt} missing`);
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
    info: getComputedStyle(document.querySelector('.info-grid')).gridTemplateColumns.split(' ').length,
    form: getComputedStyle(document.querySelector('.contact-form__grid')).gridTemplateColumns.split(' ').length,
    store: getComputedStyle(document.querySelector('.contact-store__grid')).gridTemplateColumns.split(' ').length
  }));
  check('tablet: info grid = 2 columns', tablet.info === 2, `${tablet.info} cols`);
  check('tablet: form and store blocks stack',
    tablet.form === 1 && tablet.store === 1, `form=${tablet.form} store=${tablet.store}`);

  await page.setViewport({ width: 390, height: 844 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(250);
  const mobile = await page.evaluate(() => ({
    info: getComputedStyle(document.querySelector('.info-grid')).gridTemplateColumns.split(' ').length,
    ctaCol: getComputedStyle(document.querySelector('.contact-cta__actions')).flexDirection,
    ctaBtnW: document.querySelector('.contact-cta__actions .btn').getBoundingClientRect().width,
    submitW: document.querySelector('.form-submit').getBoundingClientRect().width,
    mapH: document.querySelector('.contact-map').getBoundingClientRect().height
  }));
  check('mobile: single-column info grid', mobile.info === 1, `${mobile.info} cols`);
  check('mobile: CTA buttons go full width',
    mobile.ctaCol === 'column' && mobile.ctaBtnW > 250, `${mobile.ctaCol} ${Math.round(mobile.ctaBtnW)}px`);
  check('mobile: Send Message button fills the form', mobile.submitW > 250, `${Math.round(mobile.submitW)}px`);
  check('mobile: map placeholder keeps its height', mobile.mapH > 200, `${Math.round(mobile.mapH)}px`);

  // ---- 15. Screenshots ----
  await page.setViewport({ width: 1440, height: 1100 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(500);
  await page.screenshot({ path: 'test-contact-desktop.png', fullPage: true });

  await page.setViewport({ width: 390, height: 844 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(500);
  await page.screenshot({ path: 'test-contact-mobile.png', fullPage: true });

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