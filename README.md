# D Web Studio

A business-focused nutrition e-commerce website and order management system built for D Web Studio.

## What This Project Solves

The business uses Instagram and a physical store to attract customers and sell nutrition products.

This project creates a structured digital sales workflow:

```text
Instagram
    ↓
Website
    ↓
Product
    ↓
Checkout
    ↓
Order
    ↓
Admin Dashboard
    ↓
Order Management
    ↓
Sales Data
```

## Product

### Customer Side

- Product catalogue
- Categories
- Product details
- Cart
- Checkout
- Cash on Delivery
- Online payment
- Order status

### Admin Side

- Dashboard
- Orders
- Customers
- Products
- Sales
- Notifications
- Settings

## Core Value

> **Turn Instagram-driven sales into an organized digital ordering and business-management workflow.**

## Documentation

Read these files before development:

1. [`prd.md`](./prd.md) — product requirements
2. [`architecture.md`](./architecture.md) — technical architecture
3. [`design.md`](./design.md) — UI/UX direction
4. [`phases.md`](./phases.md) — development phases
5. [`rules.md`](./rules.md) — development and product rules
6. [`ai-loop.md`](./ai-loop.md) — AI build/review workflow

## MVP

The MVP focuses on:

```text
Customer Website
+
Ordering
+
Admin Dashboard
+
Customer Management
+
Product Management
+
Sales Visibility
```

## Out of Scope

The first version does not include:

- Native mobile app
- AI chatbot
- Advanced CRM
- Complex inventory
- Multi-vendor support
- Advanced delivery tracking
- Loyalty system
- Unnecessary automation

## Development Principle

**Build the smallest system that solves the real business problem.**

Do not add features simply because they are technically possible.

## Data Safety

Never commit:

- `.env`
- API keys
- Database credentials
- Payment secrets
- Admin passwords
- Private customer data

Use environment variables for secrets.

## Business Content

Only use verified:

- Product information
- Prices
- Store details
- Contact details
- Delivery information
- Reviews
- Claims
- Certifications

Do not invent business information.

## Development Flow

```text
PRD
 ↓
Architecture
 ↓
Design
 ↓
Phase
 ↓
Implementation
 ↓
Verification
 ↓
Testing
 ↓
Demo
 ↓
Client Feedback
 ↓
Production
```

## Running the demo

There is no build step and no runtime dependency — the site is plain HTML/CSS/JS.

```text
Open index.html       → Home page
Open shop.html        → Shop page
Open categories.html  → Categories page
Open about.html       → About page
Open contact.html     → Contact page
Open admin.html       → Admin dashboard (orders, products, sales, alerts)
```

Smoke tests are included (dev-only, they drive the Chrome already installed on
the machine):

```bash
npm install            # installs puppeteer-core (dev only)
npm test               # all 6 suites — 394 checks
npm run test:index     # index.html only — 34 checks
npm run test:shop      # shop.html only — 65 checks
npm run test:categories # categories.html only — 54 checks
npm run test:about     # about.html only — 72 checks
npm run test:contact   # contact.html only — 82 checks
npm run test:admin     # admin.html only — 87 checks
```

## Status

**Current stage:** Customer storefront and admin dashboard — static demo

Built so far:

- `index.html` — Home page
- `shop.html` — Shop page (filters, price range, sorting, pagination, mobile filter drawer)
- `categories.html` — Categories page (8 category cards, featured block, popular categories, deep links into Shop)
- `about.html` — About page (hero, our story, 4 offer cards, dark "Why D Web Studio" section, physical store, CTA)
- `contact.html` — Contact page (hero, 4 contact cards, demo contact form, store location, FAQ, CTA)
- `admin.html` — Admin dashboard (sidebar, KPI row, sales chart, order status breakdown, attention panel, top products, filterable order table, mobile drawer)
- `css/style.css` — shared design system: tokens, a11y helpers, header, cards, footer
- `css/components.css` — shared inner-page components (page hero, breadcrumb, dark trust strip)
- `css/customer/home.css` — home-only layout
- `css/customer/shop.css` — shop-only layout
- `css/customer/categories.css` — categories-only layout
- `css/customer/about.css` — about-only layout
- `css/customer/contact.css` — contact-only layout (including the only form styles on the site)
- `css/admin/admin.css` — admin dashboard layout (sidebar, KPI cards, charts, order table)
- `js/data/products.js` — the sample catalogue, shared by the home and shop pages
- `js/customer/shop.js` — client-side filtering, sorting and pagination (no backend)
- `js/customer/contact.js` — contact form demo behaviour (validation only, sends nothing)
- `js/admin/admin-data.js` — hardcoded demo KPIs, orders, top products and alerts
- `js/admin/admin.js` — dashboard rendering, order filtering and the mobile sidebar drawer
- `tests/` — one Puppeteer suite per page, 394 checks in total
- `docs/reference/` — the React admin mockup this static dashboard was built from (never built, never linked)
- `assets/categories/README.md` — expected category image filenames and sizes

Every page loads its stylesheets in the same order: `css/style.css` → `css/components.css` → the page-specific stylesheet. That shared order is what keeps the visual identity identical across pages.

`css/style.css` also owns the accessibility helpers (`.skip-link`, `.sr-only`, `:focus-visible`) and the shared design tokens — the elevation, radius and motion scales — so a page only needs its own stylesheet for layout that is genuinely unique to it.

### Placeholders to replace before launch

Real photography and business data are not available yet, so these are clearly
marked placeholders (see `rules.md` section 3 — Business Accuracy):

- The eight **product counts** on the category cards.
- All `assets/*.jpg` images — see `assets/README.md`. Every `<img>` hides itself
  on error, so a missing photo never breaks the layout.
- Sample product names, prices, MRPs and brands in `js/data/products.js`.
- Every number on `admin.html` — KPIs, the sales chart, order statuses, top
  products and alerts are hardcoded mock data in `js/admin/admin-data.js`.
- The **"Get Directions"** link on `about.html` is `href="#"` until the exact
  verified store address / map URL is supplied.
- On `contact.html`: the **Call Us** and **WhatsApp** values are placeholders
  (no number is invented, and neither is a `tel:`/`wa.me` link); the **map** is
  a styled placeholder box rather than a real embed; and the **contact form**
  has no backend, so submitting it shows an inline "not connected yet" notice
  instead of pretending to send a message.

Every placeholder link pairs `href="#"` with `aria-disabled="true"`, so it is
announced as unavailable rather than as a working link, and picks up
`cursor:not-allowed` from `css/components.css`. Swap both attributes together
when the real destination arrives.

Next:

**Cart → Checkout → Order flow**, then wiring the admin dashboard to real data
instead of the mock values in `js/admin/admin-data.js`.

