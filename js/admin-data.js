/* ==========================================================================
   SPEED BOOST NUTRITION - ADMIN DEMO DATA
   --------------------------------------------------------------------------
   THIS IS NOT REAL BUSINESS DATA.

   rules.md 3 (Business Accuracy) forbids inventing real figures, and rules.md
   15 (Demo Rule) requires sample data to be clearly identifiable as demo data.
   Everything below is a plausible placeholder so the dashboard can be
   reviewed as a layout. Replace this whole file with real API responses once
   a backend exists; admin.js only reads from ADMIN_DATA.

   Rules honoured by this file:
     - Order status values match architecture.md section 6:
         PENDING / CONFIRMED / PROCESSING / SHIPPED / DELIVERED / CANCELLED
     - Payment status values match architecture.md section 7:
         COD / PAID / PENDING / FAILED / REFUNDED
     - Cancelled orders are NOT counted in sales totals (architecture.md 11).
     - No testimonials, ratings, certifications or awards are invented.
   ========================================================================== */
(function (global) {
  'use strict';

  var ADMIN_DATA = {

    /* ---------- KPI headline figures ---------- */
    kpi: {
      sales: '₹4,82,650',
      orders: '1,247',
      pending: '23',
      customers: '986'
    },

    /* ---------- Sales trend, one series per time filter (design.md 11) ----------
       Values are in rupees. Each range also carries the order count and the
       change against the previous equivalent period. */
    sales: {
      today: {
        label: 'Today',
        total: '₹24,180',
        orders: '11',
        change: '6.2%',
        changeDir: 'up',
        points: [1800, 2400, 1600, 3200, 2900, 4100, 3800, 5200]
      },
      '7d': {
        label: 'Last 7 days',
        total: '₹1,64,920',
        orders: '68',
        change: '9.1%',
        changeDir: 'up',
        points: [18400, 22100, 19800, 26300, 24100, 28700, 25600]
      },
      '30d': {
        label: 'Last 30 days',
        total: '₹6,84,310',
        orders: '286',
        change: '11.7%',
        changeDir: 'up',
        points: [
          18200, 21400, 19800, 24300, 22100, 26800, 25400, 23100, 27600,
          24900, 30200, 28800, 26400, 31900, 29500, 27300, 33400, 30600,
          28100, 34800, 32200, 29700, 36100, 33600, 31200, 38900, 35400,
          32900, 37100, 39800
        ]
      },
      month: {
        label: 'This month',
        total: '₹4,82,650',
        orders: '197',
        change: '12.4%',
        changeDir: 'up',
        points: [
          16200, 18900, 17400, 21600, 19800, 23400, 22100, 24600, 21200,
          26800, 24400, 27900, 25100, 30600, 28200, 25900, 33100, 30300,
          27800, 34800, 32100, 29600, 36900, 34100, 31700, 38600, 35200,
          32400, 39400, 34100, 31800, 36200, 40100
        ]
      }
    },
/* ---------- Order status overview (architecture.md 6) ---------- */
    /* Cancelled is tracked separately and excluded from sales. */
    orderStatus: [
      { key: 'pending',    label: 'Pending',    count: 23, color: '#c98a12' },
      { key: 'confirmed',  label: 'Confirmed',  count: 41, color: '#168cff' },
      { key: 'processing', label: 'Processing', count: 18, color: '#7c5cff' },
      { key: 'shipped',    label: 'Shipped',    count: 34, color: '#0f9bb5' },
      { key: 'delivered',  label: 'Delivered',  count: 96, color: '#20b15a' },
      { key: 'cancelled',  label: 'Cancelled',  count: 6,  color: '#d14343' }
    ],

    /* ---------- Recent orders ----------
       Names, phone numbers and addresses are sample records for a fictional
       local store. They are not real customers (rules.md 11). Phone numbers
       are masked so no realistic-looking number appears anywhere. */
    orders: [
      { id: '#SB-1042', customer: 'Amit Sharma',   phone: '98XXXX2214', items: 'Whey Protein, Creatine Monohydrate', amount: '₹5,798', payment: 'COD',     date: '12 Mar', status: 'pending'    },
      { id: '#SB-1041', customer: 'Priya Nair',    phone: '97XXXX8802', items: 'Pre-Workout',                      amount: '₹1,999', payment: 'Online', date: '12 Mar', status: 'confirmed'  },
      { id: '#SB-1040', customer: 'Rahul Verma',   phone: '99XXXX4317', items: 'Mass Gainer',                      amount: '₹3,999', payment: 'COD',     date: '11 Mar', status: 'processing' },
      { id: '#SB-1039', customer: 'Sneha Kapoor',  phone: '96XXXX1150', items: 'BCAA, Multivitamin',               amount: '₹2,498', payment: 'Online', date: '11 Mar', status: 'shipped'    },
      { id: '#SB-1038', customer: 'Vikas Chahal',  phone: '95XXXX7729', items: 'Whey Isolate',                     amount: '₹5,499', payment: 'COD',     date: '10 Mar', status: 'delivered'  },
      { id: '#SB-1037', customer: 'Ankit Dahiya',  phone: '70XXXX3391', items: 'C4 Pre-Workout',                   amount: '₹2,499', payment: 'Online', date: '10 Mar', status: 'delivered'  },
      { id: '#SB-1036', customer: 'Neha Bansal',   phone: '99XXXX6624', items: 'L-Glutamine',                      amount: '₹1,299', payment: 'COD',     date: '09 Mar', status: 'cancelled'  }
    ],

    /* ---------- Top selling products ----------
       Product names, prices and categories match the customer-facing demo
       catalogue in js/shop.js so the two halves of the site agree. */
    topProducts: [
      { name: 'Whey Protein',         category: 'Protein',     units: 412, revenue: '₹18,51,588', image: 'assets/products/whey-protein.jpg' },
      { name: 'Creatine Monohydrate', category: 'Creatine',    units: 356, revenue: '₹4,62,444',  image: 'assets/products/creatine.jpg' },
      { name: 'Mass Gainer',          category: 'Mass Gainer', units: 208, revenue: '₹8,31,792',  image: 'assets/products/mass-gainer.jpg' },
      { name: 'Pre-Workout',          category: 'Pre-Workout', units: 164, revenue: '₹3,27,836',  image: 'assets/products/pre-workout.jpg' },
      { name: 'BCAA',                 category: 'Other',       units: 141, revenue: '₹2,11,359',  image: 'assets/products/bcaa.jpg' }
    ],

    /* ---------- Needs attention ----------
       Every item is a UI placeholder describing a real admin task from
       rules.md 6, not a real alert. */
    alerts: [
      { tone: 'warning', title: '23 orders awaiting confirmation', text: 'Oldest pending order is 2 days old.' },
      { tone: 'danger',  title: '2 products low on stock',        text: 'ISO Whey Protein and Multivitamin need restocking.' },
      { tone: 'info',    title: '34 orders shipped',              text: 'Awaiting delivery confirmation from customers.' },
      { tone: 'info',    title: '6 orders cancelled this week',   text: 'Review reasons before the next restock.' }
    ]
  };

  global.ADMIN_DATA = ADMIN_DATA;
})(window);