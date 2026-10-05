(function (global) {
  'use strict';
  var PRODUCTS = [
    { id:'p01', name:'Whey Protein',           category:'protein',     brand:'brand-1', meta:'2.2 kg · Chocolate',  price:4499, inStock:true,  badge:'Bestseller', image:'https://images.unsplash.com/photo-1693996045300-521e9d08cabc?auto=format&fit=crop&q=70&w=900&h=900',         added:4  },
    { id:'p02', name:'Creatine Monohydrate',   category:'creatine',    brand:'brand-2', meta:'300 g',               price:1299, inStock:true,  badge:'',           image:'https://images.unsplash.com/photo-1693996045435-af7c48b9cafb?auto=format&fit=crop&q=70&w=900&h=900',             added:11 },
    { id:'p03', name:'Mass Gainer',            category:'mass-gainer', brand:'brand-1', meta:'3 kg · Chocolate',    price:3999, inStock:true,  badge:'',           image:'https://images.unsplash.com/photo-1729704200280-0d0dda0f3c60?auto=format&fit=crop&q=70&w=900&h=900',          added:2  },
    { id:'p04', name:'Pre-Workout',            category:'pre-workout', brand:'brand-3', meta:'300 g · Fruit Punch', price:1999, inStock:true,  badge:'New',        image:'https://images.unsplash.com/photo-1610360277501-ea948686dc52?auto=format&fit=crop&q=70&w=900&h=900',          added:9  },
    { id:'p05', name:'ISO Whey Protein',       category:'protein',     brand:'brand-2', meta:'1 kg · Vanilla',      price:3499, inStock:false, badge:'',           image:'https://images.unsplash.com/photo-1693996045369-781799bbaea0?auto=format&fit=crop&q=70&w=900&h=900',             added:7  },
    { id:'p06', name:'BCAA',                   category:'other',       brand:'others',  meta:'300 g · Unflavoured', price:1499, inStock:true,  badge:'',           image:'https://images.unsplash.com/photo-1693996046865-19217d179161?auto=format&fit=crop&q=70&w=900&h=900',                 added:1  },
    { id:'p07', name:'L-Glutamine',            category:'other',       brand:'brand-3', meta:'300 g · Unflavoured', price:1299, inStock:true,  badge:'',           image:'https://images.unsplash.com/photo-1595257842044-8f021a58c8a0?auto=format&fit=crop&q=70&w=800&h=760',            added:6  },
    { id:'p08', name:'Multivitamin',           category:'other',       brand:'others',  meta:'60 Tablets',          price:999,  inStock:false, badge:'',           image:'https://images.unsplash.com/photo-1630408512470-1318546792ce?auto=format&fit=crop&q=70&w=900&h=900',         added:3  },
    { id:'p09', name:'Mass Gainer (Advanced)', category:'mass-gainer', brand:'brand-1', meta:'5 kg · Chocolate',    price:3999, inStock:true,  badge:'Sale', mrp:4999, image:'https://images.unsplash.com/photo-1646829873498-e874cfa27933?auto=format&fit=crop&q=70&w=900&h=900', added:10 },
    { id:'p10', name:'C4 Pre-Workout',         category:'pre-workout', brand:'brand-3', meta:'300 g · Watermelon',  price:2499, inStock:true,  badge:'',           image:'https://images.unsplash.com/photo-1693996047008-1b6210099be1?auto=format&fit=crop&q=70&w=900&h=900',                   added:8  },
    { id:'p11', name:'ZMA',                    category:'other',       brand:'others',  meta:'90 Capsules',         price:1199, inStock:true,  badge:'',           image:'https://images.unsplash.com/photo-1625480498292-631335ea1510?auto=format&fit=crop&q=70&w=900&h=900',                  added:5  },
    { id:'p12', name:'Whey Isolate',           category:'protein',     brand:'brand-1', meta:'1 kg · Chocolate',    price:5499, inStock:true,  badge:'Bestseller', image:'https://images.unsplash.com/photo-1693996045899-7cf0ac0229c7?auto=format&fit=crop&q=70&w=900&h=900',         added:12 }
  ];
  var CATEGORY_LABELS = {
    'protein'     : 'Protein',
    'creatine'    : 'Creatine',
    'mass-gainer' : 'Mass Gainer',
    'pre-workout' : 'Pre-Workout',
    'other'       : 'Other Supplements'
  };
  var BRAND_LABELS = {
    'brand-1' : 'Brand 1',
    'brand-2' : 'Brand 2',
    'brand-3' : 'Brand 3',
    'others'  : 'Others'
  };
  function byName(name) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].name === name) return PRODUCTS[i];
    }
    return null;
  }
  function byId(id) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === id) return PRODUCTS[i];
    }
    return null;
  }
  function categoryLabel(key) {
    return CATEGORY_LABELS[key] || '';
  }
  global.SHOP_CATALOG = {
    products: PRODUCTS,
    categoryLabels: CATEGORY_LABELS,
    brandLabels: BRAND_LABELS,
    byName: byName,
    byId: byId,
    categoryLabel: categoryLabel
  };
})(window);
