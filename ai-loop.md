# D Web Studio — AI Build & Review Loop

## Purpose

This document defines how AI-assisted development should build, verify, debug, and review the project.

No feature is considered complete only because code was generated.

---

# 1. Read Before Coding

Always read in this order:

1. `prd.md`
2. `architecture.md`
3. `design.md`
4. `phases.md`
5. `rules.md`
6. `readme.md`

If a project-specific decision exists in code or documentation, follow the latest verified decision.

---

# 2. Build Loop

```text
READ
  ↓
PLAN
  ↓
IMPLEMENT
  ↓
VERIFY
  ↓
FAIL?
 ├─ YES → DIAGNOSE → FIX → VERIFY
 └─ NO  → REVIEW
              ↓
             TEST
              ↓
            FINAL
```

---

# 3. Before Implementation

For every task:

1. Identify the exact requirement.
2. Identify affected files.
3. Check existing implementation.
4. Avoid duplicating existing functionality.
5. Choose the smallest correct change.

Do not rewrite unrelated parts of the project.

---

# 4. Verification

After implementation verify:

### Functional

- Main flow works.
- Forms submit correctly.
- Validation works.
- Database writes are correct.
- Order status changes correctly.
- Admin authorization works.

### UI

- Desktop works.
- Mobile works.
- No overflow.
- Loading states work.
- Empty states work.
- Error states work.

### Data

- No fake production data.
- Order totals are calculated server-side.
- Payment status is separate from order status.
- Customer data is protected.

---

# 5. Failure Protocol

When something fails:

```text
1. Identify exact error.
2. Find root cause.
3. State affected file/module.
4. Fix root cause.
5. Re-run the failed test.
6. Re-run related tests.
7. Check for regressions.
```

Do not hide errors.

Do not patch symptoms with duplicate code.

---

# 6. Self-Review Questions

## Product

- Does this match the PRD?
- Does this solve a real business problem?
- Is this actually needed for MVP?

## Customer

- Can a customer order without confusion?
- Is checkout short?
- Are price and availability clear?
- Can the customer understand order status?

## Admin

- Can the owner find a new order immediately?
- Can the owner confirm/cancel/update it?
- Can the owner see customer information?
- Can the owner understand sales quickly?

## Security

- Can an unauthorized user access admin data?
- Are secrets exposed?
- Are payment values trusted from the client?
- Is customer data unnecessarily exposed?

## Design

- Is the interface simple?
- Is the hierarchy clear?
- Is it consistent with `design.md`?
- Is anything decorative without purpose?

---

# 7. Testing Priorities

Test the highest-value flow first:

```text
Product
→ Cart
→ Checkout
→ Order Creation
→ Admin Notification
→ Admin Confirmation
→ Customer Status
```

Then test:

```text
Product Management
Customer History
Sales Analytics
Payment States
Authentication
Responsive UI
Error States
```

---

# 8. Never Mark Final If

- A core flow is broken.
- A known test is failing.
- Authorization is broken.
- Payment verification is incomplete.
- Order totals are incorrect.
- Mobile layout is broken.
- Important requirements are missing.

---

# 9. Final Report

Every completed implementation should report:

1. Files changed.
2. Features implemented.
3. Tests/checks run.
4. Problems found.
5. Problems fixed.
6. Remaining known issues.
7. Any decision required from the founder/client.

---

# 10. AI Behavior Rule

AI must not invent requirements.

If something is unclear:

- check existing docs,
- inspect existing code,
- use the smallest reasonable interpretation,
- or flag the decision.

Do not silently expand scope.

---

# 11. Founder Control

The founder controls product scope.

AI can suggest improvements, but suggestions are not requirements until approved.

**Build → Verify → Learn → Improve.**
