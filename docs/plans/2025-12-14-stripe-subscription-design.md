# Stripe Subscription Integration Design

## Overview

Clean, simple Stripe integration for SaaS subscription management with per-seat billing and organization-based accounts.

## Decisions

| Decision | Choice |
|----------|--------|
| Pricing source of truth | Stripe Dashboard |
| Pricing model | Tiered plans + per-seat |
| Auth | Supabase Auth |
| Email | Unosend |
| Billing model | Organization-based (not user-based) |
| Seat management | Owner manages seats, owner+admin manage members |
| API version | 2025-06-30.basil or later (flexible billing) |

## Database Schema

### organizations

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Organization name |
| slug | text | Unique URL slug |
| owner_id | uuid | FK to auth.users |
| stripe_customer_id | text | Stripe customer ID |
| stripe_subscription_id | text | Stripe subscription ID |
| status | text | active, canceled, past_due, trialing |
| seats | integer | Purchased seat count (from Stripe) |
| created_at | timestamptz | Creation timestamp |

### organization_members

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| organization_id | uuid | FK to organizations |
| user_id | uuid | FK to auth.users |
| role | text | owner, admin, member |
| created_at | timestamptz | Join timestamp |

## File Structure

```
src/lib/
├── stripe/
│   ├── index.ts         # Re-exports
│   ├── client.ts        # Stripe instance
│   ├── checkout.ts      # createCheckoutSession()
│   ├── portal.ts        # createPortalSession()
│   └── webhook.ts       # handleWebhook()
├── middleware/
│   ├── auth.ts          # Require authenticated user
│   ├── subscription.ts  # Require active subscription
│   └── roles.ts         # Require specific role
└── supabase/
    └── (existing)

src/app/api/
└── stripe/
    └── webhook/route.ts
```

## Core Functions

### stripe/checkout.ts
```typescript
createCheckoutSession(organizationId: string, priceId: string): Promise<string>
```
Creates Stripe Checkout session, returns URL.

### stripe/portal.ts
```typescript
createPortalSession(organizationId: string): Promise<string>
```
Creates Stripe Customer Portal session for billing management.

### stripe/webhook.ts
```typescript
handleWebhook(event: Stripe.Event): Promise<void>
```
Handles webhook events:
- `checkout.session.completed` → Link subscription to org
- `customer.subscription.updated` → Sync status + seats
- `customer.subscription.deleted` → Mark canceled
- `invoice.payment_failed` → Update status to past_due

## Middleware

### auth.ts
- Validates Supabase session
- Attaches user to request context
- Returns 401 if not authenticated

### subscription.ts
- Checks user's org has active subscription
- Returns 403 if no active subscription

### roles.ts
- Checks user has required role in org
- `withRole('owner')` - owner only
- `withRole('admin')` - owner or admin

## Flows

### 1. Checkout Flow
```
User clicks "Upgrade"
→ createCheckoutSession(orgId, priceId)
→ Redirect to Stripe Checkout
→ User completes payment
→ Stripe sends checkout.session.completed webhook
→ handleWebhook() saves subscription to database
→ User redirected to success page
```

### 2. Seat Management Flow
```
Owner clicks "Add seat"
→ Update Stripe subscription quantity
→ Stripe prorates charge
→ customer.subscription.updated webhook
→ handleWebhook() syncs seat count
→ Owner can now add more members
```

### 3. Billing Portal Flow
```
User clicks "Manage Billing"
→ createPortalSession(orgId)
→ Redirect to Stripe Customer Portal
→ User updates payment method / views invoices / cancels
→ Relevant webhooks fire
→ Database stays in sync
```

## Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Security

- Webhook signature verification with `STRIPE_WEBHOOK_SECRET`
- Server-side only Stripe operations (secret key never exposed)
- Middleware chain: auth → subscription → roles
- RLS policies on organizations and organization_members tables

## Notes

- Products/prices configured in Stripe Dashboard (not code)
- Supports any number of tiers without code changes
- Monthly/annual billing configured in Stripe
- Boilerplate stays generic, business logic in Stripe
