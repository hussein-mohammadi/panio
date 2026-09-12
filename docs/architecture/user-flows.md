# User Flows

## 1. Onboarding flow

### Case A: User has no shop

1. User opens Telegram bot
2. Bot runs `/start`
3. System checks shop membership
4. Since no shop exists, user sees options:
   - Create Shop
   - Join Shop
5. User chooses Create Shop
6. Bot requests:
   - Shop name
   - Category (optional)
   - Currency
   - Initial setup details
7. System creates Shop and ShopMember with OWNER role
8. System opens welcome screen
9. App redirects to dashboard

### Case B: User has existing shop

1. User opens Telegram bot
2. Bot resolves membership
3. If user belongs to one or more shops, bot offers:
   - Open Mini App
   - Switch Shop
4. Mini App loads dashboard for current shop

## 2. Shop member invitation flow

1. Owner opens shop settings
2. Owner generates invite
3. System creates Invitation with token, expiry, status
4. Owner shares deep link
5. Staff user opens deep link in bot
6. Bot verifies invite token and shop membership rules
7. User confirms join request
8. System creates ShopMember record with STAFF role
9. Bot sends confirmation and deep link to Mini App

## 3. Quick sale flow

1. User opens Mini App dashboard
2. User taps CTA: "ثبت فروش"
3. User selects product
4. User enters quantity
5. User selects or creates customer
6. User confirms order
7. System starts transaction:
   - create order
   - create order items
   - reduce inventory
   - create income record
   - commit transaction
8. System notifies user with success message
9. Bot may push notification if configured

## 4. Product creation flow

1. User opens Products screen
2. User taps Create Product
3. Step 1: Name
4. Step 2: Purchase price
5. Step 3: Selling price
6. Step 4: Initial stock
7. Step 5: Optional image
8. System validates required fields
9. System creates product record and initial inventory transaction
10. System writes audit log

## 5. Low stock alert flow

1. Product stock drops below threshold
2. System creates `InventoryTransaction`
3. Rules engine checks low stock threshold
4. If threshold reached, system emits notification event
5. Bot sends low stock notification with deep link to product details

## 6. Payment flow: Telegram Stars subscription

1. User opens subscription page in Mini App
2. User selects plan
3. System creates `Payment` record in `Created` or `Pending` state
4. System creates Telegram invoice or Stars payment request
5. User approves payment in Telegram
6. Telegram sends callback to backend
7. Backend verifies payment data and idempotency key
8. Backend marks payment as paid
9. Backend activates or renews subscription
10. Backend writes entitlement state
11. Backend sends payment success notification

## 7. Expired subscription flow

1. Subscription passes expiry date
2. Background job or scheduler marks status as EXPIRED or GRACE_PERIOD
3. Access checks evaluate entitlement service
4. Restricted actions are blocked:
   - create order
   - create product
   - advanced integrations
   - advanced report access
5. Allowed actions remain available:
   - view orders
   - view products
   - view reports
6. User can renew subscription from Mini App or bot

## 8. Telegram deep link flow

- Deep link from bot to Mini App carries:
  - shopId if user belongs to shop
  - working state if required
  - a flow context token for join/confirm actions
- Server validates the link and resolves the actual user/shop identity before allowing access

## 9. Staff permissions flow

1. Owner invites staff
2. Staff receives invite and joins shop
3. System assigns `STAFF` role
4. Permissions are evaluated using entitlement and role checks
5. Owner-only actions remain blocked for STAFF users

## 10. Payment failure flow

1. Payment enters Pending
2. Callback or provider notification marks it Failed
3. System does not activate subscription
4. User receives fail message with retry option
5. Audit log records failure
