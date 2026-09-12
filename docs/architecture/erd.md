# ERD

## Entity Relationship Diagram

```mermaid
erDiagram
    SHOP ||--o{ SHOP_MEMBER : has
    SHOP ||--o{ PRODUCT : owns
    SHOP ||--o{ PRODUCT_CATEGORY : owns
    SHOP ||--o{ CUSTOMER : owns
    SHOP ||--o{ ORDER : owns
    SHOP ||--o{ INVENTORY_TRANSACTION : tracks
    SHOP ||--o{ FINANCIAL_TRANSACTION : records
    SHOP ||--o{ SUBSCRIPTION : has
    SHOP ||--o{ PAYMENT : has
    SHOP ||--o{ INVITATION : creates
    SHOP ||--o{ AUDIT_LOG : logs
    SHOP ||--o{ CONVERSATION_STATE : tracks

    SHOP ||--o{ PLAN : configurable
    PLAN ||--o{ PLAN_FEATURE : includes
    PLAN ||--o{ SUBSCRIPTION : offers

    SHOP_MEMBER }o--|| SHOP : belongs_to
    PRODUCT }o--|| SHOP : belongs_to
    PRODUCT_CATEGORY }o--|| SHOP : belongs_to
    CUSTOMER }o--|| SHOP : belongs_to
    ORDER }o--|| SHOP : belongs_to
    ORDER ||--o{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : sold_as
    ORDER }o--|| CUSTOMER : placed_by

    PRODUCT ||--o{ INVENTORY_TRANSACTION : affected_by
    ORDER ||--o{ INVENTORY_TRANSACTION : triggers
    ORDER ||--o{ FINANCIAL_TRANSACTION : generates_income
    SUBSCRIPTION ||--o{ PAYMENT : billed_by

    SHOP_MEMBER ||--o{ INVITATION : invited_by
    SHOP_MEMBER ||--o{ AUDIT_LOG : actor

    SHOP {
        string id PK
        string name
        bigint ownerTelegramUserId
        string status
        datetime createdAt
        datetime updatedAt
        json settings
    }

    SHOP_MEMBER {
        string id PK
        string shopId FK
        bigint telegramUserId
        string role
        string status
        datetime joinedAt
    }

    PRODUCT {
        string id PK
        string shopId FK
        string name
        string sku
        decimal purchasePrice
        decimal sellingPrice
        int stock
        int lowStockThreshold
        string categoryId FK
        string image
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    PRODUCT_CATEGORY {
        string id PK
        string shopId FK
        string name
    }

    CUSTOMER {
        string id PK
        string shopId FK
        string name
        string mobile
        bigint telegramUserId
        bigint instagramUserId
        string note
        datetime createdAt
        datetime updatedAt
    }

    ORDER {
        string id PK
        string shopId FK
        string customerId FK
        string status
        decimal totalAmount
        decimal discountAmount
        decimal finalAmount
        string note
        string source
        datetime createdAt
        datetime updatedAt
    }

    ORDER_ITEM {
        string id PK
        string orderId FK
        string productId
        string productNameSnapshot
        decimal unitPrice
        int quantity
        decimal total
    }

    INVENTORY_TRANSACTION {
        string id PK
        string shopId FK
        string productId FK
        string type
        int quantity
        string referenceType
        string referenceId
        string note
        datetime createdAt
    }

    FINANCIAL_TRANSACTION {
        string id PK
        string shopId FK
        string type
        string category
        decimal amount
        string referenceType
        string referenceId
        string note
        datetime createdAt
    }

    PLAN {
        string id PK
        string code
        string name
        string description
        decimal price
        string currency
        string billingPeriod
        boolean isActive
    }

    PLAN_FEATURE {
        string id PK
        string planId FK
        string featureCode
        string value
    }

    SUBSCRIPTION {
        string id PK
        string shopId FK
        string planId FK
        string status
        datetime startsAt
        datetime expiresAt
        boolean autoRenew
        string paymentProvider
        string providerSubscriptionId
        datetime cancelledAt
        datetime gracePeriodEndsAt
        datetime createdAt
        datetime updatedAt
    }

    PAYMENT {
        string id PK
        string shopId FK
        string subscriptionId FK
        string provider
        string providerTransactionId
        decimal amount
        string currency
        string status
        datetime paidAt
        json metadata
        datetime createdAt
    }

    INVITATION {
        string id PK
        string shopId FK
        string createdBy FK
        string token
        datetime expiresAt
        string status
    }

    CONVERSATION_STATE {
        string telegramUserId PK
        string shopId
        string state
        string step
        json payload
        datetime expiresAt
        datetime updatedAt
    }

    AUDIT_LOG {
        string id PK
        string shopId FK
        string actorType
        string actorId
        string action
        string targetType
        string targetId
        json metadata
        datetime createdAt
    }
```

## Tenant-aware index strategy

- `shopId` indexes on all tenant tables
- composite indexes:
  - `(shopId, status)`
  - `(shopId, createdAt)`
  - `(shopId, sku)`
  - `(shopId, customerId)`
  - `(shopId, productId, createdAt)`
- unique constraints should be tenant-aware, e.g. `(shopId, sku)` not global `sku`
- `providerTransactionId` should be unique within payment provider / shop scope

## Key business constraints

- Soft delete for products and other business entities with historical references
- `OrderItem.productNameSnapshot` and `unitPrice` are immutable snapshots
- `InventoryTransaction` records all quantity changes as traceable ledger entries
- `FinancialTransaction` creates the accounting trail for sales and expense events
