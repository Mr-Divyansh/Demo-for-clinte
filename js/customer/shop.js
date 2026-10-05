'use strict';
var CATALOG = window.SHOP_CATALOG;
var PRODUCTS = CATALOG.products;
var CATEGORY_LABELS = CATALOG.categoryLabels;
var BRAND_LABELS = CATALOG.brandLabels;
var AVAILABILITY_LABELS = [
  ['in-stock', 'In Stock'],
  ['sold-out', 'Out of Stock']
];
var PRICE_MIN  = 0;
var PRICE_MAX  = 5000;
var PRICE_STEP = 100;
var PER_PAGE = 8;
var state = {
  categories   : [],
  brands       : [],
  availability : [],
  priceMin     : PRICE_MIN,
  priceMax     : PRICE_MAX,
  search       : '',
  sort         : 'popularity',
  page         : 1,
  cartCount    : 0
};
function $(sel, root){ return (root || document).querySelector(sel); }
function $$(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function formatPrice(value){
  return '\u20B9' + Number(value).toLocaleString('en-IN');
}
function escapeHtml(str){
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function fallbackLabel(name){
  var clean = String(name).replace(/[^A-Za-z0-9 ()+-]/g, '').trim();
  return clean || 'Product';
}
function imageFallback(name){
  var label = fallbackLabel(name);
  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">' +
      '<rect width="320" height="320" fill="#f5f6f7"/>' +
      '<g fill="none" stroke="#ccd5dd" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="112" y="118" width="96" height="128" rx="14"/>' +
        '<path d="M132 118v-16h56v16"/>' +
        '<path d="M112 164h96"/>' +
      '</g>' +
      '<text x="160" y="290" font-family="Arial,Helvetica,sans-serif" font-size="19" ' +
        'font-weight="bold" fill="#8b96a1" text-anchor="middle">' + label + '</text>' +
    '</svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg).replace(/'/g, '%27');
}
function matchesSearch(product, term){
  if(!term){ return true; }
  var haystack = (product.name + ' ' + product.meta + ' ' +
    (CATEGORY_LABELS[product.category] || '')).toLowerCase();
  return haystack.indexOf(term) > -1;
}
function matchesPrice(product){
  if(product.price < state.priceMin){ return false; }
    if(state.priceMax < PRICE_MAX && product.price > state.priceMax){ return false; }
  return true;
}
function matchesAvailability(product){
  if(!state.availability.length){ return true; }
  var wantsIn  = state.availability.indexOf('in-stock') > -1 && product.inStock;
  var wantsOut = state.availability.indexOf('sold-out') > -1 && !product.inStock;
  return !!(wantsIn || wantsOut);
}
function matchesFilters(product){
  if(!matchesSearch(product, state.search)){ return false; }
  if(state.categories.length && state.categories.indexOf(product.category) === -1){
    return false;
  }
  if(state.brands.length && state.brands.indexOf(product.brand) === -1){
    return false;
  }
  if(!matchesAvailability(product)){ return false; }
  if(!matchesPrice(product)){ return false; }
  return true;
}
function getFilteredProducts(){
  var list = PRODUCTS.filter(matchesFilters);
  switch(state.sort){
    case 'price-asc':
      list.sort(function(a, b){ return a.price - b.price; });
      break;
    case 'price-desc':
      list.sort(function(a, b){ return b.price - a.price; });
      break;
    case 'newest':
      list.sort(function(a, b){ return b.added - a.added; });
      break;
    default:
            break;
  }
  return list;
}
function countForFacet(facet, value){
  return PRODUCTS.filter(function(product){
        if(facet === 'category' && product.category !== value){ return false; }
    if(facet === 'brand' && product.brand !== value){ return false; }
    if(facet === 'availability'){
      var wantsInStock = value === 'in-stock';
      if(wantsInStock !== !!product.inStock){ return false; }
    }
        if(!matchesSearch(product, state.search)){ return false; }
    if(facet !== 'category' &&
       state.categories.length &&
       state.categories.indexOf(product.category) === -1){
      return false;
    }
    if(facet !== 'brand' &&
       state.brands.length &&
       state.brands.indexOf(product.brand) === -1){
      return false;
    }
    if(facet !== 'availability' &&
       !matchesAvailability(product)){
      return false;
    }
    if(facet !== 'price' && !matchesPrice(product)){ return false; }
    return true;
  }).length;
}
function readCheckboxGroup(form, name){
  return $$('input[name="' + name + '"]:checked', form).map(function(input){
    return input.value;
  });
}
function syncPriceUI(){
  var minInput = $('#priceMin');
  var maxInput = $('#priceMax');
  if(!minInput || !maxInput){ return; }
  minInput.value = state.priceMin;
  maxInput.value = state.priceMax;
  var span = PRICE_MAX - PRICE_MIN;
  var lowPct  = ((state.priceMin - PRICE_MIN) / span) * 100;
  var highPct = ((state.priceMax - PRICE_MIN) / span) * 100;
  var fill = $('[data-price-fill]');
  if(fill){
    fill.style.left  = lowPct + '%';
    fill.style.width = Math.max(0, highPct - lowPct) + '%';
  }
  var minLabel = $('[data-price-min]');
  var maxLabel = $('[data-price-max]');
  if(minLabel){ minLabel.textContent = formatPrice(state.priceMin); }
  if(maxLabel){
    maxLabel.textContent = state.priceMax >= PRICE_MAX
      ? formatPrice(PRICE_MAX) + '+'
      : formatPrice(state.priceMax);
  }
    minInput.classList.toggle(
    'price-range__input--top',
    state.priceMin >= PRICE_MAX - PRICE_STEP
  );
}
function clampPriceHandles(moved){
  var minInput = $('#priceMin');
  var maxInput = $('#priceMax');
  var lo = parseInt(minInput.value, 10);
  var hi = parseInt(maxInput.value, 10);
  if(!(lo <= hi)){
    if(moved === maxInput){
      maxInput.value = minInput.value;
    } else {
      minInput.value = maxInput.value;
    }
  }
}
function readFiltersFromForm(){
  var form = $('#filterForm');
  if(!form){ return; }
  state.categories   = readCheckboxGroup(form, 'category');
  state.brands       = readCheckboxGroup(form, 'brand');
  state.availability = readCheckboxGroup(form, 'availability');
  var minInput = $('#priceMin');
  var maxInput = $('#priceMax');
  if(minInput && maxInput){
    clampPriceHandles(null);
    state.priceMin = parseInt(minInput.value, 10);
    state.priceMax = parseInt(maxInput.value, 10);
    syncPriceUI();
  }
}
function filterOptionHtml(name, value, label, count, checked){
  return '' +
    '<label class="filter-opt">' +
      '<input type="checkbox" name="' + name + '" value="' + value + '"' +
        (checked ? ' checked' : '') + '>' +
      '<span class="filter-opt__label">' + escapeHtml(label) + '</span>' +
      '<span class="filter-opt__count">' + count + '</span>' +
    '</label>';
}
function renderFilterOptions(){
  $$('[data-filter-group]').forEach(function(group){
    var type = group.getAttribute('data-filter-group');
    var html = '';
    if(type === 'category'){
      Object.keys(CATEGORY_LABELS).forEach(function(key){
        html += filterOptionHtml(
          'category', key, CATEGORY_LABELS[key],
          countForFacet('category', key),
          state.categories.indexOf(key) > -1
        );
      });
    }
    if(type === 'availability'){
      AVAILABILITY_LABELS.forEach(function(pair){
        html += filterOptionHtml(
          'availability', pair[0], pair[1],
          countForFacet('availability', pair[0]),
          state.availability.indexOf(pair[0]) > -1
        );
      });
    }
    if(type === 'brand'){
      Object.keys(BRAND_LABELS).forEach(function(key){
        html += filterOptionHtml(
          'brand', key, BRAND_LABELS[key],
          countForFacet('brand', key),
          state.brands.indexOf(key) > -1
        );
      });
    }
    group.innerHTML = html;
  });
}
function renderFilterBadge(){
  var count = state.categories.length +
              state.brands.length +
              state.availability.length +
              ((state.priceMin > PRICE_MIN || state.priceMax < PRICE_MAX) ? 1 : 0);
  var badge = $('[data-filter-badge]');
  if(!badge){ return; }
  badge.textContent = count;
  badge.classList.toggle('is-active', count > 0);
}
function badgeClass(badge){
  if(badge === 'Sale'){ return 'badge badge--sale'; }
  if(badge === 'New'){ return 'badge badge--new'; }
  return 'badge';
}
function productCardHtml(product){
  var name    = escapeHtml(product.name);
  var badge   = product.badge
    ? '<span class="' + badgeClass(product.badge) + '">' + escapeHtml(product.badge) + '</span>'
    : '';
  var priceHtml = (product.mrp && product.mrp > product.price)
    ? '<div class="price-row">' +
        '<div class="price">' + formatPrice(product.price) + '</div>' +
        '<del class="price-mrp">' + formatPrice(product.mrp) + '</del>' +
      '</div>'
    : '<div class="price">' + formatPrice(product.price) + '</div>';
  var stockHtml = product.inStock
    ? '<div class="stock">In Stock</div>'
    : '<div class="stock is-sold-out">Out of Stock</div>';
  var addBtn = product.inStock
    ? '<button class="add-cart" type="button" data-add-to-cart="' + product.id + '" ' +
        'data-name="' + name + '">Add to Cart</button>'
    : '<button class="add-cart" type="button" disabled>Sold Out</button>';
  return '' +
    '<article class="product-card' + (product.inStock ? '' : ' is-sold-out') + '">' +
      '<div class="product-image">' +
        badge +
        '<img src="' + escapeHtml(product.image) + '" alt="' + name + '"' +
        ' data-src="' + escapeHtml(product.image) + '"' +
        ' loading="lazy" decoding="async"' +
        ' onerror="this.onerror=null;this.src=\'' + imageFallback(product.name) + '\'">' +
      '</div>' +
      '<div class="product-info">' +
        '<p class="product-cat">' + escapeHtml(CATEGORY_LABELS[product.category] || '') + '</p>' +
        '<h3>' + name + '</h3>' +
        '<div class="product-meta">' + escapeHtml(product.meta) + '</div>' +
        priceHtml +
        stockHtml +
        addBtn +
      '</div>' +
    '</article>';
}
function renderProducts(){
  var list       = getFilteredProducts();
  var totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  if(state.page > totalPages){ state.page = totalPages; }
  var start     = (state.page - 1) * PER_PAGE;
  var pageItems = list.slice(start, start + PER_PAGE);
  $('#shopGrid').innerHTML = pageItems.map(productCardHtml).join('');
  $('#shopEmpty').classList.toggle('is-visible', list.length === 0);
  renderCount(list, start, pageItems.length);
  renderPagination(totalPages);
}
function renderCount(list, start, shown){
  var el = $('[data-result-count]');
  if(!el){ return; }
  if(list.length === 0){
    el.textContent = 'No products found';
    return;
  }
  el.innerHTML = 'Showing <strong>' + (start + 1) + '\u2013' + (start + shown) +
    '</strong> of <strong>' + list.length + '</strong> products';
}
function renderPagination(totalPages){
  var nav = $('#shopPagination');
  if(totalPages <= 1){
    nav.innerHTML = '';
    return;
  }
  var html = '';
  html += '<button class="page-btn" type="button" data-page="' + (state.page - 1) + '"' +
    (state.page === 1 ? ' disabled' : '') + ' aria-label="Previous page">\u2039</button>';
  for(var i = 1; i <= totalPages; i++){
    if(i === state.page){
      html += '<button class="page-btn" type="button" aria-current="page" data-page="' + i + '">' + i + '</button>';
    } else {
      html += '<button class="page-btn" type="button" data-page="' + i + '" aria-label="Page ' + i + '">' + i + '</button>';
    }
  }
  html += '<button class="page-btn" type="button" data-page="' + (state.page + 1) + '"' +
    (state.page === totalPages ? ' disabled' : '') + ' aria-label="Next page">\u203A</button>';
  nav.innerHTML = html;
}
function renderAll(){
  renderFilterOptions();
  syncPriceUI();
  renderProducts();
  renderFilterBadge();
}
function resetFilters(){
  var form = $('#filterForm');
  if(form){ form.reset(); }
  state.categories   = [];
  state.brands       = [];
  state.availability = [];
  state.priceMin     = PRICE_MIN;
  state.priceMax     = PRICE_MAX;
  state.search       = '';
  state.page         = 1;
  var search = $('#shopSearch');
  if(search){ search.value = ''; }
  renderAll();
}
var lastFocused = null;
function isDrawerMode(){
  return window.matchMedia('(max-width:1024px)').matches;
}
function openDrawer(){
  if(!isDrawerMode()){ return; }
  lastFocused = document.activeElement;
  $('#shopFilters').classList.add('is-open');
  $('.drawer-backdrop').classList.add('is-open');
  document.body.classList.add('drawer-open');
  $('[data-open-filters]').setAttribute('aria-expanded', 'true');
  var firstInput = $('#shopFilters input');
  if(firstInput){ firstInput.focus(); }
}
function closeDrawer(){
  $('#shopFilters').classList.remove('is-open');
  $('.drawer-backdrop').classList.remove('is-open');
  document.body.classList.remove('drawer-open');
  $('[data-open-filters]').setAttribute('aria-expanded', 'false');
  if(lastFocused && typeof lastFocused.focus === 'function'){
    lastFocused.focus();
  }
  lastFocused = null;
}
var toastTimer = null;
function addToCart(name){
  state.cartCount += 1;
  var counter = $('[data-cart-count]');
  if(counter){ counter.textContent = state.cartCount; }
  var toast = $('#shopToast');
  if(!toast){ return; }
  var text = $('[data-toast-text]');
  if(text){ text.textContent = name + ' added to cart'; }
  toast.classList.add('is-visible');
  if(toastTimer){ clearTimeout(toastTimer); }
  toastTimer = setTimeout(function(){
    toast.classList.remove('is-visible');
  }, 2400);
}
function initStateFromUrl(){
  var params = new URLSearchParams(window.location.search);
  var category = params.get('category');
  if(category && CATEGORY_LABELS[category]){
    state.categories = [category];
  }
  var brand = params.get('brand');
  if(brand && BRAND_LABELS[brand]){
    state.brands = [brand];
  }
  var search = params.get('q');
  if(search){
    state.search = search.toLowerCase();
    var field = $('#shopSearch');
    if(field){ field.value = search; }
  }
}
function bindEvents(){
  var form = $('#filterForm');
    form.addEventListener('input', function(e){
    var el = e.target;
    if(!el){ return; }
    if(el.type === 'range'){
      clampPriceHandles(el);
      state.priceMin = parseInt($('#priceMin').value, 10);
      state.priceMax = parseInt($('#priceMax').value, 10);
      state.page = 1;
      syncPriceUI();
      renderFilterOptions();
      renderProducts();
      renderFilterBadge();
      return;
    }
    readFiltersFromForm();
    state.page = 1;
    renderAll();
  });
    $$('[data-reset-filters]').forEach(function(btn){
    btn.addEventListener('click', resetFilters);
  });
    var searchTimer = null;
  $('#shopSearch').addEventListener('input', function(e){
    var value = e.target.value.toLowerCase();
    if(searchTimer){ clearTimeout(searchTimer); }
    searchTimer = setTimeout(function(){
      state.search = value;
      state.page = 1;
      renderAll();
    }, 200);
  });
    var focusSearch = $('[data-focus-search]');
  if(focusSearch){
    focusSearch.addEventListener('click', function(){
      var field = $('#shopSearch');
      field.focus();
      field.scrollIntoView({ block:'center', behavior:'smooth' });
    });
  }
    $('#shopSort').addEventListener('change', function(e){
    state.sort = e.target.value;
    state.page = 1;
    renderProducts();
  });
    $('#shopPagination').addEventListener('click', function(e){
    var btn = e.target.closest('[data-page]');
    if(!btn || btn.disabled){ return; }
    state.page = parseInt(btn.getAttribute('data-page'), 10);
    renderProducts();
    var top = $('#shopGrid').getBoundingClientRect().top + window.pageYOffset - 110;
    window.scrollTo({ top: top, behavior:'smooth' });
  });
    $('#shopGrid').addEventListener('click', function(e){
    var btn = e.target.closest('[data-add-to-cart]');
    if(!btn){ return; }
    addToCart(btn.getAttribute('data-name'));
  });
    $('[data-open-filters]').addEventListener('click', openDrawer);
  $$('[data-close-filters]').forEach(function(el){
    el.addEventListener('click', closeDrawer);
  });
    document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' || e.keyCode === 27){
      if($('#shopFilters').classList.contains('is-open')){
        closeDrawer();
      }
    }
  });
    window.addEventListener('resize', function(){
    if(!isDrawerMode() && $('#shopFilters').classList.contains('is-open')){
      closeDrawer();
    }
  });
}
function init(){
  initStateFromUrl();
  bindEvents();
  renderAll();
}
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
