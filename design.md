# D Web Studio — Design System

## 1. Design Goal

Create a simple, premium, trustworthy supplement-store experience.

The design should feel like a real local fitness/nutrition business with a strong online presence — not a generic AI-generated e-commerce template.

---

# 2. Brand Direction

The provided Instagram content shows a strong fitness-store identity with bold branding, a physical store, product imagery, and owner-led content.

The website should respect that identity.

### Visual character

- Bold
- Clean
- Energetic
- Trustworthy
- Product-focused
- Modern
- Easy to scan

Do not copy Instagram's visual clutter directly into the website.

---

# 3. Color Direction

Use a restrained palette:

### Base

- White / off-white
- Near-black / charcoal

### Primary Accent

- Brand red derived from the approved logo/brand assets

### Secondary Accent

- Optional dark/blue tone only where it exists naturally in approved brand assets

Do not introduce many unrelated colors.

Use status colors only when necessary:

- Pending
- Confirmed
- Processing
- Shipped
- Delivered
- Cancelled

---

# 4. Typography

Use a modern sans-serif.

Priorities:

- Strong headings
- Highly readable body text
- Clear product prices
- Compact dashboard labels

Avoid decorative fonts.

---

# 5. Customer Website Layout

## Header

- Logo
- Home
- Shop
- Categories
- About/Store
- Contact
- Cart

Mobile:

- Logo
- Cart
- Menu

---

# 6. Homepage

Recommended order:

```text
Header
↓
Hero
↓
Featured Products
↓
Categories
↓
Why Shop With Us
↓
Delivery / COD
↓
Store / Brand section
↓
Instagram/social proof
↓
CTA
↓
Footer
```

Keep the page focused on ordering.

---

# 7. Product Cards

Each card should prioritize:

1. Product image
2. Product name
3. Size/variant
4. Price
5. Availability
6. Add to Cart / Buy Now

Avoid filling cards with unnecessary text.

---

# 8. Product Page

Include:

- Large product image
- Product name
- Price
- Variant/size
- Availability
- Quantity selector
- Add to Cart
- Buy Now
- Short verified description
- Delivery/payment information

---

# 9. Checkout UI

Checkout must be extremely simple.

Use clear sections:

```text
Customer Details
↓
Delivery Address
↓
Order Summary
↓
Payment Method
↓
Place Order
```

On mobile, avoid multi-column layouts that require horizontal scanning.

---

# 10. Order Status UI

Use a simple timeline:

```text
✓ Order Placed
      ↓
✓ Confirmed
      ↓
● Processing
      ↓
○ Shipped
      ↓
○ Delivered
```

Only show states that actually occurred.

---

# 11. Admin Dashboard

The dashboard should be more functional than decorative.

## Top

- Page title
- Date/filter
- Notifications
- Admin profile

## KPI Cards

- Total Sales
- Total Orders
- Pending Orders
- Customers

## Main

### Sales Overview

Line/bar chart with:

- Today
- 7 Days
- 30 Days
- This Month

### Order Overview

Simple visual distribution of:

- Pending
- Confirmed
- Processing
- Shipped
- Delivered
- Cancelled

### Recent Orders

Table/list:

```text
Order
Customer
Amount
Payment
Status
Date
```

---

# 12. Admin Navigation

Desktop:

```text
Dashboard
Orders
Products
Customers
Sales
Notifications
Settings
```

Mobile:

Use a compact navigation/drawer.

---

# 13. Dashboard Principles

The owner should understand the dashboard within 5 seconds.

Priority:

```text
What sold?
How much sold?
How many orders?
What needs attention?
```

Avoid:

- Too many charts
- Decorative graphs
- Huge cards
- Excessive gradients
- Data that has no business meaning

---

# 14. Components

Use reusable:

- Buttons
- Cards
- Inputs
- Selects
- Product cards
- Status badges
- Tables
- Modals
- Toasts
- Empty states
- Loading states
- Error states
- Pagination where needed

---

# 15. States

Every important screen needs:

### Loading

Show a clear loading state.

### Empty

Example:

> No orders yet.

### Error

Example:

> We couldn't load your orders. Please try again.

### Success

Use a clear confirmation message.

---

# 16. Responsive Design

Customer:

**Mobile-first**

Admin:

**Desktop-first but fully responsive**

Test at:

```text
1440
1280
1024
768
640
390
375
```

---

# 17. Motion

Use subtle motion only when useful:

- Button feedback
- Cart updates
- Modal transitions
- Page transitions where appropriate

Avoid:

- Constant floating elements
- Large entrance animations
- Excessive parallax
- Distracting effects

---

# 18. Trust Design

Because this is a supplement business, trust matters.

Use real, verified assets:

- Real store photos
- Real product images
- Real business information
- Real delivery information
- Real contact details
- Verified policies

Do not fabricate:

- Reviews
- Certifications
- Claims
- Awards
- Partnerships

---

# 19. Design Rule

**Simple does not mean empty.**

Every element should have a reason.

The final experience should feel:

> **Professional enough to trust, simple enough to buy.**
