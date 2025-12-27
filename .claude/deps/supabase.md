# Supabase Integration

Supabase is a PostgreSQL-based backend with auth, storage, and real-time.

## When to Use

- Apps needing relational data with SQL
- Complex RLS (Row Level Security) requirements
- Self-hosting requirements
- Existing PostgreSQL knowledge

## Auth (OTP)

Uses Supabase Auth with email OTP:

```typescript
import { SupabaseAuth } from "@/lib/supabase"

// Send magic link/OTP
await SupabaseAuth.sendOTP("user@example.com")

// Verify OTP code
await SupabaseAuth.verifyOTP("user@example.com", "123456")

// Sign out
await SupabaseAuth.signOut()
```

## Database

SQL tables with Row Level Security:

```sql
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stripe_customer_id text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table organizations enable row level security;

-- Policy for members
create policy "Members can view their orgs"
  on organizations for select
  using (
    id in (
      select org_id from organization_members
      where user_id = auth.uid()
    )
  );
```

## Clients

**Next.js:**
```typescript
import { createServerClient, createBrowserClient } from "@/lib/supabase"

// Server Components / API Routes
const supabase = await createServerClient()

// Client Components
const supabase = createBrowserClient()
```

**SvelteKit:**
```typescript
// Server: Use event.locals.supabase
// Browser: import { createClient } from "$lib/supabase"
```

## Stripe Integration

Uses direct Stripe SDK with manual webhook handling:

```typescript
export const StripeService = {
  async createCheckoutSession(orgId: string, priceId: string) {
    return stripe.checkout.sessions.create({
      customer: org.stripe_customer_id,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${APP_URL}/billing?success=true`,
      cancel_url: `${APP_URL}/billing?canceled=true`,
    })
  },
}
```
