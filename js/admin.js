/* ==========================================================================
   SPEED BOOST NUTRITION - ADMIN DASHBOARD (UI ONLY)
   --------------------------------------------------------------------------
   Renders the demo data from js/admin-data.js into the dashboard markup and
   handles the two interactions the UI needs: the sales time filters and the
   responsive sidebar drawer.

   Deliberately NOT implemented (out of scope for this task):
     - no fetch / XMLHttpRequest / API calls
     - no authentication or session handling
     - no order status mutations, payments or business logic
   The dashboard only reads a local static object, so nothing can leak and
   nothing pretends to be a real system (rules.md 1, 10 and 11).

   The chart is plain SVG built by hand. rules.md 10 says do not introduce
   dependencies without a reason, so no charting library is used.
   ========================================================================== */
(function () {
  'use strict';

  var DATA = window.ADMIN_DATA;
  if (!DATA) return; // Nothing to render without data.

  /* ---------------------------------------------------------------- utils */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  // Builds an inline SVG node. Used for the chart, which is pure geometry.
  var SVG_NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    var node = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) {
        node.setAttribute(k, attrs[k]);
      }
    }
    return node;
  }

  // Compact rupee formatting for axis labels (no paise, Indian grouping).
  function shortMoney(n) {
    if (n >= 10000000) return (n / 10000000).toFixed(1) + 'Cr';
    if (n >= 100000) return (n / 100000).toFixed(1) + 'L';
    if (n >= 1000) return Math.round(n / 1000) + 'K';
    return String(n);
  }

  function niceMax(value) {
    if (value <= 0) return 10;
    var mag = Math.pow(10, Math.floor(Math.log(value) / Math.LN10));
    return Math.ceil(value / mag) * mag;
  }

  /* ----------------------------------------------------------------- KPIs */
  function renderKpis() {
    var map = {
      sales: DATA.kpi.sales,
      orders: DATA.kpi.orders,
      pending: DATA.kpi.pending,
      customers: DATA.kpi.customers
    };
    Object.keys(map).forEach(function (key) {
      var node = document.querySelector('[data-kpi="' + key + '"]');
      if (node) node.textContent = map[key];
    });
  }

  /* ------------------------------------------------- sales summary + tabs */
  function renderSalesSummary(rangeKey) {
    var range = DATA.sales[rangeKey];
    if (!range) return;

    var total = $('[data-chart="total"]');
    var orders = $('[data-chart="orders"]');
    var trend = $('[data-chart="trend"]');
    var label = $('#salesRangeLabel');

    if (total) total.textContent = range.total;
    if (orders) orders.textContent = range.orders;
    if (label) label.textContent = range.label;

    if (trend) {
      trend.textContent = (range.changeDir === 'down' ? '-' : '+') + range.change;
      trend.className = 'trend ' + (range.changeDir === 'down' ? 'trend--down' : 'trend--up');
    }
  }

  /* ------------------------------------------------------- sales chart SVG */
  function renderChart(rangeKey) {
    var host = $('#salesChart');
    var range = DATA.sales[rangeKey];
    if (!host || !range) return;

    var points = range.points;
    var W = 760;          // viewBox width; CSS scales it to the container
    var H = 240;
    var padL = 54, padR = 16, padT = 16, padB = 34;

    var innerW = W - padL - padR;
    var innerH = H - padT - padB;
    var max = niceMax(Math.max.apply(null, points));

    function x(i) {
      return padL + (points.length === 1 ? innerW / 2 : (innerW * i) / (points.length - 1));
    }
    function y(v) { return padT + innerH - (innerH * v) / max; }

    var svg = svgEl('svg', {
      viewBox: '0 0 ' + W + ' ' + H,
      preserveAspectRatio: 'none',
      'aria-hidden': 'true',
      focusable: 'false'
    });

    /* ---- horizontal gridlines + y labels ---- */
    var gridSteps = 4;
    for (var g = 0; g <= gridSteps; g++) {
      var value = (max / gridSteps) * g;
      var gy = y(value);
      svg.appendChild(svgEl('line', {
        x1: padL, y1: gy, x2: W - padR, y2: gy,
        stroke: '#eceff2', 'stroke-width': '1'
      }));

      var label = svgEl('text', {
        x: padL - 10, y: gy + 4,
        'text-anchor': 'end',
        'font-size': '11',
        fill: '#8a939c'
      });
      label.textContent = shortMoney(Math.round(value));
      svg.appendChild(label);
    }

    /* ---- area fill under the line ---- */
    var linePoints = points.map(function (v, i) { return x(i) + ',' + y(v); });

    var areaPath = 'M' + linePoints.join(' L') +
      ' L' + x(points.length - 1) + ',' + (padT + innerH) +
      ' L' + x(0) + ',' + (padT + innerH) + ' Z';

    svg.appendChild(svgEl('path', {
      d: areaPath, fill: '#168cff', 'fill-opacity': '0.1', stroke: 'none'
    }));

    /* ---- the trend line itself ---- */
    svg.appendChild(svgEl('polyline', {
      points: linePoints.join(' '),
      fill: 'none',
      stroke: '#168cff',
      'stroke-width': '2.5',
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
      'vector-effect': 'non-scaling-stroke'
    }));

    /* ---- x labels: first, middle and last only, so they never collide ---- */
    var labelIdx = points.length > 12
      ? [0, Math.floor((points.length - 1) / 2), points.length - 1]
      : points.map(function (_, i) { return i; });

    labelIdx.forEach(function (i) {
      var t = svgEl('text', {
        x: x(i),
        y: H - 10,
        'text-anchor': i === 0 ? 'start' : (i === points.length - 1 ? 'end' : 'middle'),
        'font-size': '11',
        fill: '#8a939c'
      });
      t.textContent = xLabelFor(rangeKey, i, points.length);
      svg.appendChild(t);
    });

    /* ---- last-point marker, so the latest value is obvious ---- */
    svg.appendChild(svgEl('circle', {
      cx: x(points.length - 1), cy: y(points[points.length - 1]), r: '4.5',
      fill: '#168cff', stroke: '#fff', 'stroke-width': '2'
    }));

    host.textContent = '';
    host.appendChild(svg);
  }

  // Small readable x-axis captions per range.
  function xLabelFor(rangeKey, i) {
    if (rangeKey === 'today') {
      return ['9a', '11a', '1p', '3p', '5p', '7p', '9p', '11p'][i] || '';
    }
    if (rangeKey === '7d') {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] || '';
    }
    return rangeKey === '30d' ? 'Day ' + (i + 1) : 'Day ' + (i + 1);
  }

  function setRange(rangeKey) {
    renderSalesSummary(rangeKey);
    renderChart(rangeKey);

    var btns = document.querySelectorAll('.segmented__btn');
    Array.prototype.forEach.call(btns, function (btn) {
      var active = btn.getAttribute('data-range') === rangeKey;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function initRangeFilters() {
    var btns = document.querySelectorAll('.segmented__btn');
    Array.prototype.forEach.call(btns, function (btn) {
      btn.addEventListener('click', function () {
        setRange(btn.getAttribute('data-range'));
      });
    });
    setRange('month');
  }
/* --------------------------------------------------- order status block */
  function renderStatus() {
    var grid = $('#statusGrid');
    var bar = $('#statusBar');
    var legend = $('#statusLegend');
    if (!grid) return;

    var list = DATA.orderStatus;
    var total = list.reduce(function (sum, s) { return sum + s.count; }, 0);

    /* ---- compact status cards ---- */
    grid.textContent = '';
    list.forEach(function (s) {
      var card = el('div', 'status-card');
      card.setAttribute('role', 'listitem');

      var dot = el('span', 'status-card__dot');
      dot.style.background = s.color;

      var head = el('div', 'status-card__head');
      head.appendChild(dot);
      head.appendChild(el('span', 'status-card__label', s.label));

      card.appendChild(head);
      card.appendChild(el('p', 'status-card__count', String(s.count)));
      card.appendChild(el('p', 'status-card__share',
        total ? Math.round((s.count / total) * 100) + '% of orders' : '0% of orders'));

      grid.appendChild(card);
    });

    /* ---- proportional distribution bar ---- */
    if (bar) {
      bar.textContent = '';
      list.forEach(function (s) {
        var seg = el('span', 'status-bar__seg');
        seg.style.width = total ? (s.count / total) * 100 + '%' : '0%';
        seg.style.background = s.color;
        bar.appendChild(seg);
      });
    }

    /* ---- legend ---- */
    if (legend) {
      legend.textContent = '';
      list.forEach(function (s) {
        var li = el('li', 'status-legend__item');

        var key = el('span', 'status-legend__key');
        key.style.background = s.color;

        li.appendChild(key);
        li.appendChild(el('span', 'status-legend__label', s.label));
        li.appendChild(el('strong', 'status-legend__value', String(s.count)));

        legend.appendChild(li);
      });
    }
  }

  /* --------------------------------------------------------- orders table */
  var STATUS_LABELS = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };

  function renderOrders() {
    var body = $('#ordersBody');
    var empty = $('#ordersEmpty');
    var wrap = $('.table-scroll');
    if (!body) return;

    var rows = DATA.orders;
    body.textContent = '';

    if (!rows.length) {
      if (empty) empty.hidden = false;
      if (wrap) wrap.hidden = true;
      return;
    }

    rows.forEach(function (o) {
      var tr = el('tr');

      tr.appendChild(el('td', 'orders-table__id', o.id));

      // Customer + masked phone
      var tdCust = el('td');
      tdCust.appendChild(el('span', 'orders-table__customer', o.customer));
      tdCust.appendChild(el('span', 'orders-table__phone', o.phone));
      tr.appendChild(tdCust);

      tr.appendChild(el('td', 'orders-table__items', o.items));
      tr.appendChild(el('td', 'orders-table__amount', o.amount));

      // Payment (architecture.md 7: payment state is independent of status)
      var tdPay = el('td');
      tdPay.appendChild(el('span', 'pay-badge', o.payment));
      tr.appendChild(tdPay);

      tr.appendChild(el('td', 'orders-table__date', o.date));

      var tdStatus = el('td');
      tdStatus.appendChild(el('span', 'status-badge status-badge--' + o.status,
        STATUS_LABELS[o.status] || o.status));
      tr.appendChild(tdStatus);

      var tdAct = el('td', 'orders-table__action');
      var btn = el('button', 'btn-view', 'View');
      btn.type = 'button';
      // No order detail page exists yet, so this must not navigate anywhere.
      btn.setAttribute('aria-disabled', 'true');
      btn.setAttribute('aria-label', 'View order ' + o.id);
      tdAct.appendChild(btn);
      tr.appendChild(tdAct);

      body.appendChild(tr);
    });
  }
/* ------------------------------------------------- top products + alerts */
  function renderProducts() {
    var list = $('#topProductsList');
    var empty = $('#productsEmpty');
    if (!list) return;

    var items = DATA.topProducts;
    list.textContent = '';

    if (!items.length) {
      if (empty) empty.hidden = false;
      return;
    }

    var maxUnits = items.reduce(function (m, p) { return Math.max(m, p.units); }, 0);

    items.forEach(function (p, i) {
      var li = el('li', 'product-row');

      li.appendChild(el('span', 'product-row__rank', String(i + 1)));

      /* Image falls back to a neutral tile so the row never collapses while
         real product photography is still missing. */
      var media = el('span', 'product-row__media');
      var img = el('img');
      img.src = p.image;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('error', function () { img.style.display = 'none'; });
      media.appendChild(img);
      li.appendChild(media);

      var main = el('span', 'product-row__main');
      main.appendChild(el('span', 'product-row__name', p.name));
      main.appendChild(el('span', 'product-row__category', p.category));

      // Proportion bar showing relative units sold
      var bar = el('span', 'product-row__bar');
      var fill = el('span', 'product-row__fill');
      fill.style.width = maxUnits ? (p.units / maxUnits) * 100 + '%' : '0%';
      bar.appendChild(fill);
      main.appendChild(bar);

      li.appendChild(main);

      li.appendChild(el('span', 'product-row__units', String(p.units) + ' units'));
      li.appendChild(el('span', 'product-row__revenue', p.revenue));

      list.appendChild(li);
    });
  }

  var ALERT_ICONS = {
    warning: '<path d="M12 8.5v4.5M12 16.3h.01"/><circle cx="12" cy="12" r="8.5"/>',
    danger: '<path d="M12 8.5v4.5M12 16.3h.01"/><circle cx="12" cy="12" r="8.5"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 7.8h.01"/>'
  };

  function renderAlerts() {
    var list = $('#alertList');
    var empty = $('#alertsEmpty');
    if (!list) return;

    var items = DATA.alerts;
    list.textContent = '';

    if (!items.length) {
      if (empty) empty.hidden = false;
      return;
    }

    items.forEach(function (a) {
      var li = el('li', 'alert-row alert-row--' + a.tone);

      var icon = el('span', 'alert-row__icon');
      icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" ' +
        'aria-hidden="true">' + (ALERT_ICONS[a.tone] || ALERT_ICONS.info) + '</svg>';
      li.appendChild(icon);

      var body = el('span', 'alert-row__body');
      body.appendChild(el('span', 'alert-row__title', a.title));
      body.appendChild(el('span', 'alert-row__text', a.text));
      li.appendChild(body);

      var chevron = el('span', 'alert-row__chevron');
      chevron.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
        'aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
      li.appendChild(chevron);

      list.appendChild(li);
    });
  }

  /* ------------------------------------------------- responsive sidebar */
  function initSidebar() {
    var sidebar = $('#sidebar');
    var overlay = $('#sidebarOverlay');
    var toggle = $('#sidebarToggle');
    var close = $('#sidebarClose');
    if (!sidebar || !toggle) return;

    function setOpen(open) {
      sidebar.classList.toggle('is-open', open);
      document.body.classList.toggle('has-drawer-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (overlay) overlay.hidden = !open;
    }

    toggle.addEventListener('click', function () {
      setOpen(!sidebar.classList.contains('is-open'));
    });

    if (close) {
      close.addEventListener('click', function () { setOpen(false); });
    }

    if (overlay) {
      overlay.addEventListener('click', function () { setOpen(false); });
    }

    // Escape closes the drawer (keyboard accessibility, rules.md 9).
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidebar.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ---------------------------------------------------------------- init */
  function init() {
    renderKpis();
    initRangeFilters();
    renderStatus();
    renderOrders();
    renderProducts();
    renderAlerts();
    initSidebar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();