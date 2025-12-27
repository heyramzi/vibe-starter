# Convex Integration Design

Add Convex as an alternative backend to Supabase, with choice at setup time.

## Decisions

| Aspect | Decision |
|--------|----------|
| Setup flow | Single combined choice: `nextjs-supabase`, `nextjs-convex`, `sveltekit-supabase`, `sveltekit-convex` |
| File structure | Nested: framework as primary, backend as subdirectory |
| Auth | Email OTP for both backends (remove password auth) |
| Data models | Mirror structure (organizations, members) |
| Stripe | Supabase: direct SDK / Convex: `@convex-dev/stripe` component |
| MCP | Add Convex MCP server to `.mcp.json` |
| Parity | Feature parity, leverage each tool's strengths |

## Project Structure

```
vibe-starter/
├── .claude/                    # Shared AI docs
├── .mcp.json                   # Includes Convex MCP server
├── .env.example.supabase       # Supabase env template
├── .env.example.convex         # Convex env template
├── setup.sh                    # 4-variant setup script
├── nextjs/
│   ├── supabase/               # Full Next.js + Supabase app
│   └── convex/                 # Full Next.js + Convex app
└── sveltekit/
    ├── supabase/               # Full SvelteKit + Supabase
    └── convex/                 # Full SvelteKit + Convex
```

## Authentication

### Supabase OTP

```typescript
// src/lib/supabase/auth.ts
export const SupabaseAuth = {
  async sendOTP(email: string) {
    const supabase = createClient()
    return supabase.auth.signInWithOtp({ email })
  },

  async verifyOTP(email: string, token: string) {
    const supabase = createClient()
    return supabase.auth.verifyOtp({ email, token, type: 'email' })
  },

  async signOut() {
    const supabase = createClient()
    return supabase.auth.signOut()
  }
}
```

### Convex OTP

```typescript
// convex/auth.config.ts
import { convexAuth } from "@convex-dev/auth/server"
import { OTP } from "@convex-dev/auth/providers/OTP"

export const { auth, signIn, signOut } = convexAuth({
  providers: [OTP],
})
```

```typescript
// src/lib/convex/auth.ts
export const ConvexAuth = {
  async sendOTP(email: string) {
    return signIn("otp", { email })
  },

  async verifyOTP(email: string, code: string) {
    return signIn("otp", { email, code })
  }
}
```

## Data Models

### Supabase (PostgreSQL)

```sql
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

create table organization_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  user_id uuid references auth.users(id),
  role text default 'member',
  created_at timestamptz default now()
);
```

### Convex (schema.ts)

```typescript
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  }),

  organizationMembers: defineTable({
    orgId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
  }).index("by_user", ["userId"]),
})
```

## Stripe Integration

| | Supabase | Convex |
|---|---|---|
| Package | `stripe` (direct SDK) | `@convex-dev/stripe` component |
| Webhooks | API route + manual DB updates | Automatic sync to Convex tables |
| Checkout | `StripeService.createCheckoutSession()` | `stripe.createCheckoutSession()` |
| Portal | `StripeService.createPortalSession()` | `stripe.createBillingPortalSession()` |

## MCP Configuration

```json
{
  "mcpServers": {
    "convex": {
      "command": "npx",
      "args": ["@anthropic-ai/convex-mcp-server"],
      "env": {
        "CONVEX_DEPLOYMENT": "${CONVEX_DEPLOYMENT}",
        "CONVEX_ADMIN_KEY": "${CONVEX_ADMIN_KEY}"
      }
    }
  }
}
```

## Setup Script

```bash
./setup.sh nextjs-supabase    # Next.js + Supabase
./setup.sh nextjs-convex      # Next.js + Convex
./setup.sh sveltekit-supabase # SvelteKit + Supabase
./setup.sh sveltekit-convex   # SvelteKit + Convex
```

The script:
1. Removes other framework directory
2. Moves selected variant to project root
3. Creates appropriate `.env` file from template
4. Cleans up nested structure

## Documentation Updates

- `.claude/CLAUDE.md` - Update tech stack section
- `.claude/docs/environment.md` - Split into Supabase vs Convex sections
- `.claude/docs/mcp-config.md` - Add Convex MCP setup
- `.claude/deps/supabase.md` - NEW: Supabase patterns, OTP auth
- `.claude/deps/convex.md` - NEW: Convex patterns, schema, queries
- `.claude/deps/stripe.md` - Update with both integration approaches
- `.claude/steering/tech.md` - Update architecture options
