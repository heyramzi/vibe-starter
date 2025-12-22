# Creem SvelteKit Adapter Design

> Subscription payment adapter for SvelteKit using Creem as an alternative to Stripe.

## Overview

A clean, flexible Creem integration for the SvelteKit variant of vibe-starter. Designed as a parallel adapter alongside the existing Stripe implementation in Next.js, allowing projects to choose their payment provider.

## Design Principles

1. **Callback-only design** - Library has zero database knowledge; you provide callbacks for data sync
2. **Clean inheritance** - No lingering code if you don't use organizations
3. **Helper functions over components** - Explicit control, Svelte-idiomatic
4. **Separate API routes** - Consistent with Next.js pattern, clear boundaries

## File Structure

```
src/lib/creem/
├── client.ts              # Creem SDK instance
├── service.ts             # Core operations (stateless utilities)
├── webhook.ts             # Webhook handler factory
├── plans.ts               # Product/pricing configuration
├── types.ts               # TypeScript types
├── helpers.ts             # Client-side helpers (createCheckout, openPortal)
└── index.ts               # Public exports

src/routes/api/creem/
├── checkout/+server.ts    # POST: Create checkout session
├── portal/+server.ts      # POST: Create customer portal link
└── webhook/+server.ts     # POST: Handle webhook events

src/lib/schemas/
└── subscription.ts        # Recommended schema examples (user & org)
```

## Implementation Details

### 1. Client (`client.ts`)

```typescript
import { createCreem } from 'creem_io'
import { env } from '$env/dynamic/private'

export const creem = createCreem({
  apiKey: env.CREEM_API_KEY,
  webhookSecret: env.CREEM_WEBHOOK_SECRET,
  testMode: env.CREEM_TEST_MODE === 'true'
})
```

### 2. Service Layer (`service.ts`)

Stateless operations - no database imports:

```typescript
import { creem } from './client'
import type { CheckoutOptions, PortalOptions } from './types'

export const CreemService = {
  async createCheckout(options: CheckoutOptions) {
    const checkout = await creem.checkouts.create({
      productId: options.productId,
      units: options.units ?? 1,
      successUrl: options.successUrl,
      metadata: {
        referenceId: options.referenceId,
        ...options.metadata
      },
      customer: options.customer,
      discountCode: options.discountCode
    })
    return { url: checkout.checkoutUrl }
  },

  async createPortal(customerId: string) {
    const portal = await creem.customers.createPortal({ customerId })
    return { url: portal.customerPortalLink }
  },

  async getSubscription(subscriptionId: string) {
    return creem.subscriptions.get({ subscriptionId })
  },

  async updateSeats(subscriptionId: string, itemId: string, units: number) {
    return creem.subscriptions.update({
      subscriptionId,
      items: [{ id: itemId, units }],
      updateBehavior: 'proration-charge-immediately'
    })
  },

  async cancelSubscription(subscriptionId: string) {
    return creem.subscriptions.cancel({ subscriptionId })
  }
}
```

### 3. Webhook Handler (`webhook.ts`)

Factory pattern - you provide the callbacks:

```typescript
import { creem } from './client'
import type { WebhookHandlerOptions } from './types'

export function createWebhookHandler(options: WebhookHandlerOptions) {
  return async (body: string, signature: string) => {
    await creem.webhooks.handleEvents(body, signature, {
      onCheckoutCompleted: options.onCheckoutCompleted,

      onGrantAccess: async (context) => {
        await options.onGrantAccess?.({
          referenceId: context.metadata?.referenceId as string,
          customerId: context.customer.id,
          customerEmail: context.customer.email,
          subscriptionId: context.subscription?.id,
          productId: context.product.id,
          reason: context.reason
        })
      },

      onRevokeAccess: async (context) => {
        await options.onRevokeAccess?.({
          referenceId: context.metadata?.referenceId as string,
          customerId: context.customer.id,
          reason: context.reason
        })
      },

      onSubscriptionCanceled: options.onSubscriptionCanceled,
      onSubscriptionUpdate: options.onSubscriptionUpdate
    })
  }
}
```

### 4. Client-Side Helpers (`helpers.ts`)

Browser-side utilities with explicit control:

```typescript
import { goto } from '$app/navigation'

export interface CheckoutParams {
  productId: string
  referenceId: string
  units?: number
  discountCode?: string
  successUrl?: string
}

export interface PortalParams {
  customerId: string
}

export async function createCheckout(params: CheckoutParams): Promise<void> {
  const response = await fetch('/api/creem/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })

  if (!response.ok) {
    throw new Error('Failed to create checkout')
  }

  const { url } = await response.json()
  goto(url, { external: true })
}

export async function openPortal(params: PortalParams): Promise<void> {
  const response = await fetch('/api/creem/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })

  if (!response.ok) {
    throw new Error('Failed to create portal session')
  }

  const { url } = await response.json()
  goto(url, { external: true })
}
```

### 5. Plans Configuration (`plans.ts`)

```typescript
export type BillingInterval = 'month' | 'year'

export interface PricingPlan {
  id: string
  name: string
  description: string
  features: string[]
  productIds: {
    month: string
    year: string
  }
  prices: {
    month: number
    year: number
  }
  highlighted?: boolean
  badge?: string
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For individuals getting started',
    features: ['Up to 5 projects', '10GB storage', 'Email support'],
    productIds: {
      month: 'prod_starter_monthly',
      year: 'prod_starter_yearly'
    },
    prices: { month: 29, year: 290 }
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing teams',
    features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access'],
    productIds: {
      month: 'prod_pro_monthly',
      year: 'prod_pro_yearly'
    },
    prices: { month: 79, year: 790 },
    highlighted: true,
    badge: 'Popular'
  }
]

export function formatPrice(amount: number, interval: BillingInterval): string {
  return `$${amount}/${interval === 'month' ? 'mo' : 'yr'}`
}

export function getProductId(planId: string, interval: BillingInterval): string | undefined {
  const plan = pricingPlans.find(p => p.id === planId)
  return plan?.productIds[interval]
}
```

### 6. Types (`types.ts`)

```typescript
export interface CheckoutOptions {
  productId: string
  referenceId: string
  units?: number
  successUrl?: string
  discountCode?: string
  customer?: { email: string }
  metadata?: Record<string, string>
}

export interface PortalOptions {
  customerId: string
}

export interface GrantAccessEvent {
  referenceId: string
  customerId: string
  customerEmail: string
  subscriptionId?: string
  productId: string
  reason: string
}

export interface RevokeAccessEvent {
  referenceId: string
  customerId: string
  reason: string
}

export interface WebhookHandlerOptions {
  onGrantAccess?: (event: GrantAccessEvent) => Promise<void>
  onRevokeAccess?: (event: RevokeAccessEvent) => Promise<void>
  onCheckoutCompleted?: (data: unknown) => Promise<void>
  onSubscriptionCanceled?: (data: unknown) => Promise<void>
  onSubscriptionUpdate?: (data: unknown) => Promise<void>
}
```

### 7. Public Exports (`index.ts`)

```typescript
// Client helpers (browser)
export { createCheckout, openPortal } from './helpers'

// Server utilities
export { CreemService } from './service'
export { createWebhookHandler } from './webhook'
export { pricingPlans, formatPrice, getProductId } from './plans'

// Types
export type * from './types'
```

## Schema Examples

### User-Based Subscriptions

```typescript
export interface UserSubscriptionFields {
  creem_customer_id: string | null
  creem_subscription_id: string | null
  subscription_status: 'inactive' | 'active' | 'canceled' | 'past_due' | 'trialing'
}

// SQL:
// ALTER TABLE users ADD COLUMN creem_customer_id TEXT;
// ALTER TABLE users ADD COLUMN creem_subscription_id TEXT;
// ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
```

### Organization-Based Subscriptions

```typescript
export interface OrgSubscriptionFields {
  creem_customer_id: string | null
  creem_subscription_id: string | null
  subscription_status: 'inactive' | 'active' | 'canceled' | 'past_due' | 'trialing'
  seats: number
}

// SQL:
// ALTER TABLE organizations ADD COLUMN creem_customer_id TEXT;
// ALTER TABLE organizations ADD COLUMN creem_subscription_id TEXT;
// ALTER TABLE organizations ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
// ALTER TABLE organizations ADD COLUMN seats INTEGER DEFAULT 1;
```

## API Routes

### Checkout Route (`src/routes/api/creem/checkout/+server.ts`)

```typescript
import { json, error } from '@sveltejs/kit'
import { CreemService } from '$lib/creem'
import { env } from '$env/dynamic/public'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.safeGetSession?.()
  if (!session?.user) {
    throw error(401, 'Unauthorized')
  }

  const { productId, referenceId, units, discountCode, successUrl } = await request.json()

  if (!productId || !referenceId) {
    throw error(400, 'Missing productId or referenceId')
  }

  const result = await CreemService.createCheckout({
    productId,
    referenceId,
    units,
    discountCode,
    successUrl: successUrl ?? `${env.PUBLIC_APP_URL}/billing?success=true`,
    customer: session?.user?.email ? { email: session.user.email } : undefined
  })

  return json(result)
}
```

### Portal Route (`src/routes/api/creem/portal/+server.ts`)

```typescript
import { json, error } from '@sveltejs/kit'
import { CreemService } from '$lib/creem'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.safeGetSession?.()
  if (!session?.user) {
    throw error(401, 'Unauthorized')
  }

  const { customerId } = await request.json()

  if (!customerId) {
    throw error(400, 'Missing customerId')
  }

  const result = await CreemService.createPortal(customerId)
  return json(result)
}
```

### Webhook Route (Project-Specific)

```typescript
import { json } from '@sveltejs/kit'
import { createWebhookHandler } from '$lib/creem'
import { createServerClient } from '$lib/supabase'

const handleWebhook = createWebhookHandler({
  onGrantAccess: async ({ referenceId, customerId, subscriptionId }) => {
    const supabase = createServerClient()
    await supabase.from('users').update({
      creem_customer_id: customerId,
      creem_subscription_id: subscriptionId,
      subscription_status: 'active'
    }).eq('id', referenceId)
  },

  onRevokeAccess: async ({ referenceId }) => {
    const supabase = createServerClient()
    await supabase.from('users').update({
      subscription_status: 'inactive'
    }).eq('id', referenceId)
  }
})

export async function POST({ request }) {
  const body = await request.text()
  const signature = request.headers.get('creem-signature')!

  try {
    await handleWebhook(body, signature)
    return json({ received: true })
  } catch (error) {
    return json({ error: 'Invalid signature' }, { status: 400 })
  }
}
```

## Environment Variables

```bash
# Creem Configuration
CREEM_API_KEY=creem_sk_...
CREEM_WEBHOOK_SECRET=whsec_...
CREEM_TEST_MODE=true

# App URL (for success redirects)
PUBLIC_APP_URL=http://localhost:5173
```

## Usage Example

```svelte
<script lang="ts">
  import { createCheckout, openPortal } from '$lib/creem'

  let { userId, customerId, hasSubscription } = $props()

  async function handleSubscribe() {
    await createCheckout({
      productId: 'prod_xxx',
      referenceId: userId,
      units: 1
    })
  }

  async function handleManageBilling() {
    await openPortal({ customerId })
  }
</script>

{#if hasSubscription}
  <button onclick={handleManageBilling}>Manage Billing</button>
{:else}
  <button onclick={handleSubscribe}>Subscribe</button>
{/if}
```

## Dependencies

- `creem_io` (v0.4.0) - Zero production dependencies, universal SDK

## Key Differences from Stripe

| Stripe | Creem |
|--------|-------|
| `priceId` | `productId` (each interval is a separate product) |
| `stripe-signature` header | `creem-signature` header |
| Manual event handling | Built-in `onGrantAccess`/`onRevokeAccess` |
| Customer portal via Stripe | Customer portal via `createPortal()` |
