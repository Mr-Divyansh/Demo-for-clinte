# Speed Boost Nutrition — Development Rules

## 1. Product Rule

Build a business solution, not a feature showcase.

Every feature must answer at least one question:

- Does it help the customer order?
- Does it help the owner manage the business?
- Does it improve trust?
- Does it provide useful business data?

If not, do not add it to MVP.

## 2. Scope Rule

The MVP is:

**Customer Website + Ordering + Admin Dashboard + Business Data**

Do not expand MVP into a full ERP, CRM, mobile app, AI system, or complex inventory platform.

## 3. Business Accuracy

Never invent:

- Product prices
- Product claims
- Stock
- Reviews
- Certifications
- Brand partnerships
- Delivery promises
- Health results
- Business statistics
- Customer testimonials

Use placeholders until the owner provides real data.

## 4. Supplement/Health Claims

Do not create medical or guaranteed-result claims.

Avoid unsupported claims such as:

- guaranteed weight gain
- guaranteed muscle gain
- guaranteed fat loss
- guaranteed health outcomes

Product descriptions must use verified information supplied by the business or product packaging.

## 5. Customer Experience

- Mobile-first.
- Fast checkout.
- Clear prices.
- Clear availability.
- Clear delivery/payment information.
- No unnecessary popups.
- No forced account creation unless required.
- Order status must be understandable.
- Important actions must be obvious.

## 6. Admin Experience

The owner should understand the dashboard quickly.

Prioritize:

1. New orders
2. Pending orders
3. Sales
4. Customers
5. Products
6. Status changes

Do not hide important information behind unnecessary screens.

## 7. Design

- Simple
- Premium
- Clean
- Product-focused
- Strong hierarchy
- Consistent spacing
- Consistent typography
- Minimal decoration

Avoid:

- Excessive gradients
- Excessive glassmorphism
- Giant animations
- Generic AI-looking layouts
- Visual clutter
- Unnecessary 3D elements

## 8. Responsive Rule

Test:

- 1440px
- 1280px
- 1024px
- 768px
- 640px
- 390px
- 375px

No horizontal scrolling.

## 9. Accessibility

- Semantic HTML
- Proper labels
- Keyboard-accessible controls
- Visible focus states
- Useful alt text
- Sufficient contrast
- One clear H1 per page

## 10. Development

- Use reusable components.
- Keep business logic separate from UI.
- Validate input on the server.
- Do not trust client-side values.
- Keep database queries efficient.
- Do not duplicate logic.
- Do not introduce dependencies without a reason.
- Keep secrets in environment variables.
- Never commit secrets.

## 11. Data & Security

Customer data is private.

Never expose:

- Admin credentials
- Database credentials
- API keys
- Payment secrets
- Environment variables
- Private customer data

Order status changes must be authorized.

## 12. Payment

Payment gateway handles sensitive payment details.

Do not store raw card information.

Payment verification must happen server-side.

## 13. Notifications

Notifications must reflect real system events.

Never create fake order notifications or fake sales data.

## 14. Code Quality

Before marking a feature complete:

- Does it work?
- Is the data correct?
- Does it work on mobile?
- Is loading handled?
- Is empty state handled?
- Is error state handled?
- Is the UI consistent?
- Is authorization correct?

## 15. Demo Rule

The demo should look real but must not pretend that fake data is real business data.

Use clearly identifiable demo/sample data where required.

## 16. Final Rule

**Do not build something just because we can build it. Build what the business needs.**
