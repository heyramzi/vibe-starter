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

## Project Structure

```
src/
├── app/                    # Next.js app router
├── components/
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── convex/             # Convex client + auth
│   └── utils.ts            # Utilities
├── hooks/                  # Custom React hooks
└── types/                  # Shared TypeScript types
convex/
├── schema.ts               # Database schema
├── auth.ts                 # Auth configuration
└── http.ts                 # HTTP routes
```

## Commands

```bash
pnpm dev           # Start development server
npx convex dev     # Start Convex dev server
pnpm build         # Build for production
pnpm test:run      # Run tests
```

## Documentation

See `../../.claude/CLAUDE.md` for development guidelines.
