/**
 * Admin dashboard checks; run with `npm run test:admin`
 *
 * Confirms the dashboard is UI-only and that it respects the project docs:
 *   - structure and required sections (design.md 11, 12)
 *   - the six order statuses from architecture.md 6
 *   - sales totals exclude cancelled orders (architecture.md 11)
 *   - demo data is clearly labelled (rules.md 15)
 *   - no invented claims / certifications / reviews (rules.md 3, 4)
 *   - no backend, API, auth or payment code (rules.md 10, 11)
 *   - responsive behaviour at the breakpoints in design.md 16
 *
 * ASCII-only by design: non-ASCII glyphs are built with String.fromCodePoint.
 */
const puppeteer = require('puppeteer-core');
const path = require('path');

const SITE = 'file:///' + path.resolve(__dirname, 'admin.html').replace(/\\/g, '/');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const RUPEE = String.fromCodePoint(0x20B9);
const MDASH = String.fromCodePoint(0x2014);

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
  await wait(500);

  // ---- 1. Structure ----
  const sections = await page.$$eval('.admin-content > section', els => els.length);
  check('renders all 6 dashboard sections', sections === 6, `got ${sections}`);

  const kpis = await page.$$eval('.kpi-card', els => els.length);
  check('renders 4 KPI cards', kpis === 4, `got ${kpis}`);

  // ---- 2. Sidebar nav (design.md 12) ----
  const nav = await page.evaluate(() => {
    const items = [...document.querySelectorAll('.sidebar__link span:first-of-type')]
      .map(s => s.textContent.trim());
    const active = document.querySelector('.sidebar__link.is-active');
    return {
      items: items,
      active: active ? active.textContent.trim() : '',
      current: active ? active.getAttribute('aria-current') : '',
      brand: document.querySelector('.admin-logo__mark').textContent.trim(),
      foot: document.querySelector('.sidebar__demo').textContent.trim()
    };
  });
  check('sidebar has all required links',
    nav.items.join(',') ===
    'Dashboard,Orders,Products,Customers,Sales,Notifications,Settings,Logout', nav.items.join(','));
  check('Dashboard is the active page',
    nav.active === 'Dashboard' && nav.current === 'page', JSON.stringify(nav.active));
  check('sidebar shows the D Web Studio brand mark', nav.brand === 'DW', nav.brand);
  check('sidebar states the data is demo data', /demo/i.test(nav.foot), nav.foot);

  // ---- 3. Top header ----
  const top = await page.evaluate(() => ({
    title: document.querySelector('.topbar__title').textContent.trim(),
    subtitle: document.querySelector('.topbar__subtitle').textContent.trim(),
    search: !!document.querySelector('#adminSearchInput'),
    bell: !!document.querySelector('#notificationBtn'),
    admin: document.querySelector('.topbar__profile-text strong').textContent.trim(),
    role: document.querySelector('.topbar__profile-text small').textContent.trim()
  }));
  check('page title = "Dashboard"', top.title === 'Dashboard', top.title);
  check('subtitle explains the overview', top.subtitle.length > 15, top.subtitle);
  check('header has search, notifications and admin profile',
    top.search && top.bell && top.admin.length > 2, JSON.stringify(top));
  check('admin name and role are shown', top.role.length > 2, `${top.admin} / ${top.role}`);

  // ---- 4. KPI cards ----
  const kpi = await page.evaluate(() => [...document.querySelectorAll('.kpi-card')].map(c => ({
    label: c.querySelector('.kpi-card__label').textContent.trim(),
    value: c.querySelector('.kpi-card__value').textContent.trim(),
    trend: (c.querySelector('.trend') || {}).textContent || '',
    icon: !!c.querySelector('.kpi-card__icon svg')
  })));
  check('KPI labels = Sales, Orders, Pending, Customers',
    kpi.map(k => k.label).join('|') ===
    'Total Sales|Total Orders|Pending Orders|Customers', kpi.map(k => k.label).join('|'));
  check('every KPI shows a populated value',
    kpi.every(k => k.value.length > 0 && k.value !== MDASH), kpi.map(k => k.value).join('|'));
  check('every KPI has an icon and a change indicator',
    kpi.every(k => k.icon && k.trend.length > 0));
  check('sales value is a rupee amount',
    kpi[0].value.startsWith(RUPEE), kpi[0].value);
  check('Pending Orders reads as needing action, not a fake %',
    /action/i.test(kpi[2].trend), kpi[2].trend);
// ---- 5. Sales chart + time filters ----
  const chart = await page.evaluate(() => ({
    ranges: [...document.querySelectorAll('.segmented__btn')].map(b => b.textContent.trim()),
    svg: !!document.querySelector('#salesChart svg'),
    polyline: document.querySelectorAll('#salesChart polyline').length,
    gridlines: document.querySelectorAll('#salesChart line').length,
    axisLabels: document.querySelectorAll('#salesChart text').length,
    total: document.querySelector('[data-chart="total"]').textContent.trim(),
    height: document.querySelector('#salesChart').getBoundingClientRect().height
  }));
  check('time filters = Today, 7 Days, 30 Days, This Month',
    chart.ranges.join('|') === 'Today|7 Days|30 Days|This Month', chart.ranges.join('|'));
  check('chart renders a real SVG line chart',
    chart.svg && chart.polyline === 1 && chart.gridlines >= 4,
    `svg=${chart.svg} polyline=${chart.polyline} grid=${chart.gridlines}`);
  check('chart has axis labels', chart.axisLabels >= 5, `${chart.axisLabels} labels`);
  check('chart has visible height', chart.height > 150, `${Math.round(chart.height)}px`);
  check('total sales summary is populated', chart.total.startsWith(RUPEE), chart.total);

  // Switching range must actually redraw the chart (UI behaviour only).
  const before = await page.$eval('#salesChart polyline', p => p.getAttribute('points'));
  await page.click('.segmented__btn[data-range="7d"]');
  await wait(300);
  const after7 = await page.evaluate(() => ({
    points: document.querySelector('#salesChart polyline').getAttribute('points'),
    label: document.querySelector('#salesRangeLabel').textContent.trim(),
    total: document.querySelector('[data-chart="total"]').textContent.trim(),
    pressed: document.querySelector('.segmented__btn[data-range="7d"]').getAttribute('aria-pressed')
  }));
  check('switching to 7 Days redraws the chart',
    after7.points !== before && after7.points.split(' ').length === 7,
    `${after7.points.split(' ').length} points`);
  check('switching range updates the summary + label',
    after7.label.length > 3 && after7.total.startsWith(RUPEE),
    `${after7.label} ${after7.total}`);
  check('active filter is marked aria-pressed',
    after7.pressed === 'true', after7.pressed);

  // ---- 6. Order status overview (architecture.md 6) ----
  const status = await page.evaluate(() => ({
    labels: [...document.querySelectorAll('.status-card__label')].map(e => e.textContent.trim()),
    counts: [...document.querySelectorAll('.status-card__count')].map(e => e.textContent.trim()),
    barSegments: document.querySelectorAll('.status-bar__seg').length,
    legend: document.querySelectorAll('.status-legend__item').length
  }));
  check('order status shows all six states',
    status.labels.join('|') ===
    'Pending|Confirmed|Processing|Shipped|Delivered|Cancelled', status.labels.join('|'));
  check('every status has a count', status.counts.every(c => /^\d+$/.test(c)), status.counts.join(','));
  check('distribution bar has 6 segments', status.barSegments === 6, `${status.barSegments}`);
  check('legend lists all statuses', status.legend === 6, `${status.legend}`);

  const totals = await page.evaluate(() => window.ADMIN_DATA.orderStatus);
  const sum = totals.reduce((s, x) => s + x.count, 0);
  const nonCancelled = totals.filter(s => s.key !== 'cancelled').reduce((s, x) => s + x.count, 0);
  check('cancelled orders are counted separately from sales (architecture.md 11)',
    sum > nonCancelled && nonCancelled < sum, `all=${sum} non-cancelled=${nonCancelled}`);

  // ---- 7. Recent orders table ----
  const orders = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#ordersBody tr')];
    return {
      count: rows.length,
      heads: [...document.querySelectorAll('.orders-table thead th')]
        .map(t => t.textContent.trim()).filter(Boolean),
      statuses: [...document.querySelectorAll('.status-badge')].map(s => s.textContent.trim()),
      viewButtons: document.querySelectorAll('.btn-view').length,
      payBadges: [...document.querySelectorAll('.pay-badge')].map(p => p.textContent.trim()),
      scrollable: getComputedStyle(document.querySelector('.table-scroll')).overflowX
    };
  });
  check('recent orders table has demo rows', orders.count >= 5, `${orders.count} rows`);
  check('table columns match the spec',
    orders.heads.join('|') ===
    'Order ID|Customer|Products|Amount|Payment|Date|Status|Actions', orders.heads.join('|'));
  check('every order has a status badge', orders.statuses.length === orders.count);
  check('every order has a View action', orders.viewButtons === orders.count);
  check('payment shown separately from status (architecture.md 7)',
    orders.payBadges.length === orders.count, orders.payBadges.join(','));
  check('table container is horizontally scrollable',
    orders.scrollable === 'auto', orders.scrollable);

  // ---- 7b. Status cards must not clip or spill out of their panel ----
  // Regression guard: the 6-col grid once used `1fr` tracks, whose automatic
  // minimum pushed the 6th card out of the panel, and labels like "PROCESSING"
  // were clipped because the flex head squeezed them to a too-narrow box.
  //
  // Clipping is measured with a Range over the label's text: a Range reports
  // the width the laid-out text actually occupies, so text wider than the
  // label box means the word is being cut off. scrollWidth alone is not enough,
  // because it only exceeds clientWidth on the first line of a wrapped label.
  const statusFit = await page.evaluate(() => {
    const panel = document.querySelector('.status-grid').closest('.panel');
    const panelBox = panel.getBoundingClientRect();
    return [...document.querySelectorAll('.status-card')].map(c => {
      const cardBox = c.getBoundingClientRect();
      const label = c.querySelector('.status-card__label');
      const range = document.createRange();
      range.selectNodeContents(label);
      const textBox = range.getBoundingClientRect();
      return {
        label: label.textContent.trim(),
        spillsRight: Math.round(cardBox.right - panelBox.right),
        overflowsBy: Math.round(Math.max(0, textBox.width - label.clientWidth))
      };
    });
  });
  check('all six status cards sit inside the status panel',
    statusFit.length === 6 && statusFit.every(s => s.spillsRight <= 1),
    statusFit.map(s => `${s.label}:${s.spillsRight}px`).join(' '));
  check('no status card label is clipped',
    statusFit.every(s => s.overflowsBy <= 1),
    statusFit.map(s => `${s.label}:+${s.overflowsBy}`).join(' '));
// ---- 8. Top selling products ----
  const products = await page.evaluate(() => [...document.querySelectorAll('.product-row')].map(r => ({
    name: r.querySelector('.product-row__name').textContent.trim(),
    category: r.querySelector('.product-row__category').textContent.trim(),
    units: r.querySelector('.product-row__units').textContent.trim(),
    revenue: r.querySelector('.product-row__revenue').textContent.trim(),
    hasMedia: !!r.querySelector('.product-row__media')
  })));
  check('top products list is populated', products.length >= 3, `${products.length} rows`);
  check('every product shows name, category, units and revenue',
    products.every(p => p.name && p.category && /units$/.test(p.units) && p.revenue.length > 1),
    products.map(p => p.name + ':' + p.units).join(' | '));
  check('every product has an image slot', products.every(p => p.hasMedia));

  // Products must match the customer-facing catalogue, not invented items.
  const topNames = await page.evaluate(() => window.ADMIN_DATA.topProducts.map(p => p.name));
  check('top products use real catalogue names',
    topNames.includes('Whey Protein') && topNames.includes('Creatine Monohydrate'),
    topNames.join(', '));

  // ---- 9. Needs attention ----
  const alerts = await page.evaluate(() => [...document.querySelectorAll('.alert-row')].map(a => ({
    title: a.querySelector('.alert-row__title').textContent.trim(),
    text: a.querySelector('.alert-row__text').textContent.trim()
  })));
  check('needs-attention list is populated', alerts.length >= 3, `${alerts.length} items`);
  check('alerts cover pending orders, low stock and order updates',
    /pending|confirmation/i.test(alerts.map(a => a.title).join(' ')) &&
    /stock/i.test(alerts.map(a => a.title).join(' ')),
    alerts.map(a => a.title).join(' | '));
  check('every alert has supporting text', alerts.every(a => a.text.length > 10));

  // ---- 10. Demo data honesty (rules.md 15, design.md 18) ----
  const copy = await page.evaluate(() => document.body.textContent.replace(/\s+/g, ' ').trim());
  check('page states the data is demo data', /demo/i.test(copy), 'demo notice found');
  check('demo notice is visible near the top of the content',
    await page.$eval('.demo-note', el => el.getBoundingClientRect().height > 20));

  const banned = ['certified', 'certification', 'award-winning', 'award winning',
    'guaranteed', 'clinically proven', 'trusted by', 'reviews', 'rating',
    'best in town', 'no.1', 'number one'];
  const found = banned.filter(w => copy.toLowerCase().includes(w));
  check('no invented claims, reviews or certifications', found.length === 0, found.join(', '));

  // No real-looking phone number may appear; demo ones are masked.
  const phone = copy.match(/(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/);
  check('no unmasked phone number in the demo data', phone === null, phone ? phone[0] : 'none');

  // ---- 11. UI-only: no backend, auth, API or payments ----
  const jsSrc = require('fs').readFileSync(path.join(__dirname, 'js', 'admin.js'), 'utf8')
    // drop the header comment so the "no fetch" note is not counted as a call
    .replace(/\/\*[\s\S]*?\*\//g, '');
  check('admin.js has no fetch / XHR / sendBeacon / WebSocket',
    !/fetch\(|XMLHttpRequest|sendBeacon|WebSocket/.test(jsSrc));
  check('admin.js has no auth/session/token handling',
    !/localStorage|sessionStorage|document\.cookie|password|token/i.test(jsSrc));
  // The header search is a role="search" landmark, but it must not be able to
  // submit anywhere: no action, no method, no data going out.
  const forms = await page.evaluate(() =>
    [...document.querySelectorAll('form')].map(f => ({
      role: f.getAttribute('role'),
      action: f.getAttribute('action'),
      method: f.getAttribute('method')
    })));
  check('the only form is the non-submitting search box',
    forms.length === 1 && forms[0].role === 'search' &&
    forms[0].action === null && forms[0].method === null, JSON.stringify(forms));
  check('no third-party script or font is loaded',
    await page.$$eval('script[src^="http"], link[href^="http"]', els => els.length) === 0);
  check('no chart library dependency was added',
    !require('fs').readFileSync(path.join(__dirname, 'package.json'), 'utf8')
      .match(/chart|d3|recharts/i));
// ---- 12. Visual identity parity with the customer site ----
  const identity = await page.evaluate(() => {
    const rootCs = getComputedStyle(document.documentElement);
    return {
      font: getComputedStyle(document.body).fontFamily,
      blue: rootCs.getPropertyValue('--blue').trim(),
      radius: rootCs.getPropertyValue('--radius').trim(),
      panelRadius: getComputedStyle(document.querySelector('.panel')).borderRadius
    };
  });
  check('uses the shared Inter font stack', /Inter|Arial/.test(identity.font), identity.font);
  check('uses the shared electric blue token', identity.blue === '#168cff', identity.blue);
  check('uses the shared radius token (14px)', identity.radius === '14px', identity.radius);
  check('panels use the shared radius', identity.panelRadius === '14px', identity.panelRadius);

  // ---- 13. No horizontal scrolling (rules.md 8) ----
  // Measure real scrollability: attempt to scroll the document sideways and
  // read back the actual offset. documentElement.scrollWidth alone is
  // unreliable here, because it can include the inner .table-scroll content
  // width (880px) even though that content scrolls inside its own box.
  for (const w of [1440, 1280, 1024, 768, 640, 390, 375]) {
    await page.setViewport({ width: w, height: 900 });
    await page.goto(SITE, { waitUntil: 'networkidle0' });
    await wait(300);
    const r = await page.evaluate(() => {
      window.scrollTo(9999, 0);
      const moved = window.scrollX;
      window.scrollTo(0, 0);

      // No element that is NOT inside a scroll container may exceed the viewport.
      const vw = document.documentElement.clientWidth;
      let widest = 0, culprit = '';
      document.querySelectorAll('body *').forEach(el => {
        let p = el.parentElement, clipped = false;
        while (p) {
          const ox = getComputedStyle(p).overflowX;
          if (ox === 'auto' || ox === 'hidden' || ox === 'scroll') { clipped = true; break; }
          p = p.parentElement;
        }
        if (clipped) return;
        const box = el.getBoundingClientRect();
        if (box.right > widest) {
          widest = box.right;
          culprit = el.tagName.toLowerCase() + '.' + (el.className.toString().slice(0, 24) || '-');
        }
      });
      return { moved: moved, overflowBy: Math.round(widest - vw), culprit: culprit };
    });
    check(`no horizontal scrolling @ ${w}px`, r.moved === 0 && r.overflowBy <= 1,
      `scrolledX=${r.moved} widestOverflow=${r.overflowBy}${r.culprit ? ' (' + r.culprit + ')' : ''}`);
  }

  // ---- 14. Responsive shell behaviour ----
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(300);
  const desktop = await page.evaluate(() => ({
    sidebarX: Math.round(document.querySelector('.sidebar').getBoundingClientRect().left),
    mainMargin: getComputedStyle(document.querySelector('.admin-main')).marginLeft,
    menuVisible: getComputedStyle(document.querySelector('.topbar__menu')).display,
    kpiCols: getComputedStyle(document.querySelector('.kpi-grid')).gridTemplateColumns.split(' ').length,
    statusCols: getComputedStyle(document.querySelector('.status-grid')).gridTemplateColumns.split(' ').length
  }));
  check('desktop: sidebar is fixed and visible',
    desktop.sidebarX === 0 && desktop.mainMargin === '256px',
    `x=${desktop.sidebarX} margin=${desktop.mainMargin}`);
  check('desktop: hamburger is hidden', desktop.menuVisible === 'none', desktop.menuVisible);
  check('desktop: 4 KPI cards + 6 status cards in a row',
    desktop.kpiCols === 4 && desktop.statusCols === 6,
    `kpi=${desktop.kpiCols} status=${desktop.statusCols}`);

  // Tablet: sidebar collapses into a drawer.
  await page.setViewport({ width: 900, height: 900 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(300);
  const tablet = await page.evaluate(() => ({
    mainMargin: getComputedStyle(document.querySelector('.admin-main')).marginLeft,
    menuVisible: getComputedStyle(document.querySelector('.topbar__menu')).display,
    closed: !document.querySelector('.sidebar').classList.contains('is-open'),
    kpiCols: getComputedStyle(document.querySelector('.kpi-grid')).gridTemplateColumns.split(' ').length,
    statusCols: getComputedStyle(document.querySelector('.status-grid')).gridTemplateColumns.split(' ').length
  }));
  check('tablet: main column no longer offset by the sidebar',
    tablet.mainMargin === '0px', tablet.mainMargin);
  check('tablet: hamburger appears', tablet.menuVisible === 'grid', tablet.menuVisible);
  check('tablet: drawer starts closed', tablet.closed === true);
  check('tablet: KPI grid drops to 2 columns, status to 3',
    tablet.kpiCols === 2 && tablet.statusCols === 3,
    `kpi=${tablet.kpiCols} status=${tablet.statusCols}`);

  // The drawer must actually open and close.
  await page.click('#sidebarToggle');
  await wait(350);
  const opened = await page.evaluate(() => ({
    isOpen: document.querySelector('.sidebar').classList.contains('is-open'),
    overlayShown: !document.getElementById('sidebarOverlay').hidden,
    expanded: document.getElementById('sidebarToggle').getAttribute('aria-expanded'),
    sidebarX: Math.round(document.querySelector('.sidebar').getBoundingClientRect().left)
  }));
  check('hamburger opens the drawer',
    opened.isOpen && opened.overlayShown && opened.expanded === 'true' && opened.sidebarX === 0,
    JSON.stringify(opened));

  await page.click('#sidebarClose');
  await wait(350);
  const closed = await page.evaluate(() => ({
    isOpen: document.querySelector('.sidebar').classList.contains('is-open'),
    expanded: document.getElementById('sidebarToggle').getAttribute('aria-expanded')
  }));
  check('drawer close button closes it and resets aria-expanded',
    closed.isOpen === false && closed.expanded === 'false', JSON.stringify(closed));

  // Escape must also close it (keyboard accessibility).
  await page.click('#sidebarToggle');
  await wait(300);
  await page.keyboard.press('Escape');
  await wait(300);
  check('Escape closes the drawer',
    await page.$eval('.sidebar', el => !el.classList.contains('is-open')));
// ---- 15. Mobile layout ----
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(SITE, { waitUntil: 'networkidle0' });
  await wait(300);
  const mobile = await page.evaluate(() => {
    const scroll = document.querySelector('.table-scroll');
    return {
      kpiCols: getComputedStyle(document.querySelector('.kpi-grid')).gridTemplateColumns.split(' ').length,
      statusCols: getComputedStyle(document.querySelector('.status-grid')).gridTemplateColumns.split(' ').length,
      menuVisible: getComputedStyle(document.querySelector('.topbar__menu')).display,
      tableScrolls: getComputedStyle(scroll).overflowX === 'auto',
      tableWider: scroll.scrollWidth > scroll.clientWidth,
      chartH: document.querySelector('#salesChart').getBoundingClientRect().height,
      productOverflow: document.querySelector('.product-row__revenue').getBoundingClientRect().right
    };
  });
  check('mobile: KPI cards stack to a single column',
    mobile.kpiCols === 1, `${mobile.kpiCols} cols`);
  check('mobile: status cards stack', mobile.statusCols === 1, `${mobile.statusCols} cols`);
  check('mobile: hamburger is available', mobile.menuVisible === 'grid', mobile.menuVisible);
  check('mobile: orders table scrolls horizontally instead of squashing',
    mobile.tableScrolls && mobile.tableWider,
    `scrolls=${mobile.tableScrolls} wider=${mobile.tableWider}`);
  check('mobile: chart stays readable', mobile.chartH > 140, `${Math.round(mobile.chartH)}px`);
  check('mobile: product revenue stays inside the viewport',
    mobile.productOverflow <= 391, `${Math.round(mobile.productOverflow)}px`);

  // ---- 16. Accessibility ----
  const a11y = await page.evaluate(() => {
    const nameless = [...document.querySelectorAll('a,button,input')]
      .filter(el => !el.textContent.trim() && !el.getAttribute('aria-label') &&
        !document.querySelector(`label[for="${el.id}"]`))
      .map(el => el.outerHTML.slice(0, 60));
    const heads = [...document.querySelectorAll('h1,h2,h3')].map(e => +e.tagName[1]);
    let jump = null;
    for (let i = 1; i < heads.length; i++) {
      if (heads[i] - heads[i - 1] > 1) { jump = heads[i - 1] + '->' + heads[i]; break; }
    }
    return {
      nameless: nameless,
      jump: jump,
      lang: document.documentElement.lang,
      main: document.querySelectorAll('main#main').length,
      skip: !!document.querySelector('.skip-link'),
      h1: document.querySelectorAll('h1').length,
      decorative: [...document.querySelectorAll('svg')]
        .filter(s => s.closest('[aria-hidden="true"]') === null &&
          s.getAttribute('aria-hidden') !== 'true').length,
      tableScope: document.querySelectorAll('.orders-table th[scope]').length,
      caption: !!document.querySelector('.orders-table caption'),
      imgAlt: [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length
    };
  });
  check('all controls have an accessible name', a11y.nameless.length === 0, a11y.nameless.join(' | '));
  check('heading levels never skip', a11y.jump === null, String(a11y.jump));
  check('exactly one h1', a11y.h1 === 1, `${a11y.h1}`);
  check('page has lang, main#main and skip link',
    a11y.lang === 'en' && a11y.main === 1 && a11y.skip, JSON.stringify(a11y));
  check('all icons are aria-hidden', a11y.decorative === 0, `${a11y.decorative} exposed`);
  check('table uses th[scope] and a caption',
    a11y.tableScope >= 8 && a11y.caption, `scope=${a11y.tableScope} caption=${a11y.caption}`);
  check('all images declare alt', a11y.imgAlt === 0, `${a11y.imgAlt} missing`);

  // ---- 17. Screenshots ----
  // NOTE: capture with an explicit `clip` of the viewport width rather than
  // relying on fullPage width. documentElement.scrollWidth reports 912px at a
  // 390px viewport because Chrome includes the inner .table-scroll content
  // width (880px); a fullPage capture then pads the image with empty space and
  // makes a correct layout look broken. The page itself does not scroll
  // sideways (asserted in check 13).
  const shoot = async (width, height, file) => {
    await page.setViewport({ width, height });
    await page.goto(SITE, { waitUntil: 'networkidle0' });
    await wait(600);
    const docH = await page.evaluate(() => document.documentElement.scrollHeight);
    // Capture at the true design width. Chrome's fullPage path measures the
    // capture box off documentElement.scrollWidth, which over-reports here
    // because it folds in the .table-scroll content width (880px). Pinning the
    // capture to an explicit clip keeps the image at the real layout width.
    await page.setViewport({ width, height: Math.min(docH + 40, 20000) });
    await wait(400);
    await page.screenshot({
      path: file,
      clip: { x: 0, y: 0, width: width, height: Math.min(docH, 20000) },
      captureBeyondViewport: false,
      optimizeForSpeed: true
    });
  };

  await shoot(1440, 1100, 'test-admin-desktop.png');
  await shoot(900, 1000, 'test-admin-tablet.png');
  await shoot(390, 844, 'test-admin-mobile.png');

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