# Convex Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Convex as an alternative backend to Supabase with 4 setup variants.

**Architecture:** Restructure project to nested folders (framework/backend), update setup script for 4 variants, implement OTP auth for both backends, add Convex Stripe component.

**Tech Stack:** Convex, @convex-dev/auth, @convex-dev/stripe, Supabase OTP

---

## Phase 1: Project Restructuring

### Task 1: Create Nested Directory Structure

**Files:**
- Create: `nextjs/supabase/` (move existing nextjs content)
- Create: `sveltekit/supabase/` (move existing sveltekit content)

**Step 1: Create supabase subdirectories**

```bash
mkdir -p nextjs/supabase sveltekit/supabase
```

**Step 2: Move Next.js files into supabase subfolder**

```bash
cd /Users/ramzi/Studio/vibe-starter
# Move all nextjs contents except the new supabase folder
shopt -s dotglob
mv nextjs/!(supabase) nextjs/supabase/
shopt -u dotglob
```

**Step 3: Move SvelteKit files into supabase subfolder**

```bash
cd /Users/ramzi/Studio/vibe-starter
shopt -s dotglob
mv sveltekit/!(supabase) sveltekit/supabase/
shopt -u dotglob
```

**Step 4: Verify structure**

```bash
ls nextjs/supabase/src
ls sveltekit/supabase/src
```

Expected: Both show `app`/`routes`, `lib`, `components`, etc.

**Step 5: Commit**

```bash
git add -A && git commit -m "refactor: restructure to nested framework/backend folders"
```

---

### Task 2: Create Convex Variant Skeletons

**Files:**
- Create: `nextjs/convex/` (copy from supabase, will modify)
- Create: `sveltekit/convex/` (copy from supabase, will modify)

**Step 1: Copy Next.js supabase to convex**

```bash
cp -r nextjs/supabase nextjs/convex
```

**Step 2: Copy SvelteKit supabase to convex**

```bash
cp -r sveltekit/supabase sveltekit/convex
```

**Step 3: Remove Supabase-specific files from Convex variants**

```bash
rm -rf nextjs/convex/src/lib/supabase
rm -rf sveltekit/convex/src/lib/supabase
rm -f sveltekit/convex/src/hooks.server.ts
```

**Step 4: Commit**

```bash
git add -A && git commit -m "refactor: create convex variant skeletons"
```

---

### Task 3: Update Setup Script for 4 Variants

**Files:**
- Modify: `setup.sh`

**Step 1: Replace setup.sh with new 4-variant version**

```bash
#!/bin/bash

# Vibe Starter Setup Script
# Usage: ./setup.sh <variant>

set -e

usage() {
  echo "Usage: ./setup.sh <variant>"
  echo ""
  echo "Variants:"
  echo "  nextjs-supabase     Next.js 16 + Supabase"
  echo "  nextjs-convex       Next.js 16 + Convex"
  echo "  sveltekit-supabase  SvelteKit 2 + Supabase"
  echo "  sveltekit-convex    SvelteKit 2 + Convex"
  echo ""
  echo "Example:"
  echo "  ./setup.sh nextjs-convex"
  exit 1
}

case "$1" in
  nextjs-supabase)
    FRAMEWORK="nextjs"
    BACKEND="supabase"
    ENV_FILE=".env.local"
    ;;
  nextjs-convex)
    FRAMEWORK="nextjs"
    BACKEND="convex"
    ENV_FILE=".env.local"
    ;;
  sveltekit-supabase)
    FRAMEWORK="sveltekit"
    BACKEND="supabase"
    ENV_FILE=".env"
    ;;
  sveltekit-convex)
    FRAMEWORK="sveltekit"
    BACKEND="convex"
    ENV_FILE=".env"
    ;;
  *)
    usage
    ;;
esac

OTHER_FRAMEWORK=$([[ "$FRAMEWORK" == "nextjs" ]] && echo "sveltekit" || echo "nextjs")

echo "Setting up $FRAMEWORK with $BACKEND..."

# Remove other framework entirely
rm -rf "$OTHER_FRAMEWORK"
echo "Removed $OTHER_FRAMEWORK/"

# Move selected variant to framework root, then to project root
mv "$FRAMEWORK/$BACKEND"/* "$FRAMEWORK/$BACKEND"/.[!.]* . 2>/dev/null || mv "$FRAMEWORK/$BACKEND"/* .
rm -rf "$FRAMEWORK"
echo "Moved $FRAMEWORK/$BACKEND/ contents to root"

# Set up environment file from backend-specific template
if [[ -f ".env.example.$BACKEND" ]]; then
  cp ".env.example.$BACKEND" "$ENV_FILE"
  echo "Created $ENV_FILE from .env.example.$BACKEND"
elif [[ -f ".env.example" ]]; then
  cp ".env.example" "$ENV_FILE"
  echo "Created $ENV_FILE from .env.example"
fi

# Clean up env templates
rm -f .env.example.supabase .env.example.convex 2>/dev/null

echo ""
echo "Done! Next steps:"
echo "  1. Edit $ENV_FILE with your credentials"
echo "  2. Run: pnpm install"
echo "  3. Run: pnpm dev"
```

**Step 2: Commit**

```bash
git add setup.sh && git commit -m "feat: update setup.sh for 4 variants"
```

---

### Task 4: Create Backend-Specific Env Templates

**Files:**
- Create: `.env.example.supabase`
- Create: `.env.example.convex`
- Delete: `.env.example` (replaced by backend-specific)

**Step 1: Create Supabase env template**

Create `.env.example.supabase`:

```env
# =============================================================================
# SUPABASE BACKEND - Environment Variables
# =============================================================================
# Copy to .env.local (Next.js) or .env (SvelteKit)

# -----------------------------------------------------------------------------
# Supabase Configuration
# -----------------------------------------------------------------------------
# Get from: https://app.supabase.com → Project → Settings → API Keys

# For Next.js (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# For SvelteKit (PUBLIC_ prefix)
# PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# Server-side only - bypasses RLS
SUPABASE_SECRET_KEY=sb_secret_...

# -----------------------------------------------------------------------------
# Application
# -----------------------------------------------------------------------------
NEXT_PUBLIC_APP_URL=http://localhost:3000
# PUBLIC_APP_URL=http://localhost:5173

# -----------------------------------------------------------------------------
# Stripe (Payment Processing)
# -----------------------------------------------------------------------------
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# -----------------------------------------------------------------------------
# Email (Unosend)
# -----------------------------------------------------------------------------
UNOSEND_API_KEY=un_...
```

**Step 2: Create Convex env template**

Create `.env.example.convex`:

```env
# =============================================================================
# CONVEX BACKEND - Environment Variables
# =============================================================================
# Copy to .env.local (Next.js) or .env (SvelteKit)

# -----------------------------------------------------------------------------
# Convex Configuration
# -----------------------------------------------------------------------------
# Get from: https://dashboard.convex.dev → Project → Settings

# For Next.js
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# For SvelteKit
# PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# For Convex CLI and MCP (server-side)
CONVEX_DEPLOYMENT=dev:your-project
CONVEX_ADMIN_KEY=prod:your-project|...

# -----------------------------------------------------------------------------
# Application
# -----------------------------------------------------------------------------
NEXT_PUBLIC_APP_URL=http://localhost:3000
# PUBLIC_APP_URL=http://localhost:5173

# -----------------------------------------------------------------------------
# Stripe (Payment Processing)
# -----------------------------------------------------------------------------
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# -----------------------------------------------------------------------------
# Email (Unosend)
# -----------------------------------------------------------------------------
UNOSEND_API_KEY=un_...
```

**Step 3: Remove old .env.example**

```bash
rm .env.example
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add backend-specific env templates"
```

---

## Phase 2: Convex MCP Configuration

### Task 5: Add Convex MCP to .mcp.json

**Files:**
- Create: `.mcp.json`

**Step 1: Create .mcp.json with Convex server**

```json
{
  "mcpServers": {
    "convex": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/convex-mcp-server"],
      "env": {
        "CONVEX_DEPLOYMENT": "${CONVEX_DEPLOYMENT}",
        "CONVEX_ADMIN_KEY": "${CONVEX_ADMIN_KEY}"
      }
    }
  }
}
```

**Step 2: Commit**

```bash
git add .mcp.json && git commit -m "feat: add Convex MCP server configuration"
```

---

## Phase 3: Next.js Convex Implementation

### Task 6: Add Convex Dependencies to Next.js

**Files:**
- Modify: `nextjs/convex/package.json`

**Step 1: Update package.json**

Add to dependencies:
```json
{
  "dependencies": {
    "convex": "^1.21.0",
    "@convex-dev/auth": "^0.0.80",
    "@convex-dev/stripe": "^0.1.0",
    "@auth/core": "^0.37.0"
  }
}
```

Remove Supabase dependencies:
- `@supabase/ssr`
- `@supabase/supabase-js`

**Step 2: Commit**

```bash
git add nextjs/convex/package.json && git commit -m "feat(nextjs-convex): update dependencies for Convex"
```

---

### Task 7: Create Convex Schema

**Files:**
- Create: `nextjs/convex/convex/schema.ts`

**Step 1: Create convex directory and schema**

```bash
mkdir -p nextjs/convex/convex
```

Create `nextjs/convex/convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"

export default defineSchema({
  ...authTables,

  organizations: defineTable({
    name: v.string(),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    plan: v.optional(v.string()),
    createdAt: v.number(),
  }),

  organizationMembers: defineTable({
    orgId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    createdAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_user", ["userId"])
    .index("by_org_and_user", ["orgId", "userId"]),
})
```

**Step 2: Commit**

```bash
git add nextjs/convex/convex/schema.ts && git commit -m "feat(nextjs-convex): add Convex schema"
```

---

### Task 8: Configure Convex Auth with OTP

**Files:**
- Create: `nextjs/convex/convex/auth.config.ts`
- Create: `nextjs/convex/convex/auth.ts`

**Step 1: Create auth.config.ts**

```typescript
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
}
```

**Step 2: Create auth.ts with OTP provider**

```typescript
import { convexAuth } from "@convex-dev/auth/server"
import { ResendOTP } from "@convex-dev/auth/providers/ResendOTP"

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    ResendOTP({
      id: "resend-otp",
      apiKey: process.env.RESEND_API_KEY,
      maxAge: 60 * 15, // 15 minutes
    }),
  ],
})
```

**Step 3: Commit**

```bash
git add nextjs/convex/convex/auth.config.ts nextjs/convex/convex/auth.ts && git commit -m "feat(nextjs-convex): add Convex OTP auth"
```

---

### Task 9: Create Convex HTTP Routes

**Files:**
- Create: `nextjs/convex/convex/http.ts`

**Step 1: Create http.ts for auth routes**

```typescript
import { httpRouter } from "convex/server"
import { auth } from "./auth"

const http = httpRouter()

auth.addHttpRoutes(http)

export default http
```

**Step 2: Commit**

```bash
git add nextjs/convex/convex/http.ts && git commit -m "feat(nextjs-convex): add Convex HTTP routes"
```

---

### Task 10: Create Convex Client Provider for Next.js

**Files:**
- Create: `nextjs/convex/src/lib/convex/provider.tsx`
- Create: `nextjs/convex/src/lib/convex/client.ts`
- Create: `nextjs/convex/src/lib/convex/index.ts`

**Step 1: Create client.ts**

```typescript
import { ConvexReactClient } from "convex/react"

export const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
```

**Step 2: Create provider.tsx**

```typescript
"use client"

import { ConvexAuthProvider } from "@convex-dev/auth/react"
import { ConvexReactClient } from "convex/react"
import { ReactNode } from "react"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>
}
```

**Step 3: Create index.ts barrel export**

```typescript
export { convex } from "./client"
export { ConvexClientProvider } from "./provider"
```

**Step 4: Commit**

```bash
git add nextjs/convex/src/lib/convex/ && git commit -m "feat(nextjs-convex): add Convex client provider"
```

---

### Task 11: Create Convex Auth Service

**Files:**
- Create: `nextjs/convex/src/lib/convex/auth.ts`

**Step 1: Create auth service following const pattern**

```typescript
"use client"

import { useAuthActions } from "@convex-dev/auth/react"

export function useConvexAuth() {
  const { signIn, signOut } = useAuthActions()

  return {
    async sendOTP(email: string) {
      return signIn("resend-otp", { email })
    },

    async verifyOTP(email: string, code: string) {
      return signIn("resend-otp", { email, code })
    },

    async signOut() {
      return signOut()
    },
  }
}
```

**Step 2: Update index.ts to export auth**

Add to `nextjs/convex/src/lib/convex/index.ts`:

```typescript
export { useConvexAuth } from "./auth"
```

**Step 3: Commit**

```bash
git add nextjs/convex/src/lib/convex/ && git commit -m "feat(nextjs-convex): add Convex auth service"
```

---

### Task 12: Set Up Convex Stripe Component

**Files:**
- Create: `nextjs/convex/convex/stripe.ts`
- Modify: `nextjs/convex/convex/schema.ts` (add Stripe tables)

**Step 1: Create stripe.ts**

```typescript
import { StripeSubscriptions } from "@convex-dev/stripe"
import { components } from "./_generated/api"

export const stripe = new StripeSubscriptions(components.stripe, {
  prices: {
    default: process.env.STRIPE_PRICE_ID!,
  },
})

// Re-export actions
export const {
  createCheckoutSession,
  createBillingPortalSession,
  getSubscription,
  cancelSubscription,
} = stripe
```

**Step 2: Update convex.config.ts to include Stripe component**

Create `nextjs/convex/convex.config.ts`:

```typescript
import { defineApp } from "convex/server"
import stripe from "@convex-dev/stripe/convex.config"

const app = defineApp()
app.use(stripe)

export default app
```

**Step 3: Commit**

```bash
git add nextjs/convex/convex/ && git commit -m "feat(nextjs-convex): add Stripe component integration"
```

---

### Task 13: Update Next.js Convex Layout

**Files:**
- Modify: `nextjs/convex/src/app/layout.tsx`

**Step 1: Wrap with ConvexClientProvider**

Update the root layout to include the Convex provider:

```typescript
import { ConvexClientProvider } from "@/lib/convex"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  )
}
```

**Step 2: Commit**

```bash
git add nextjs/convex/src/app/layout.tsx && git commit -m "feat(nextjs-convex): add Convex provider to layout"
```

---

### Task 14: Update Next.js Convex env.ts

**Files:**
- Modify: `nextjs/convex/src/lib/env.ts`

**Step 1: Replace Supabase env vars with Convex**

```typescript
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    CONVEX_DEPLOYMENT: z.string().optional(),
    CONVEX_ADMIN_KEY: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    UNOSEND_API_KEY: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_CONVEX_URL: z.string().url(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  },
  runtimeEnv: {
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    CONVEX_ADMIN_KEY: process.env.CONVEX_ADMIN_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    UNOSEND_API_KEY: process.env.UNOSEND_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
})
```

**Step 2: Commit**

```bash
git add nextjs/convex/src/lib/env.ts && git commit -m "feat(nextjs-convex): update env.ts for Convex"
```

---

## Phase 4: SvelteKit Convex Implementation

### Task 15: Add Convex Dependencies to SvelteKit

**Files:**
- Modify: `sveltekit/convex/package.json`

**Step 1: Update package.json**

Add to dependencies:
```json
{
  "dependencies": {
    "convex": "^1.21.0",
    "convex-svelte": "^0.0.8",
    "@convex-dev/auth": "^0.0.80"
  }
}
```

Remove Supabase dependencies.

**Step 2: Commit**

```bash
git add sveltekit/convex/package.json && git commit -m "feat(sveltekit-convex): update dependencies for Convex"
```

---

### Task 16: Create Convex Schema for SvelteKit

**Files:**
- Create: `sveltekit/convex/convex/schema.ts`
- Create: `sveltekit/convex/convex/auth.ts`
- Create: `sveltekit/convex/convex/auth.config.ts`
- Create: `sveltekit/convex/convex/http.ts`

**Step 1: Copy convex folder from Next.js (same backend logic)**

```bash
cp -r nextjs/convex/convex sveltekit/convex/
```

**Step 2: Commit**

```bash
git add sveltekit/convex/convex/ && git commit -m "feat(sveltekit-convex): add Convex backend files"
```

---

### Task 17: Create SvelteKit Convex Client

**Files:**
- Create: `sveltekit/convex/src/lib/convex/client.ts`
- Create: `sveltekit/convex/src/lib/convex/index.ts`

**Step 1: Create client.ts**

```typescript
import { PUBLIC_CONVEX_URL } from "$env/static/public"
import { ConvexClient } from "convex/browser"

export const convex = new ConvexClient(PUBLIC_CONVEX_URL)
```

**Step 2: Create index.ts**

```typescript
export { convex } from "./client"
```

**Step 3: Commit**

```bash
git add sveltekit/convex/src/lib/convex/ && git commit -m "feat(sveltekit-convex): add Convex client"
```

---

### Task 18: Update SvelteKit Convex app.d.ts

**Files:**
- Modify: `sveltekit/convex/src/app.d.ts`

**Step 1: Replace Supabase types with Convex**

```typescript
import type { ConvexClient } from "convex/browser"

declare global {
  namespace App {
    interface Locals {
      convex: ConvexClient
    }
    interface PageData {
      user: { id: string; email: string } | null
    }
  }
}

export {}
```

**Step 2: Commit**

```bash
git add sveltekit/convex/src/app.d.ts && git commit -m "feat(sveltekit-convex): update app.d.ts types"
```

---

### Task 19: Create SvelteKit Convex Hooks

**Files:**
- Create: `sveltekit/convex/src/hooks.server.ts`

**Step 1: Create hooks.server.ts for Convex**

```typescript
import type { Handle } from "@sveltejs/kit"
import { ConvexHttpClient } from "convex/browser"
import { PUBLIC_CONVEX_URL } from "$env/static/public"

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.convex = new ConvexHttpClient(PUBLIC_CONVEX_URL)
  return resolve(event)
}
```

**Step 2: Commit**

```bash
git add sveltekit/convex/src/hooks.server.ts && git commit -m "feat(sveltekit-convex): add server hooks"
```

---

## Phase 5: Supabase OTP Migration

### Task 20: Add OTP Auth Service to Supabase Variants

**Files:**
- Create: `nextjs/supabase/src/lib/supabase/auth.ts`
- Create: `sveltekit/supabase/src/lib/supabase/auth.ts`

**Step 1: Create Next.js Supabase auth service**

```typescript
import { createClient } from "./client"

export const SupabaseAuth = {
  async sendOTP(email: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    })
    if (error) throw error
    return { success: true }
  },

  async verifyOTP(email: string, token: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
}
```

**Step 2: Create SvelteKit Supabase auth service**

```typescript
import { createClient } from "./client"

export const SupabaseAuth = {
  async sendOTP(email: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    })
    if (error) throw error
    return { success: true }
  },

  async verifyOTP(email: string, token: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
}
```

**Step 3: Update index.ts exports**

Add to both `nextjs/supabase/src/lib/supabase/index.ts` and `sveltekit/supabase/src/lib/supabase/index.ts`:

```typescript
export { SupabaseAuth } from "./auth"
```

**Step 4: Commit**

```bash
git add nextjs/supabase/src/lib/supabase/ sveltekit/supabase/src/lib/supabase/ && git commit -m "feat: add OTP auth service to Supabase variants"
```

---

## Phase 6: README Updates

### Task 21: Update Main README

**Files:**
- Modify: `README.md`

**Step 1: Rewrite README.md**

```markdown
# Vibe Starter

Production-ready starter templates with your choice of backend. Pick your framework and database, then start building.

## Quick Start

```bash
git clone <repo> my-project
cd my-project
./setup.sh <variant>
pnpm install
pnpm dev
```

## Variants

| Command | Framework | Backend | Auth |
|---------|-----------|---------|------|
| `./setup.sh nextjs-supabase` | Next.js 16 | Supabase | Email OTP |
| `./setup.sh nextjs-convex` | Next.js 16 | Convex | Email OTP |
| `./setup.sh sveltekit-supabase` | SvelteKit 2 | Supabase | Email OTP |
| `./setup.sh sveltekit-convex` | SvelteKit 2 | Convex | Email OTP |

## Features

- **Japanese Coding Principles**: 簡潔 (simplicity), 純粋 (purity), 効率 (efficiency)
- **Const Service Pattern**: Organized, discoverable code with IDE autocomplete
- **Email OTP Auth**: Passwordless authentication out of the box
- **Stripe Integration**: Payments ready (direct SDK for Supabase, component for Convex)
- **TailwindCSS 4**: Latest version with CSS-first configuration
- **TypeScript Strict**: Full type safety
- **AI-Optimized**: `.claude/` documentation for Claude Code

## Backend Comparison

| Feature | Supabase | Convex |
|---------|----------|--------|
| Database | PostgreSQL | Document DB |
| Real-time | Realtime subscriptions | Built-in reactive queries |
| Auth | Supabase Auth (OTP) | Convex Auth (OTP) |
| Stripe | Direct SDK | @convex-dev/stripe component |
| Query Language | SQL | TypeScript functions |
| Self-hosting | Yes | No |

## Project Structure

```
vibe-starter/
├── .claude/              # AI development guidelines
├── .mcp.json             # MCP server configuration (Convex)
├── .env.example.supabase # Supabase env template
├── .env.example.convex   # Convex env template
├── setup.sh              # 4-variant setup script
├── nextjs/
│   ├── supabase/         # Next.js + Supabase
│   └── convex/           # Next.js + Convex
└── sveltekit/
    ├── supabase/         # SvelteKit + Supabase
    └── convex/           # SvelteKit + Convex
```

## Documentation

Read `.claude/CLAUDE.md` before starting development.

## License

MIT
```

**Step 2: Commit**

```bash
git add README.md && git commit -m "docs: update main README for 4 variants"
```

---

### Task 22: Update Next.js Supabase README

**Files:**
- Modify: `nextjs/supabase/README.md`

**Step 1: Update README**

```markdown
# Vibe Starter - Next.js + Supabase

Next.js 16 starter with Supabase, TailwindCSS 4, and TypeScript.

## Getting Started

```bash
pnpm install
cp ../../.env.example.supabase .env.local
# Edit .env.local with your Supabase credentials
pnpm dev
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase OTP (passwordless)
- **Payments**: Stripe (direct SDK)
- **Styling**: TailwindCSS 4
- **UI**: shadcn/ui

## Auth (OTP)

```typescript
import { SupabaseAuth } from "@/lib/supabase"

// Send OTP
await SupabaseAuth.sendOTP("user@example.com")

// Verify OTP
await SupabaseAuth.verifyOTP("user@example.com", "123456")

// Sign out
await SupabaseAuth.signOut()
```

## Documentation

See `../../.claude/CLAUDE.md` for development guidelines.
```

**Step 2: Commit**

```bash
git add nextjs/supabase/README.md && git commit -m "docs: update Next.js Supabase README"
```

---

### Task 23: Create Next.js Convex README

**Files:**
- Create: `nextjs/convex/README.md`

**Step 1: Create README**

```markdown
# Vibe Starter - Next.js + Convex

Next.js 16 starter with Convex, TailwindCSS 4, and TypeScript.

## Getting Started

```bash
pnpm install
npx convex dev  # Initialize Convex project
cp ../../.env.example.convex .env.local
# Edit .env.local with your Convex credentials
pnpm dev
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Convex (reactive document DB)
- **Auth**: Convex Auth OTP (passwordless)
- **Payments**: @convex-dev/stripe component
- **Styling**: TailwindCSS 4
- **UI**: shadcn/ui

## Auth (OTP)

```typescript
import { useConvexAuth } from "@/lib/convex"

function LoginForm() {
  const { sendOTP, verifyOTP, signOut } = useConvexAuth()

  // Send OTP
  await sendOTP("user@example.com")

  // Verify OTP
  await verifyOTP("user@example.com", "123456")

  // Sign out
  await signOut()
}
```

## Convex Queries

```typescript
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"

// Reactive query
const orgs = useQuery(api.organizations.list)

// Mutation
const createOrg = useMutation(api.organizations.create)
await createOrg({ name: "My Org" })
```

## Documentation

See `../../.claude/CLAUDE.md` for development guidelines.
```

**Step 2: Commit**

```bash
git add nextjs/convex/README.md && git commit -m "docs: add Next.js Convex README"
```

---

### Task 24: Update SvelteKit Supabase README

**Files:**
- Modify: `sveltekit/supabase/README.md`

**Step 1: Update README**

```markdown
# Vibe Starter - SvelteKit + Supabase

SvelteKit 2 starter with Svelte 5, Supabase, TailwindCSS 4, and TypeScript.

## Getting Started

```bash
pnpm install
cp ../../.env.example.supabase .env
# Edit .env with your Supabase credentials
pnpm dev
```

## Tech Stack

- **Framework**: SvelteKit 2 + Svelte 5 (Runes)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase OTP (passwordless)
- **Payments**: Stripe (direct SDK)
- **Styling**: TailwindCSS 4
- **UI**: bits-ui

## Auth (OTP)

```typescript
import { SupabaseAuth } from "$lib/supabase"

// Send OTP
await SupabaseAuth.sendOTP("user@example.com")

// Verify OTP
await SupabaseAuth.verifyOTP("user@example.com", "123456")

// Sign out
await SupabaseAuth.signOut()
```

## Documentation

See `../../.claude/CLAUDE.md` for development guidelines.
```

**Step 2: Commit**

```bash
git add sveltekit/supabase/README.md && git commit -m "docs: update SvelteKit Supabase README"
```

---

### Task 25: Create SvelteKit Convex README

**Files:**
- Create: `sveltekit/convex/README.md`

**Step 1: Create README**

```markdown
# Vibe Starter - SvelteKit + Convex

SvelteKit 2 starter with Svelte 5, Convex, TailwindCSS 4, and TypeScript.

## Getting Started

```bash
pnpm install
npx convex dev  # Initialize Convex project
cp ../../.env.example.convex .env
# Edit .env with your Convex credentials
pnpm dev
```

## Tech Stack

- **Framework**: SvelteKit 2 + Svelte 5 (Runes)
- **Database**: Convex (reactive document DB)
- **Auth**: Convex Auth OTP (passwordless)
- **Payments**: @convex-dev/stripe component
- **Styling**: TailwindCSS 4
- **UI**: bits-ui

## Auth (OTP)

```svelte
<script lang="ts">
  import { useConvexAuth } from "$lib/convex"

  const { sendOTP, verifyOTP, signOut } = useConvexAuth()
</script>
```

## Convex Queries

```svelte
<script lang="ts">
  import { useQuery, useMutation } from "convex-svelte"
  import { api } from "../../convex/_generated/api"

  // Reactive query
  const orgs = useQuery(api.organizations.list, {})

  // Mutation
  const createOrg = useMutation(api.organizations.create)
</script>

{#each $orgs ?? [] as org}
  <p>{org.name}</p>
{/each}
```

## Documentation

See `../../.claude/CLAUDE.md` for development guidelines.
```

**Step 2: Commit**

```bash
git add sveltekit/convex/README.md && git commit -m "docs: add SvelteKit Convex README"
```

---

## Phase 7: Documentation Updates

### Task 26: Update CLAUDE.md

**Files:**
- Modify: `.claude/CLAUDE.md`

**Step 1: Update tech stack section**

Add Convex to tech stack:

```markdown
## Tech Stack

**Core**: Next.js 16 or SvelteKit 2 + TypeScript 5.x + TailwindCSS 4.x
**Database**: Supabase (PostgreSQL) OR Convex (Document DB)
**Auth**: Email OTP (both backends)
**Package Manager**: PNPM 10.x
**Node**: >= 22.0.0
```

**Step 2: Commit**

```bash
git add .claude/CLAUDE.md && git commit -m "docs: update CLAUDE.md for dual-backend support"
```

---

### Task 27: Create deps/convex.md

**Files:**
- Create: `.claude/deps/convex.md`

**Step 1: Create Convex documentation**

```markdown
# Convex Integration

Convex is a reactive backend with built-in real-time subscriptions.

## When to Use

- Real-time collaborative apps
- Rapid prototyping (no migrations needed)
- TypeScript-first development
- Apps needing reactive data

## Schema

Define tables in `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    stripeCustomerId: v.optional(v.string()),
  }),
})
```

## Queries & Mutations

```typescript
// convex/organizations.ts
import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("organizations").collect()
  },
})

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("organizations", {
      name: args.name,
      createdAt: Date.now(),
    })
  },
})
```

## Auth (OTP)

Uses `@convex-dev/auth` with ResendOTP provider:

```typescript
// convex/auth.ts
import { convexAuth } from "@convex-dev/auth/server"
import { ResendOTP } from "@convex-dev/auth/providers/ResendOTP"

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [ResendOTP({ apiKey: process.env.RESEND_API_KEY })],
})
```

## Stripe Integration

Uses `@convex-dev/stripe` component for automatic webhook handling:

```typescript
import { StripeSubscriptions } from "@convex-dev/stripe"

export const stripe = new StripeSubscriptions(components.stripe, {
  prices: { default: process.env.STRIPE_PRICE_ID },
})
```

## MCP Server

Configure in `.mcp.json` for Claude Code integration:

```json
{
  "mcpServers": {
    "convex": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/convex-mcp-server"]
    }
  }
}
```
```

**Step 2: Commit**

```bash
git add .claude/deps/convex.md && git commit -m "docs: add Convex documentation"
```

---

### Task 28: Create deps/supabase.md

**Files:**
- Create: `.claude/deps/supabase.md`

**Step 1: Create Supabase documentation**

```markdown
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
```

**Step 2: Commit**

```bash
git add .claude/deps/supabase.md && git commit -m "docs: add Supabase documentation"
```

---

### Task 29: Final Verification

**Step 1: Verify directory structure**

```bash
ls -la nextjs/
ls -la sveltekit/
ls -la nextjs/supabase/src/lib/
ls -la nextjs/convex/src/lib/
```

**Step 2: Verify all commits**

```bash
git log --oneline -20
```

**Step 3: Run type check on a variant (optional)**

```bash
cd nextjs/supabase && pnpm install && pnpm exec tsc --noEmit
```

---

## Summary

This plan creates 4 complete variants:

1. **nextjs-supabase**: Next.js 16 + Supabase + OTP auth + Stripe SDK
2. **nextjs-convex**: Next.js 16 + Convex + OTP auth + Stripe component
3. **sveltekit-supabase**: SvelteKit 2 + Supabase + OTP auth + Stripe SDK
4. **sveltekit-convex**: SvelteKit 2 + Convex + OTP auth + Stripe component

Each variant is standalone with no shared runtime code.
