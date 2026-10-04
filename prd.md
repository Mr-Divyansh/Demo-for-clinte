# PRD --- Speed Boost Nutrition

**Product:** Nutrition E-Commerce Website + Admin Order Management
System\
**Version:** MVP v1.0\
**Status:** Product Definition\
**Primary Goal:** Convert Instagram traffic into organized website
orders and give the business owner one place to manage orders,
customers, products, and sales.

------------------------------------------------------------------------

## 1. Product Goal

Build a simple, professional website for Speed Boost Nutrition where
customers can browse supplements and place orders, while the owner can
manage the complete order workflow from an admin dashboard.

### Core Flow

``` text
Instagram
    ↓
Website
    ↓
Products
    ↓
Cart
    ↓
Checkout
    ↓
COD / Online Payment
    ↓
Order Created
    ↓
Admin Dashboard
    ↓
Admin Notification
    ↓
Order Confirmation
    ↓
Customer Status Updates
    ↓
Sales & Customer Data
```

------------------------------------------------------------------------

## 2. Main Business Problem

The business already uses Instagram and has a physical supplement store,
products, delivery, and customers.

The main problem is that order and business information can become
scattered across Instagram DMs, phone calls, WhatsApp, and manual
records.

The system should make it easy to answer:

-   What orders came in?
-   Who placed each order?
-   What products were ordered?
-   Which orders are pending?
-   Which orders are confirmed?
-   How many orders were delivered?
-   How much sales happened?
-   Which customers have ordered before?
-   Which products are available?

### Product Solution

**Customer Website + Admin Dashboard + Order Management System**

The goal is not to replace Instagram. Instagram remains a marketing
channel.

The website becomes the structured sales channel, while the dashboard
becomes the business-control layer.

------------------------------------------------------------------------

# 3. Customer Website

## 3.1 Home Page

The home page should include:

-   Business introduction
-   Featured products
-   Main product categories
-   Delivery information
-   COD availability
-   Online ordering CTA
-   Instagram/social links
-   Contact information

Primary CTA:

**Shop Now / Order Now**

------------------------------------------------------------------------

## 3.2 Product Catalogue

Customers should be able to browse:

-   Product image
-   Product name
-   Category
-   Price
-   Size/variant
-   Short description
-   Availability
-   Add to Cart
-   Buy Now

### Initial Categories

-   Protein
-   Creatine
-   Mass Gainer
-   Pre-Workout
-   Other Supplements

Categories should eventually be manageable from the admin dashboard.

------------------------------------------------------------------------

# 4. Cart & Checkout

## 4.1 Cart

Customer can:

-   Add products
-   Remove products
-   Change quantity
-   View subtotal
-   View total
-   Continue shopping
-   Proceed to checkout

## 4.2 Checkout

Required information:

-   Full name
-   Phone number
-   Address
-   City
-   State
-   Pincode
-   Ordered products
-   Quantity
-   Total amount
-   Payment method

------------------------------------------------------------------------

# 5. Payment

MVP supports:

### Cash on Delivery

Customer can place a COD order.

### Online Payment

Online payment can be integrated through a proper payment gateway.

The system should store payment status separately from order status.

Example:

``` text
Order Status: Confirmed
Payment Status: Paid
```

or

``` text
Order Status: Confirmed
Payment Status: COD
```

------------------------------------------------------------------------

# 6. Order Management

## 6.1 Order Lifecycle

``` text
Pending
   ↓
Confirmed
   ↓
Processing
   ↓
Shipped
   ↓
Delivered
```

Alternative:

``` text
Pending → Cancelled
```

## 6.2 Customer Order Status

Customer should be able to see the current status of their order.

Example:

> Order #1024\
> Status: Confirmed

Possible customer-facing statuses:

-   Pending
-   Confirmed
-   Processing
-   Shipped
-   Delivered
-   Cancelled

------------------------------------------------------------------------

# 7. Admin Dashboard

The admin dashboard is the main business-management area.

## 7.1 Dashboard Overview

Show:

-   Total Sales
-   Total Orders
-   Pending Orders
-   Confirmed Orders
-   Customers
-   Recent Orders
-   Sales chart
-   Order-status overview

The owner should understand the business situation within a few seconds.

------------------------------------------------------------------------

# 8. Orders

Admin can view:

-   Order ID
-   Customer name
-   Phone
-   Address
-   Products
-   Quantity
-   Total amount
-   Payment method
-   Order date
-   Order status
-   Payment status

Admin can:

-   Open order
-   Confirm order
-   Change order status
-   Cancel order
-   View customer details

------------------------------------------------------------------------

# 9. Notifications

## Admin

When a new order is created:

> New Order Received

The notification should appear inside the admin dashboard.

## Customer

Customer receives status updates such as:

-   Order received
-   Order confirmed
-   Processing
-   Shipped
-   Delivered
-   Cancelled

### MVP Notification Strategy

Start with in-dashboard notifications.

Phone push notifications can be added later if the business actually
needs them.

------------------------------------------------------------------------

# 10. Customer Management

Admin can view:

-   Customer name
-   Phone
-   Address
-   Total orders
-   Total spending
-   Last order
-   Complete order history

Opening a customer should show their previous orders.

------------------------------------------------------------------------

# 11. Product Management

Admin can:

-   Add product
-   Edit product
-   Deactivate product
-   Delete product
-   Add product image
-   Set price
-   Set category
-   Add description
-   Set size/variant
-   Set availability

### Stock --- MVP

Keep inventory simple initially:

-   In Stock
-   Out of Stock

Detailed warehouse/inventory management is not part of MVP.

------------------------------------------------------------------------

# 12. Sales & Business Analytics

The dashboard should provide basic business visibility.

## Sales Periods

-   Today
-   Last 7 Days
-   Last 30 Days
-   This Month
-   Custom Date Range

## Main Metrics

-   Total Sales
-   Total Orders
-   Average Order Value
-   Delivered Orders
-   Cancelled Orders

## Charts

### Sales Chart

Show sales trend over time.

### Orders Chart

Show order volume over time.

### Order Status Chart

Show distribution of:

-   Pending
-   Confirmed
-   Processing
-   Shipped
-   Delivered
-   Cancelled

### Best-Selling Products

Show products with the highest number of orders.

------------------------------------------------------------------------

# 13. Profit Tracking

Profit should **not** be shown in the first MVP unless product cost data
is available.

Later, the system can support:

``` text
Selling Price
    -
Product Cost
    =
Gross Profit
```

This should only be implemented after the business confirms how product
costs/margins are tracked.

------------------------------------------------------------------------

# 14. Admin Navigation

Initial dashboard navigation:

``` text
Dashboard
Orders
Products
Customers
Sales
Notifications
Settings
```

Keep navigation simple and functional.

------------------------------------------------------------------------

# 15. Authentication & Security

Admin area must be protected.

Requirements:

-   Admin login
-   Protected dashboard routes
-   Secure sessions/authentication
-   Customer data protection
-   Authorized admin access only
-   Secure payment handling
-   Server-side validation
-   Input validation
-   Protection against unauthorized order modification

------------------------------------------------------------------------

# 16. Core Data Model

Initial entities:

``` text
Admin
Customer
Product
Category
Order
OrderItem
Payment
Notification
```

Basic relationship:

``` text
Customer
   ↓
Order
   ↓
Order Items
   ↓
Products
```

------------------------------------------------------------------------

# 17. MVP Scope

## Must Have

-   Customer website
-   Product catalogue
-   Product categories
-   Cart
-   Checkout
-   COD
-   Online payment capability
-   Order creation
-   Admin login
-   Admin dashboard
-   Order management
-   Order status
-   Customer management
-   Product management
-   Basic sales analytics
-   Dashboard notifications
-   Responsive mobile/desktop UI

------------------------------------------------------------------------

# 18. Not in MVP

Do NOT build these initially:

-   Mobile app
-   AI chatbot
-   Loyalty points
-   Advanced CRM
-   Advanced delivery tracking
-   Multi-vendor system
-   Subscription system
-   Complex warehouse management
-   Advanced automation
-   Complicated inventory management
-   WhatsApp as the primary order-management system
-   Unnecessary animations/features

Build only what solves the core business problem.

------------------------------------------------------------------------

# 19. Mobile App Strategy

A mobile app is **not required for MVP**.

The admin dashboard should be responsive enough to work on:

-   Laptop
-   Desktop
-   Tablet
-   Mobile browser

If the business later needs an app, the same backend/API can be used to
build one.

------------------------------------------------------------------------

# 20. Success Criteria

The MVP is successful when the owner can manage the complete basic sales
workflow from one system:

``` text
Add Product
    ↓
Customer Orders
    ↓
Order Appears in Dashboard
    ↓
Admin Sees Customer + Order
    ↓
Admin Confirms
    ↓
Customer Sees Updated Status
    ↓
Order Gets Delivered
    ↓
Sales Data Is Recorded
```

The customer should be able to:

``` text
Open Website
    ↓
Browse Product
    ↓
Add to Cart
    ↓
Checkout
    ↓
Choose COD / Online Payment
    ↓
Place Order
    ↓
See Order Status
```

------------------------------------------------------------------------

# 21. Product Positioning

We are not positioning this as:

> "We are selling you a website."

The business-facing value is:

> **A simple digital system to manage your online orders, customers,
> products, and sales in one place.**

For D Web Studio, the commercial offering remains a **business
website**, with the order-management dashboard acting as the
differentiating feature that solves a real business workflow.

------------------------------------------------------------------------

# 22. Product Principles

1.  **Simple over complex**
2.  **Business utility over flashy features**
3.  **Mobile-friendly**
4.  **Fast and easy to use**
5.  **Clear order status**
6.  **Centralized business data**
7.  **Secure customer information**
8.  **Build only what the business needs**
9.  **Verify business requirements before adding features**
10. **Future features should be added based on real usage**

------------------------------------------------------------------------

# 23. Future Features --- Not MVP

Potential future upgrades:

-   Mobile admin app
-   Push notifications
-   Advanced inventory
-   Profit tracking
-   Coupons/discounts
-   Customer segmentation
-   Repeat-order reminders
-   WhatsApp notifications
-   Delivery integration
-   Advanced analytics
-   GST/invoice system
-   Loyalty/rewards
-   Product reviews

These should only be added after validating the business requirement.

------------------------------------------------------------------------

# 24. Final MVP Definition

### Customer Side

**Website → Products → Cart → Checkout → Payment → Order Tracking**

### Business Side

**Admin Dashboard → Orders → Customers → Products → Sales →
Notifications**

### Core Value

> **Turn Instagram-driven sales into an organized digital ordering and
> business-management workflow.**

------------------------------------------------------------------------

## Next Step

**PRD → UI/UX Design → Database Schema → Technical Architecture →
Development → Testing → Demo → Client Feedback → Production**
