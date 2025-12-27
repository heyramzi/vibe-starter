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

## Project Structure

```
src/
├── app/                    # Next.js app router
├── components/
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── supabase/           # Supabase clients + auth
│   ├── stripe/             # Stripe integration
│   └── utils.ts            # Utilities (cn helper)
├── hooks/                  # Custom React hooks
└── types/                  # Shared TypeScript types
```

## Commands

```bash
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm test:run      # Run tests
pnpm lint          # Lint code
```

## Documentation

See `../../.claude/CLAUDE.md` for development guidelines.
