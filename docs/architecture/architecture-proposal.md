# Architecture Proposal

## 1. Repository and runtime assessment

### Current repository state

- Workspace is empty; no codebase, serverless config, package manifest, or database schema exists to validate against.
- Because this repository does not yet contain implementation evidence, the architecture below is a forward-looking proposal aligned with the product brief and standard Telegram platform capabilities.

### Verified assumptions from Telegram platform reality

The following constraints are consistent with the general Telegram ecosystem and should be treated as deployment assumptions until the actual stack is chosen:

- Telegram Bot API is an adapter layer; it does not replace application services.
- Bot callbacks and webhook events should trigger application commands, not directly mutate business state.
- Telegram Mini Apps are web apps served over HTTPS and must authenticate via Telegram init data or a secure backend token flow.
- Bot actions and Mini App actions share the same backend services; the user interface is not the source of business rules.
- Telegram payment flows require a backend verification step and idempotency enforcement.
- A production setup will typically use a PostgreSQL database, a cache layer (Redis is a good fit), and serverless or containerized HTTP functions for bot/webhooks.

### Assumptions that are not yet verified in this repo

- Exact hosting target: serverless functions vs containerized API.
- Billing provider(s): Telegram Stars vs external gateway.
- Authentication strategy for Mini App: Telegram init data validation, signed session, or custom JWT.
- Runtime language/framework: Node.js/TypeScript is a likely default for a Telegram-first SaaS, but this is an architectural assumption rather than a verified repo fact.

> Any assumption that is not backed by repository evidence is explicitly labeled as an assumption, not a fact.

## 2. Architectural principles

1. Telegram-first, but not Telegram-coupled.
2. Explicit tenant scoping on every business query.
3. Business logic lives behind application/domain services.
4. Bot and Mini App are thin adapters.
5. Payment, subscription, and integrations are provider-agnostic via interfaces.
6. Serverless-friendly with transaction boundaries and idempotency.

## 3. Recommended target architecture

### Layered system structure

- Presentation adapters
  - Telegram Bot
  - Telegram Mini App
  - Optional Web Admin (future)
- Application layer
  - Commands and queries
  - Use cases such as CreateOrder, CreateProduct, ActivateSubscription, HandlePaymentCallback
  - Authorization checks
  - Tenant boundary enforcement
- Domain layer
  - Entities, value objects, rules
  - Entitlement checks
  - Inventory ledger rules
  - Subscription lifecycle rules
- Persistence / infrastructure
  - PostgreSQL for transactional business data
  - Redis for rate limiting, cache, short-lived state, queue or idempotency key cache
  - Payment providers and Telegram integrations behind interfaces

### Proposed runtime architecture

- Bot webhook entrypoint (serverless function or HTTP route)
- Mini App API backend (same service or separate API service)
- Shared domain/application services
- PostgreSQL schema
- Redis for ephemeral state and idempotency keys
- Telegram provider adapter for Stars and bot API integration

## 4. Multi-tenant model

### Core design rule

Every tenant-scoped query must include an explicit shopId.

Examples:

- getProducts(shopId)
- getOrders(shopId, filters)
- getCustomer(shopId, customerId)

### Enforcement strategy

- Repository interfaces require shopId explicitly.
- Authorization service resolves the caller's membership and validates current shop context.
- Request-level tenant resolution is mandatory, never based on a client-provided value alone.
- Shop context is derived from authenticated Telegram identity and shop membership.

### Access pattern

- `User -> ShopMembership -> Shop`
- A Telegram user can belong to multiple shops.
- The UI should support shop switching.
- The backend should reject any request with mismatched or missing shop context.

## 5. Domain model summary

### Core entities

- Shop
- ShopMember
- Product
- ProductCategory
- Customer
- Order
- OrderItem
- InventoryTransaction
- FinancialTransaction
- Plan
- PlanFeature
- Subscription
- Payment
- AuditLog
- Invitation
- ConversationState

### Domain rules

- Products are soft-deleted to preserve historical order integrity.
- Order items keep snapshots of product name and unit price.
- Inventory changes are auditable and transactional.
- Order creation is atomic with inventory deduction and income creation.
- Subscription activation is only valid after a verified payment confirmation.
- Feature access is evaluated through entitlements, not plan string comparison.

## 6. Entitlement and subscription design

### Feature-based access

Use a service such as `IEntitlementService` with methods:

- HasFeature(shopId, featureCode)
- GetFeatureLimit(shopId, featureCode)
- CanUseFeature(shopId, featureCode)
- CanCreateProduct(shopId)
- CanCreateStaff(shopId)

This allows future features without changing business logic flow.

### Subscription model

- Plans are stored in database and are configurable.
- PlanFeature maps plan records to entitlement codes and values.
- Subscription stores lifecycle and billing metadata.
- `Payment` records provider details and idempotency evidence.
- Expired subscriptions should not delete data but should restrict certain write operations.

## 7. Payment architecture

### Provider abstraction

Business logic must depend on `IPaymentProvider` rather than provider-specific implementations.

Examples:

- TelegramStarsProvider
- IranianGatewayProvider

### Payment lifecycle

Created -> Pending -> Paid -> Failed / Cancelled / Refunded

### Critical safeguards

- Idempotency on payment callbacks
- Unique constraint on providerTransactionId per shop/provider scope
- Subscription activation from verified payment success only
- Payment callback cannot double-renew a subscription
- Verify Telegram payment payload server-side before marking successful

## 8. Telegram-specific architecture

### Bot responsibilities

- Initial onboarding flows
- Invite generation and verification
- Notifications with deep links
- Quick commands and action shortcuts
- Triggering Mini App launching
- Delegating subscription operations to application services

### Mini App responsibilities

- Full management UI for products, orders, customers, finance, reporting, settings
- Mobile-first dashboards and list pages
- Shared backend APIs for all business operations

### Important rule

Bot handlers must not own business logic directly. They should dispatch commands to application services.

## 9. Security model

- Never trust client-provided shopId
- Resolve shop based on authenticated Telegram identity and server-side membership validation
- Validate Telegram init data to protect API requests
- Enforce tenant boundary in every repository/query
- Prevent IDOR by checking access rights on every domain action
- Use rate limiting for sensitive operations
- Use idempotency keys for payment callbacks and renewal operations
- Log sensitive actions in the audit log

## 10. Serverless and deployment considerations

### Recommended deployment pattern

- Bot webhook endpoint: serverless-compatible HTTP function
- Mini App API: serverless or containerized API
- Database: PostgreSQL (managed service)
- Cache: Redis
- Background jobs: queue or scheduler for expiring subscriptions and notification checks

### Why this fits

- Stateless HTTP endpoints are easy to run in serverless
- DB and Redis provide durable state and cache
- Bot handlers remain lightweight wrappers around application services

### Risk to call out

- Telegram Bot API and Mini App callbacks are traditionally stateless; long-running workflows must be persisted in the database and resumed via events or jobs.
- If the team later chooses a pure serverless-only model, scheduled subscription expiry enforcement and notification fan-out should be backed by queue or cron jobs rather than in-memory state.

## 11. Recommended initial stack (assumption)

This is an architecture assumption, not a verified repo fact.

- Backend: Node.js + TypeScript + NestJS or Fastify
- Database: PostgreSQL
- Cache: Redis
- Bot API: Telegram Bot API with webhook
- Mini App: React or Next.js frontend, served as a secure web app
- Validation: zod / class-validator / domain validation
- Testing: Vitest/Jest + integration tests with Postgres test container

## 12. Final architectural stance

The product should be:

- Simple for users
- Solid for developers
- Safe for multi-tenancy
- Extensible for future integrations

This is best achieved by separating:

- Telegram adapters
- App services
- Domain rules
- Persistence
- Payment and entitlement providers

The system remains Telegram-first without becoming Telegram-dependent.
