# Implementation Plan

## Phase 0: Foundation and architecture lock

### Scope

- Repository scaffolding
- Decide runtime and deployment approach
- Define service boundaries and shared conventions
- Validate Telegram + Mini App constraints

### Files changed

- `README.md`
- `docs/architecture/README.md`
- `docs/architecture/architecture-proposal.md`
- `docs/architecture/erd.md`
- `docs/architecture/user-flows.md`

### Architecture impact

- Establishes the contract that Telegram Bot and Mini App are adapters only.
- Formalizes all multi-tenant and entitlement boundaries before coding.

### Database changes

- None yet; schema design is defined in the ERD and should be implemented in the next phase.

### Security considerations

- Define role and tenant validation before writing code.
- Explicitly reject client-controlled tenant assumptions.

### Tests

- Architecture review checklist
- Security review checklist
- Tenant-boundary verification checklist

### Next phase

- Start implementation of core entities and repository contracts.

---

## Phase 1: Core domain and data model

### Scope

- Shop
- ShopMember
- Product
- Customer
- Order
- OrderItem
- InventoryTransaction

### Files changed

- `src/domain/shop/*`
- `src/domain/product/*`
- `src/domain/customer/*`
- `src/domain/order/*`
- `src/domain/inventory/*`
- `src/infrastructure/database/schema/*`
- `src/repositories/*`

### Architecture impact

- Introduces the ownership model for shops and tenant-scoped data access.
- Creates the first transactional rules around order creation and stock updates.

### Database changes

- `shops`
- `shop_members`
- `products`
- `product_categories`
- `customers`
- `orders`
- `order_items`
- `inventory_transactions`
- Composite indexes on `shopId` and tenant-aware unique constraints such as `(shopId, sku)`

### Security considerations

- All repositories must require `shopId` in the query contract.
- Prevent cross-shop reads and writes.
- Soft-delete product records to preserve historical data integrity.

### Tests

- Multi-tenant isolation: shop A cannot see shop B products
- Multi-tenant isolation: shop A cannot access shop B orders
- Order creation decreases inventory exactly once
- Cancelled order cannot decrease inventory twice
- Income created exactly once

### Next phase

- Add finance and dashboard/reporting services.

---

## Phase 2: Finance and reporting

### Scope

- FinancialTransaction
- Dashboard metrics
- Basic reports

### Files changed

- `src/domain/finance/*`
- `src/application/reports/*`
- `src/application/dashboard/*`

### Architecture impact

- Business operations now produce financial ledger entries and aggregate metrics.
- Reporting is a read model, not a source of truth.

### Database changes

- `financial_transactions`
- Dashboard/report materialized or query-based read model if needed

### Security considerations

- Report queries must be scoped to the current shop.
- Do not expose global totals across tenants.

### Tests

- Profit calculation: income - expense
- Daily sales and order counts for the current shop
- Restricted access when shop context is invalid

### Next phase

- Add subscription and entitlement model.

---

## Phase 3: Subscription and entitlement

### Scope

- Plan
- PlanFeature
- Subscription
- Payment
- Entitlement service

### Files changed

- `src/domain/subscription/*`
- `src/domain/entitlement/*`
- `src/application/subscription/*`
- `src/infrastructure/providers/*`

### Architecture impact

- Removes hard-coded pricing and plan checks from business logic.
- Centralizes access decisions in an entitlement service.

### Database changes

- `plans`
- `plan_features`
- `subscriptions`
- `payments`
- Audit or entitlement snapshot tables if required by implementation detail

### Security considerations

- Guard all protected write actions using entitlement checks.
- Enforce subscription status lifecycle transitions.
- Validate payment callbacks and provider transaction IDs.

### Tests

- Payment callback cannot activate subscription twice
- Expired subscription cannot access protected feature
- Subscription renewal extends expiration exactly once
- Staff cannot access owner-only actions

### Next phase

- Build Telegram bot and Mini App adapter layer.

---

## Phase 4: Telegram bot and Mini App

### Scope

- Bot command handlers
- Onboarding flows
- Invite flow
- Notification templates
- Mini App authentication
- Deep links and shop switching

### Files changed

- `src/telegram/*`
- `src/miniapp/*`
- `src/application/auth/*`
- `src/infrastructure/telegram/*`

### Architecture impact

- Keeps Telegram logic as thin adapters around application use cases.
- Ensures the core product remains independent from Telegram-specific logic.

### Database changes

- `conversation_state`
- `invitations`
- `audit_logs`

### Security considerations

- Validate Telegram init data before user session authorization.
- Resolve shop membership from server-side identity, not client-supplied value.

### Tests

- Invalid Telegram identity is rejected
- Invite token verification works correctly
- Bot deep links resolve to valid shop and user context

### Next phase

- Implement payment provider integration and Telegram Stars flow.

---

## Phase 5: Payment integration and lifecycle

### Scope

- `IPaymentProvider`
- Telegram Stars provider implementation
- Invoice creation and callback verification
- Idempotency and renewal logic

### Files changed

- `src/infrastructure/payment/*`
- `src/application/payment/*`
- `src/telegram/payment/*`

### Architecture impact

- Makes payment provider logic abstraction-based and future-proof.
- Keeps business rules independent from Telegram payment system specifics.

### Database changes

- Payment status tracking and provider transaction uniqueness
- Callback idempotency keys or dedupe table

### Security considerations

- Require server-side verification of all callbacks.
- Reject duplicate callback payloads.
- Ensure payment success is the only valid subscription activation trigger.

### Tests

- Duplicate callback does not trigger duplicate activation
- Verified paid payment results in subscription activation
- Failed payment does not extend expiration

### Next phase

- UX polish and mobile optimization.

---

## Phase 6: UX polish and operational readiness

### Scope

- Loading states
- Empty states
- Error states
- Confirmation dialogs
- Mobile optimization

### Files changed

- Mini App UI components and screens
- Notification and empty state assets

### Architecture impact

- Better usability without changing core business logic.

### Database changes

- None required unless additional metadata for feature toggles is included.

### Security considerations

- Keep user-facing messages generic and business-friendly.
- Avoid exposing raw technical errors to end users.

### Tests

- UI flow completion for quick-sale screen
- Empty-state rendering for products and orders
- Validation of required product fields

### Next phase

- Future integrations and extensibility work.

---

## Phase 7: Future integrations

### Scope

- Instagram abstraction layer
- `ICommerceMessageProvider`
- `InstagramProvider`
- External conversation processing and confirmation-based order creation

### Files changed

- `src/integrations/*`
- `src/domain/external/*`

### Architecture impact

- Allows future message channels without coupling them into core order creation logic.

### Database changes

- `instagram_connections`
- `instagram_messages`
- `external_conversations`
- `potential_orders`

### Security considerations

- Potential orders require confirmation before final order creation.
- External channel payloads are untrusted until validated.

### Tests

- External message is never converted to a final order without confirmation
- Instagram channel remains isolated behind the provider abstraction

### Next phase

- Production hardening, observability, and scale tuning.

---

## Implementation note

The instruction says not to rewrite the entire project at once and to keep each phase compileable, testable, isolated, and documented. This plan follows that requirement by implementing the system incrementally while keeping the architecture consistent from the first phase onward.
