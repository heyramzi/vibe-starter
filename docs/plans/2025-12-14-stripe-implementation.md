# Stripe Subscription Integration - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add clean, simple Stripe subscription management with organization-based billing and per-seat pricing.

**Architecture:** Stripe as source of truth for products/prices. Database stores subscription state synced via webhooks. Const service pattern for Stripe operations. Middleware for auth, subscription, and role checks.

**Tech Stack:** Stripe API (2025-06-30.basil+), Supabase (PostgreSQL + Auth), Next.js 16, TypeScript, Zod

---

## Task 1: Install Stripe Package

**Files:**
- Modify: `nextjs/package.json`

**Step 1: Add stripe dependency**

```bash
cd /Users/ramzi/Studio/vibe-starter/nextjs && pnpm add stripe
```

**Step 2: Verify installation**

```bash
cd /Users/ramzi/Studio/vibe-starter/nextjs && pnpm exec tsc --noEmit
```

Expected: No errors

**Step 3: Commit**

```bash
git add nextjs/package.json nextjs/pnpm-lock.yaml
git commit -m "chore: add stripe dependency"
```

---

## Task 2: Add Environment Variables

**Files:**
- Modify: `.env.example`

**Step 1: Update env template**

Add to `.env.example` under the Payment Processing section:

```env
# Payment Processing (Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Step 2: Update env schema**

Modify: `nextjs/src/lib/env.ts`

Add Stripe variables to the schema:

```typescript
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    SUPABASE_SECRET_KEY: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  },
  runtimeEnv: {
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
})
```

**Step 3: Commit**

```bash
git add .env.example nextjs/src/lib/env.ts
git commit -m "chore: add stripe environment variables"
```

---

## Task 3: Create Database Schema (SQL Migration)

**Files:**
- Create: `nextjs/supabase/migrations/001_organizations.sql`

**Step 1: Create migrations folder**

```bash
mkdir -p /Users/ramzi/Studio/vibe-starter/nextjs/supabase/migrations
```

**Step 2: Write migration**

Create `nextjs/supabase/migrations/001_organizations.sql`:

```sql
-- Organizations table (billable entity)
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_status text default 'inactive' check (subscription_status in ('inactive', 'active', 'canceled', 'past_due', 'trialing')),
  seats integer default 1,
  created_at timestamptz default now() not null
);

-- Organization members table
create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')) not null,
  created_at timestamptz default now() not null,
  unique(organization_id, user_id)
);

-- Indexes
create index organizations_owner_id_idx on public.organizations(owner_id);
create index organizations_stripe_customer_id_idx on public.organizations(stripe_customer_id);
create index organization_members_user_id_idx on public.organization_members(user_id);
create index organization_members_organization_id_idx on public.organization_members(organization_id);

-- RLS policies
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- Organizations: users can view orgs they belong to
create policy "Users can view their organizations"
  on public.organizations for select
  using (
    id in (
      select organization_id from public.organization_members
      where user_id = auth.uid()
    )
  );

-- Organizations: only owner can update
create policy "Owner can update organization"
  on public.organizations for update
  using (owner_id = auth.uid());

-- Organization members: users can view members of their orgs
create policy "Users can view org members"
  on public.organization_members for select
  using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid()
    )
  );

-- Organization members: owner and admin can insert
create policy "Owner and admin can add members"
  on public.organization_members for insert
  with check (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Organization members: owner and admin can delete
create policy "Owner and admin can remove members"
  on public.organization_members for delete
  using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );
```

**Step 3: Commit**

```bash
git add nextjs/supabase/
git commit -m "feat: add organizations and members schema"
```

---

## Task 4: Create TypeScript Types

**Files:**
- Create: `nextjs/src/lib/stripe/types.ts`

**Step 1: Create stripe directory**

```bash
mkdir -p /Users/ramzi/Studio/vibe-starter/nextjs/src/lib/stripe
```

**Step 2: Create types file**

```typescript
// Subscription status from Stripe
export type SubscriptionStatus = 'inactive' | 'active' | 'canceled' | 'past_due' | 'trialing'

// Organization role
export type OrgRole = 'owner' | 'admin' | 'member'

// Database types
export interface Organization {
  id: string
  name: string
  slug: string
  owner_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: SubscriptionStatus
  seats: number
  created_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: OrgRole
  created_at: string
}

// API response types
export interface CheckoutSessionResponse {
  url: string
}

export interface PortalSessionResponse {
  url: string
}
```

**Step 3: Commit**

```bash
git add nextjs/src/lib/stripe/
git commit -m "feat: add stripe type definitions"
```

---

## Task 5: Create Stripe Client

**Files:**
- Create: `nextjs/src/lib/stripe/client.ts`

**Step 1: Create Stripe client**

```typescript
import Stripe from 'stripe'
import { env } from '@/lib/env'

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
})
```

**Step 2: Type check**

```bash
cd /Users/ramzi/Studio/vibe-starter/nextjs && pnpm exec tsc --noEmit
```

**Step 3: Commit**

```bash
git add nextjs/src/lib/stripe/client.ts
git commit -m "feat: add stripe client"
```

---

## Task 6: Create Stripe Service (Checkout + Portal)

**Files:**
- Create: `nextjs/src/lib/stripe/stripe-service.ts`

**Step 1: Create service with const pattern**

```typescript
import { stripe } from '@/lib/stripe/client'
import { createServerClient } from '@/lib/supabase'
import { env } from '@/lib/env'
import type { Organization } from '@/lib/stripe/types'

// Get or create Stripe customer for organization
async function getOrCreateCustomer(org: Organization, email: string): Promise<string> {
  if (org.stripe_customer_id) {
    return org.stripe_customer_id
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { organization_id: org.id },
  })

  const supabase = await createServerClient()
  await supabase
    .from('organizations')
    .update({ stripe_customer_id: customer.id })
    .eq('id', org.id)

  return customer.id
}

export const StripeService = {
  // Create checkout session for subscription
  async createCheckoutSession(organizationId: string, priceId: string, userEmail: string) {
    const supabase = await createServerClient()

    const { data: org, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (error || !org) {
      throw new Error('Organization not found')
    }

    const customerId = await getOrCreateCustomer(org as Organization, userEmail)

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: org.seats || 1 }],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
      subscription_data: {
        metadata: { organization_id: organizationId },
      },
    })

    return { url: session.url }
  },

  // Create customer portal session
  async createPortalSession(organizationId: string) {
    const supabase = await createServerClient()

    const { data: org, error } = await supabase
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', organizationId)
      .single()

    if (error || !org?.stripe_customer_id) {
      throw new Error('No billing account found')
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/billing`,
    })

    return { url: session.url }
  },

  // Update subscription seat count
  async updateSeats(organizationId: string, seats: number) {
    const supabase = await createServerClient()

    const { data: org, error } = await supabase
      .from('organizations')
      .select('stripe_subscription_id')
      .eq('id', organizationId)
      .single()

    if (error || !org?.stripe_subscription_id) {
      throw new Error('No active subscription')
    }

    const subscription = await stripe.subscriptions.retrieve(org.stripe_subscription_id)
    const itemId = subscription.items.data[0]?.id

    if (!itemId) {
      throw new Error('Subscription item not found')
    }

    await stripe.subscriptionItems.update(itemId, { quantity: seats })

    await supabase.from('organizations').update({ seats }).eq('id', organizationId)

    return { seats }
  },
}
```

**Step 2: Type check**

```bash
cd /Users/ramzi/Studio/vibe-starter/nextjs && pnpm exec tsc --noEmit
```

**Step 3: Commit**

```bash
git add nextjs/src/lib/stripe/stripe-service.ts
git commit -m "feat: add stripe service with checkout, portal, and seat management"
```

---

## Task 7: Create Webhook Handler

**Files:**
- Create: `nextjs/src/lib/stripe/webhook.ts`

**Step 1: Create webhook handler**

```typescript
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { createServerClient } from '@/lib/supabase'
import type { SubscriptionStatus } from '@/lib/stripe/types'

// Map Stripe status to our status
function mapStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
    active: 'active',
    canceled: 'canceled',
    incomplete: 'inactive',
    incomplete_expired: 'inactive',
    past_due: 'past_due',
    paused: 'inactive',
    trialing: 'trialing',
    unpaid: 'past_due',
  }
  return statusMap[status] || 'inactive'
}

// Sync subscription data to database
async function syncSubscription(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata.organization_id
  if (!organizationId) return

  const supabase = await createServerClient()
  const item = subscription.items.data[0]

  await supabase
    .from('organizations')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: mapStatus(subscription.status),
      seats: item?.quantity || 1,
    })
    .eq('id', organizationId)
}

export const WebhookHandler = {
  // Verify and parse webhook event
  async constructEvent(body: string, signature: string, secret: string) {
    return stripe.webhooks.constructEvent(body, signature, secret)
  },

  // Handle webhook event
  async handleEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          await syncSubscription(subscription)
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        await syncSubscription(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const organizationId = subscription.metadata.organization_id
        if (organizationId) {
          const supabase = await createServerClient()
          await supabase
            .from('organizations')
            .update({
              subscription_status: 'canceled',
              stripe_subscription_id: null,
            })
            .eq('id', organizationId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const organizationId = subscription.metadata.organization_id
          if (organizationId) {
            const supabase = await createServerClient()
            await supabase
              .from('organizations')
              .update({ subscription_status: 'past_due' })
              .eq('id', organizationId)
          }
        }
        break
      }
    }
  },
}
```

**Step 2: Type check**

```bash
cd /Users/ramzi/Studio/vibe-starter/nextjs && pnpm exec tsc --noEmit
```

**Step 3: Commit**

```bash
git add nextjs/src/lib/stripe/webhook.ts
git commit -m "feat: add stripe webhook handler"
```

---

## Task 8: Create Barrel Export

**Files:**
- Create: `nextjs/src/lib/stripe/index.ts`

**Step 1: Create barrel export**

```typescript
// Types
export type {
  Organization,
  OrganizationMember,
  OrgRole,
  SubscriptionStatus,
  CheckoutSessionResponse,
  PortalSessionResponse,
} from '@/lib/stripe/types'

// Services
export { StripeService } from '@/lib/stripe/stripe-service'
export { WebhookHandler } from '@/lib/stripe/webhook'

// Client (for advanced usage)
export { stripe } from '@/lib/stripe/client'
```

**Step 2: Type check**

```bash
cd /Users/ramzi/Studio/vibe-starter/nextjs && pnpm exec tsc --noEmit
```

**Step 3: Commit**

```bash
git add nextjs/src/lib/stripe/index.ts
git commit -m "feat: add stripe barrel exports"
```

---

## Task 9: Create Webhook API Route

**Files:**
- Create: `nextjs/src/app/api/stripe/webhook/route.ts`

**Step 1: Create API route**

```typescript
import { NextResponse } from 'next/server'
import { WebhookHandler } from '@/lib/stripe'
import { env } from '@/lib/env'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  try {
    const event = await WebhookHandler.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET)

    await WebhookHandler.handleEvent(event)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook failed' },
      { status: 400 }
    )
  }
}
```

**Step 2: Type check**

```bash
cd /Users/ramzi/Studio/vibe-starter/nextjs && pnpm exec tsc --noEmit
```

**Step 3: Commit**

```bash
git add nextjs/src/app/api/stripe/
git commit -m "feat: add stripe webhook API route"
```

---

## Task 10: Create Auth Middleware

**Files:**
- Create: `nextjs/src/lib/middleware/auth.ts`

**Step 1: Create middleware directory**

```bash
mkdir -p /Users/ramzi/Studio/vibe-starter/nextjs/src/lib/middleware
```

**Step 2: Create auth middleware**

```typescript
import { createServerClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthContext {
  user: User
}

// Get authenticated user or throw
export async function requireAuth(): Promise<AuthContext> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return { user }
}
```

**Step 3: Commit**

```bash
git add nextjs/src/lib/middleware/
git commit -m "feat: add auth middleware"
```

---

## Task 11: Create Subscription Middleware

**Files:**
- Create: `nextjs/src/lib/middleware/subscription.ts`

**Step 1: Create subscription middleware**

```typescript
import { createServerClient } from '@/lib/supabase'
import type { Organization, OrgRole } from '@/lib/stripe'

export interface OrgContext {
  organization: Organization
  role: OrgRole
}

// Get user's organization with active subscription
export async function requireSubscription(userId: string): Promise<OrgContext> {
  const supabase = await createServerClient()

  const { data: membership, error } = await supabase
    .from('organization_members')
    .select('role, organizations(*)')
    .eq('user_id', userId)
    .single()

  if (error || !membership?.organizations) {
    throw new Error('No organization found')
  }

  const org = membership.organizations as unknown as Organization

  if (org.subscription_status !== 'active' && org.subscription_status !== 'trialing') {
    throw new Error('Subscription required')
  }

  return {
    organization: org,
    role: membership.role as OrgRole,
  }
}

// Get user's organization (no subscription check)
export async function requireOrg(userId: string): Promise<OrgContext> {
  const supabase = await createServerClient()

  const { data: membership, error } = await supabase
    .from('organization_members')
    .select('role, organizations(*)')
    .eq('user_id', userId)
    .single()

  if (error || !membership?.organizations) {
    throw new Error('No organization found')
  }

  return {
    organization: membership.organizations as unknown as Organization,
    role: membership.role as OrgRole,
  }
}
```

**Step 2: Commit**

```bash
git add nextjs/src/lib/middleware/subscription.ts
git commit -m "feat: add subscription middleware"
```

---

## Task 12: Create Roles Middleware

**Files:**
- Create: `nextjs/src/lib/middleware/roles.ts`

**Step 1: Create roles middleware**

```typescript
import type { OrgRole } from '@/lib/stripe'

const roleHierarchy: Record<OrgRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
}

// Check if user has required role or higher
export function requireRole(userRole: OrgRole, requiredRole: OrgRole): void {
  if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
    throw new Error(`Requires ${requiredRole} role`)
  }
}
```

**Step 2: Commit**

```bash
git add nextjs/src/lib/middleware/roles.ts
git commit -m "feat: add role-based access middleware"
```

---

## Task 13: Create Middleware Barrel Export

**Files:**
- Create: `nextjs/src/lib/middleware/index.ts`

**Step 1: Create barrel export**

```typescript
export { requireAuth, type AuthContext } from '@/lib/middleware/auth'
export { requireSubscription, requireOrg, type OrgContext } from '@/lib/middleware/subscription'
export { requireRole } from '@/lib/middleware/roles'
```

**Step 2: Type check**

```bash
cd /Users/ramzi/Studio/vibe-starter/nextjs && pnpm exec tsc --noEmit
```

**Step 3: Commit**

```bash
git add nextjs/src/lib/middleware/index.ts
git commit -m "feat: add middleware barrel exports"
```

---

## Task 14: Create Checkout API Route

**Files:**
- Create: `nextjs/src/app/api/stripe/checkout/route.ts`

**Step 1: Create checkout route**

```typescript
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { StripeService } from '@/lib/stripe'
import { requireAuth, requireOrg, requireRole } from '@/lib/middleware'

const checkoutSchema = z.object({
  priceId: z.string().startsWith('price_'),
})

export async function POST(request: Request) {
  try {
    const { user } = await requireAuth()
    const { organization, role } = await requireOrg(user.id)

    requireRole(role, 'owner')

    const body = await request.json()
    const { priceId } = checkoutSchema.parse(body)

    const { url } = await StripeService.createCheckoutSession(
      organization.id,
      priceId,
      user.email!
    )

    if (!url) {
      throw new Error('Failed to create checkout session')
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 400 }
    )
  }
}
```

**Step 2: Commit**

```bash
git add nextjs/src/app/api/stripe/checkout/route.ts
git commit -m "feat: add checkout API route"
```

---

## Task 15: Create Portal API Route

**Files:**
- Create: `nextjs/src/app/api/stripe/portal/route.ts`

**Step 1: Create portal route**

```typescript
import { NextResponse } from 'next/server'
import { StripeService } from '@/lib/stripe'
import { requireAuth, requireOrg, requireRole } from '@/lib/middleware'

export async function POST() {
  try {
    const { user } = await requireAuth()
    const { organization, role } = await requireOrg(user.id)

    requireRole(role, 'owner')

    const { url } = await StripeService.createPortalSession(organization.id)

    if (!url) {
      throw new Error('Failed to create portal session')
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Portal failed' },
      { status: 400 }
    )
  }
}
```

**Step 2: Type check all**

```bash
cd /Users/ramzi/Studio/vibe-starter/nextjs && pnpm exec tsc --noEmit
```

**Step 3: Commit**

```bash
git add nextjs/src/app/api/stripe/portal/route.ts
git commit -m "feat: add billing portal API route"
```

---

## Task 16: Update Documentation

**Files:**
- Modify: `.env.example`
- Create: `.claude/deps/stripe.md`

**Step 1: Create Stripe documentation**

Create `.claude/deps/stripe.md`:

```markdown
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
```

**Step 2: Commit**

```bash
git add .claude/deps/stripe.md
git commit -m "docs: add stripe integration documentation"
```

---

## Task 17: Final Type Check and Lint

**Step 1: Full type check**

```bash
cd /Users/ramzi/Studio/vibe-starter/nextjs && pnpm exec tsc --noEmit
```

**Step 2: Lint check**

```bash
cd /Users/ramzi/Studio/vibe-starter/nextjs && pnpm lint
```

**Step 3: Fix any issues if needed**

---

## Summary

Files created:
- `nextjs/supabase/migrations/001_organizations.sql`
- `nextjs/src/lib/stripe/types.ts`
- `nextjs/src/lib/stripe/client.ts`
- `nextjs/src/lib/stripe/stripe-service.ts`
- `nextjs/src/lib/stripe/webhook.ts`
- `nextjs/src/lib/stripe/index.ts`
- `nextjs/src/lib/middleware/auth.ts`
- `nextjs/src/lib/middleware/subscription.ts`
- `nextjs/src/lib/middleware/roles.ts`
- `nextjs/src/lib/middleware/index.ts`
- `nextjs/src/app/api/stripe/webhook/route.ts`
- `nextjs/src/app/api/stripe/checkout/route.ts`
- `nextjs/src/app/api/stripe/portal/route.ts`
- `.claude/deps/stripe.md`

Files modified:
- `.env.example`
- `nextjs/src/lib/env.ts`
- `nextjs/package.json`
