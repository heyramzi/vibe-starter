# Stripe Integration

## Overview

Organization-based subscriptions with per-seat billing. Stripe is the source of truth for products and prices.

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...           # Server-side API key
STRIPE_PUBLISHABLE_KEY=pk_test_...      # Client-side key (NEXT_PUBLIC_)
STRIPE_WEBHOOK_SECRET=whsec_...         # Webhook signature verification
```

## Database Tables

- `organizations` - Billable entity with subscription state
- `organization_members` - Users with roles (owner, admin, member)

## Usage

```typescript
import { StripeService } from '@/lib/stripe'
import { requireAuth, requireOrg, requireRole } from '@/lib/middleware'

// Create checkout session (owner only)
const { url } = await StripeService.createCheckoutSession(orgId, priceId, email)

// Create billing portal session (owner only)
const { url } = await StripeService.createPortalSession(orgId)

// Update seats (owner only)
await StripeService.updateSeats(orgId, newSeatCount)
```

## API Routes

- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/portal` - Create billing portal session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

## Webhook Events Handled

- `checkout.session.completed` - Link subscription to org
- `customer.subscription.created` - Sync subscription
- `customer.subscription.updated` - Sync status and seats
- `customer.subscription.deleted` - Mark canceled
- `invoice.payment_failed` - Mark past_due

## Stripe Dashboard Setup

1. Create Products (your tiers)
2. Create Prices (monthly/annual per seat)
3. Configure Customer Portal
4. Add webhook endpoint: `https://your-app.com/api/stripe/webhook`
5. Select events: checkout.session.completed, customer.subscription.*

## Testing

Use Stripe CLI for local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
