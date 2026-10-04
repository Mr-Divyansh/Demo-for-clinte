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
Open index.html  → Home page
Open shop.html   → Shop page
```

A smoke test for the shop page is included (dev-only, uses the Chrome already
installed on the machine):

```bash
npm install     # installs puppeteer-core (dev only)
npm test        # renders shop.html in headless Chrome and runs 65 checks
```

## Status

**Current stage:** Customer storefront — static demo

Built so far:

- `index.html` — Home page
- `shop.html` — Shop page (filters, price range, sorting, pagination, mobile filter drawer)
- `css/style.css` — shared design system (tokens, header, cards, footer)
- `css/shop.css` — shop-only layout
- `js/shop.js` — sample catalogue + client-side filtering (no backend)

Next:

**Cart → Checkout → Order flow, then the Admin Dashboard.**

