# Speed Boost Nutrition — Architecture

## 1. Architecture Goal

Use a simple architecture that can support:

- Customer storefront
- Product catalogue
- Cart
- Checkout
- Orders
- Payments
- Admin dashboard
- Customers
- Sales analytics
- Notifications

The architecture must remain simple enough for MVP and extensible enough for future mobile apps.

---

# 2. High-Level Architecture

```text
                CUSTOMER
                   │
                   ▼
          ┌─────────────────┐
          │  Storefront UI  │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Application/API │
          └───────┬─┬───────┘
                  │ │
          ┌───────┘ └────────┐
          ▼                  ▼
   ┌─────────────┐    ┌──────────────┐
   │  Database   │    │ Payment      │
   │             │    │ Gateway      │
   └─────────────┘    └──────────────┘
          ▲
          │
   ┌──────┴───────┐
   │ Admin Panel   │
   └───────────────┘
```

---

# 3. Application Areas

## Customer

Public routes/pages:

```text
/
 /products
 /products/[slug]
 /cart
 /checkout
 /order/[id]
 /order/[id]/status
```

## Admin

Protected routes:

```text
/admin
/admin/orders
/admin/orders/[id]
/admin/products
/admin/customers
/admin/sales
/admin/notifications
/admin/settings
```

Exact route structure may change with implementation.

---

# 4. Recommended Technology Direction

The implementation may use a modern TypeScript full-stack framework.

Recommended baseline:

- TypeScript
- React-based UI
- Server-side API/actions
- PostgreSQL
- ORM such as Prisma
- Secure authentication
- Payment-gateway integration
- Responsive CSS/UI system

The exact framework and provider must be confirmed before implementation and recorded in the project.

Do not introduce a technology merely because it is popular.

---

# 5. Database Model

## Admin

```text
id
name
email
passwordHash / authProviderId
createdAt
updatedAt
```

## Customer

```text
id
name
phone
email (optional)
address
city
state
pincode
createdAt
updatedAt
```

## Category

```text
id
name
slug
active
createdAt
updatedAt
```

## Product

```text
id
categoryId
name
slug
description
price
image
size / variant
stockStatus
active
createdAt
updatedAt
```

## Order

```text
id
customerId
orderNumber
status
paymentStatus
subtotal
deliveryFee
total
createdAt
updatedAt
```

## OrderItem

```text
id
orderId
productId
productNameSnapshot
unitPriceSnapshot
quantity
subtotal
```

Snapshots are important so historical orders do not change when a product name or price changes later.

## Payment

```text
id
orderId
method
status
gatewayReference
amount
createdAt
updatedAt
```

## Notification

```text
id
recipientType
recipientId
type
title
message
readAt
createdAt
```

---

# 6. Order State Rules

Allowed order flow:

```text
PENDING
→ CONFIRMED
→ PROCESSING
→ SHIPPED
→ DELIVERED
```

Cancellation:

```text
PENDING → CANCELLED
CONFIRMED → CANCELLED
PROCESSING → CANCELLED
```

The final allowed transitions should be enforced in backend logic.

---

# 7. Payment State

Payment status must be independent:

```text
PENDING
PAID
FAILED
COD
REFUNDED
```

Do not treat an order as paid merely because the browser says payment succeeded.

Payment verification must come from the trusted server-side gateway flow.

---

# 8. Server Responsibilities

Server/backend is responsible for:

- Authentication
- Authorization
- Product retrieval
- Cart/order validation
- Price calculation
- Order creation
- Payment verification
- Status transitions
- Customer records
- Sales calculations
- Notifications

Never trust the client for final:

- Product price
- Order total
- Payment success
- Admin permissions

---

# 9. Customer Order Creation

```text
Customer submits checkout
        ↓
Validate customer data
        ↓
Validate product IDs
        ↓
Read current product prices from DB
        ↓
Calculate total on server
        ↓
Create order
        ↓
Create order items
        ↓
Create payment record
        ↓
Create admin notification
        ↓
Return order confirmation
```

---

# 10. Admin Authorization

All `/admin/*` data operations must require authenticated admin authorization.

Public users must never be able to:

- Read all orders
- Read customer lists
- Change order status
- Change product prices
- Access sales analytics
- Read admin notifications

---

# 11. Analytics

Analytics should be calculated from real order data.

Example:

```text
Total Sales
= Sum of eligible order totals
```

Do not count cancelled orders as sales.

The exact revenue recognition rules should be documented before production.

---

# 12. Notifications

MVP:

```text
Order Created
      ↓
Admin Notification
```

Status changes:

```text
Admin changes status
      ↓
Database updated
      ↓
Customer status becomes visible
      ↓
Notification created if enabled
```

External push/SMS/WhatsApp notifications are future integrations.

---

# 13. Future App Support

The backend must not be tightly coupled to the website UI.

Future clients may include:

```text
Web Storefront
Admin Web
Mobile App
```

They should use the same business logic/API where practical.

---

# 14. Environment Variables

Secrets must be stored in environment variables.

Examples:

```text
DATABASE_URL
AUTH_SECRET
PAYMENT_SECRET
PAYMENT_WEBHOOK_SECRET
```

Never commit `.env` files containing real secrets.

---

# 15. Architecture Principles

1. Server is the source of truth for business data.
2. Database is the source of truth for orders.
3. Payment gateway is the source of truth for payment verification.
4. Customer and admin permissions are separate.
5. Business logic must not depend on UI state.
6. Historical orders must remain accurate.
7. Keep MVP architecture simple.
8. Prefer reusable modules.
9. Avoid premature microservices.
10. Design for future extension without overengineering.
