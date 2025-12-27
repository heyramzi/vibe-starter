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

## Client Usage (Next.js)

```typescript
import { useConvexAuth } from "@/lib/convex"

function LoginForm() {
  const { sendOTP, verifyOTP, signOut } = useConvexAuth()

  // Send OTP
  await sendOTP("user@example.com")

  // Verify
  await verifyOTP("user@example.com", "123456")
}
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
