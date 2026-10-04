# Speed Boost Nutrition

A business-focused nutrition e-commerce website and order management system built for Speed Boost Nutrition.

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
```

Smoke tests are included (dev-only, they drive the Chrome already installed on
the machine):

```bash
npm install            # installs puppeteer-core (dev only)
npm test               # all suites — 273 checks
npm run test:shop      # shop.html only — 65 checks
npm run test:categories # categories.html only — 54 checks
npm run test:about     # about.html only — 72 checks
npm run test:contact   # contact.html only — 82 checks
```

## Status

**Current stage:** Customer storefront — static demo

Built so far:

- `index.html` — Home page
- `shop.html` — Shop page (filters, price range, sorting, pagination, mobile filter drawer)
- `categories.html` — Categories page (8 category cards, featured block, popular categories, deep links into Shop)
- `about.html` — About page (hero, our story, 4 offer cards, dark "Why Speed Boost" section, physical store, CTA)
- `contact.html` — Contact page (hero, 4 contact cards, demo contact form, store location, FAQ, CTA)
- `css/style.css` — shared design system (tokens, header, cards, footer)
- `css/components.css` — shared inner-page components (page banner, breadcrumb, dark trust strip, a11y helpers)
- `css/shop.css` — shop-only layout
- `css/categories.css` — categories-only layout
- `css/about.css` — about-only layout
- `css/contact.css` — contact-only layout (including the first form styles on the site)
- `js/shop.js` — sample catalogue + client-side filtering (no backend)
- `js/contact.js` — contact form demo behaviour (validation only, sends nothing)
- `assets/categories/README.md` — expected category image filenames and sizes

Every page loads its stylesheets in the same order: `style.css` → `components.css` → the page-specific stylesheet. That shared order is what keeps the visual identity identical across pages.

### Placeholders to replace before launch

Real photography and business data are not available yet, so these are clearly
marked placeholders (see `rules.md` section 3 — Business Accuracy):

- The eight **product counts** on the category cards.
- All `assets/*.jpg` images — see `assets/README.md`. Every `<img>` hides itself
  on error, so a missing photo never breaks the layout.
- Sample product names, prices, MRPs and brands in `js/shop.js`.
- The **"Get Directions"** link on `about.html` is `href="#"` until the exact
  verified store address / map URL is supplied.
- On `contact.html`: the **Call Us** and **WhatsApp** values are placeholders
  (no number is invented, and neither is a `tel:`/`wa.me` link); the **map** is
  a styled placeholder box rather than a real embed; and the **contact form**
  has no backend, so submitting it shows an inline "not connected yet" notice
  instead of pretending to send a message.

Next:

**Cart → Checkout → Order flow, then the Admin Dashboard.**

